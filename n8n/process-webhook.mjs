/** Shared source for the standalone n8n Code node. No application imports. */
export async function processWebhook(item, { executionId, receivedAt, readBinary }) {
  const input = item.json || {};
  const headers = input.headers || {};
  const header = (name) => {
    const entry = Object.entries(headers).find(([key]) => key.toLowerCase() === name);
    return entry ? String(entry[1]) : null;
  };
  const contentType = header("content-type") || "";
  const mime = contentType.split(";")[0].trim().toLowerCase();
  const multipart = mime === "multipart/form-data";
  const binary = item.binary || {};
  const warnings = [];
  let data = input.body === undefined ? null : input.body;
  let format = multipart ? "multipart" : "desconhecido";
  let rawText;

  // Raw Body keeps the original bytes under binary.data. Multipart keeps each
  // uploaded file separately, including files whose field name happens to be data.
  const rawBody = !multipart && Object.hasOwn(binary, "data");
  const textual = /^text\//.test(mime) || /(?:\/|\+)(?:json|xml)$/.test(mime)
    || mime === "application/x-www-form-urlencoded";
  if (rawBody && (textual || !mime || mime === "application/octet-stream")) {
    const buffer = await readBinary("data");
    const charset = /charset\s*=\s*["']?([^;\s"']+)/i.exec(contentType)?.[1]?.toLowerCase() || "utf-8";
    const encodings = { "utf-8": "utf8", utf8: "utf8", "utf-16le": "utf16le", utf16le: "utf16le", "iso-8859-1": "latin1", latin1: "latin1", ascii: "ascii", "us-ascii": "ascii" };
    if (Object.hasOwn(encodings, charset)) {
      const decoded = buffer.toString(encodings[charset]);
      if (textual || (!decoded.includes("\uFFFD") && !/[\x00-\x08\x0E-\x1F]/.test(decoded))) rawText = decoded;
    } else {
      warnings.push("Charset não interpretado; os bytes originais foram preservados.");
    }
  }

  const jsonMime = /(?:\/|\+)json$/.test(mime);
  const xmlMime = /(?:\/|\+)xml$/.test(mime);
  const formMime = mime === "application/x-www-form-urlencoded";
  if (!multipart) {
    if (rawText === "" && input.body === undefined) {
      data = null;
      format = "vazio";
    } else if (formMime) {
      // Prefer n8n's parsed form: it preserves repeated keys as arrays.
      if (input.body !== undefined && input.body !== null && typeof input.body === "object") {
        data = input.body;
      } else if (typeof rawText === "string" || typeof input.body === "string") {
        // No URLSearchParams dependency: Code runners expose different globals.
        const pairs = (rawText ?? input.body).split("&").filter(Boolean);
        const entries = new Map();
        const decode = (value) => {
          try { return decodeURIComponent(value.replace(/\+/g, " ")); }
          catch { warnings.push("Escape de formulário inválido; valor preservado."); return value; }
        };
        for (const pair of pairs) {
          const separator = pair.indexOf("=");
          const key = decode(separator < 0 ? pair : pair.slice(0, separator));
          const value = decode(separator < 0 ? "" : pair.slice(separator + 1));
          if (!entries.has(key)) entries.set(key, value);
          else entries.set(key, [...(Array.isArray(entries.get(key)) ? entries.get(key) : [entries.get(key)]), value]);
        }
        data = Object.fromEntries(entries);
      }
      format = "form-urlencoded";
    } else if (xmlMime) {
      // n8n parses XML before this node; raw bytes remain available in binary.data.
      data = input.body === undefined ? (rawText ?? null) : input.body;
      format = "xml";
    } else {
      const candidate = typeof rawText === "string" ? rawText : typeof data === "string" ? data : undefined;
      if (candidate !== undefined && (jsonMime || !mime || mime === "application/octet-stream" || mime === "text/plain")) {
        try {
          data = JSON.parse(candidate.replace(/^\uFEFF/, ""));
          format = "json";
        } catch {
          data = candidate;
          format = "texto";
          if (jsonMime) warnings.push("JSON não interpretado; conteúdo mantido como texto.");
        }
      } else if (input.body !== undefined) {
        format = jsonMime || (data !== null && typeof data === "object") ? "json" : "texto";
      } else if (rawText !== undefined) {
        data = rawText;
        format = "texto";
      } else if (rawBody || Object.keys(binary).length) {
        format = "binario";
      } else {
        format = "vazio";
      }
    }
  }

  // JSON Pointer paths distinguish dotted keys, slashes, arrays and nested data.
  // Bounds apply only to the searchable index; data and binary remain complete.
  const fields = [];
  const stack = [{ value: data, path: "", key: "", depth: 0 }];
  const escape = (key) => String(key).replace(/~/g, "~0").replace(/\//g, "~1");
  let depthWarning = false;
  while (stack.length) {
    if (fields.length >= 10000) {
      warnings.push("Índice limitado a 10.000 campos; payload integral preservado em dados.");
      break;
    }
    const current = stack.pop();
    const value = current.value;
    const type = value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
    const entries = value !== null && typeof value === "object" ? Object.entries(value) : [];
    if (entries.length && current.depth < 64) {
      for (let index = entries.length - 1; index >= 0; index--) {
        const [key, child] = entries[index];
        stack.push({ value: child, path: `${current.path}/${escape(key)}`, key: Array.isArray(value) ? current.key : key, depth: current.depth + 1 });
      }
    } else {
      fields.push({ caminho: current.path, chave: current.key, tipo: type, valor: value });
      if (entries.length && !depthWarning) {
        warnings.push("Índice limitado a 64 níveis; estruturas profundas preservadas em dados.");
        depthWarning = true;
      }
    }
  }

  // Optional hints, never required fields or a reason to reject an unfamiliar payload.
  const aliases = {
    nome: ["nome", "name", "fullname", "nomecompleto"],
    email: ["email", "emailaddress", "mail"],
    telefone: ["telefone", "phone", "phonenumber", "celular", "mobile", "whatsapp"],
    documento: ["cpf", "cnpj", "documento", "document"],
    empresa: ["empresa", "company", "companyname", "razaosocial"],
    origem: ["origem", "source"],
  };
  const identified = Object.fromEntries(Object.keys(aliases).map((key) => [key, []]));
  for (const field of fields) {
    if (field.tipo !== "string" && field.tipo !== "number") continue;
    const key = field.chave.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    for (const [name, names] of Object.entries(aliases)) {
      if (names.includes(key)) identified[name].push({ caminho: field.caminho, valor: field.valor });
    }
  }
  const files = Object.entries(binary).map(([key, file]) => ({
    campo: key,
    papel: rawBody && key === "data" ? "corpo_original" : "anexo",
    nome: file.fileName ?? null,
    mimeType: file.mimeType ?? null,
    tamanhoInformado: file.fileSize ?? null,
  }));
  const idempotencyKey = header("idempotency-key");
  const id = idempotencyKey || `n8n:${executionId}`;
  const json = {
    versao: 1,
    recebimento: { id, executionId: String(executionId), recebidoEm: receivedAt, idempotencyKey, contentType: contentType || null, formato: format },
    dados: data,
    campos: fields,
    identificados: identified,
    arquivos: files,
    contexto: { headers, query: input.query ?? {}, params: input.params ?? {}, webhookUrl: input.webhookUrl ?? null, executionMode: input.executionMode ?? null },
    avisos: warnings,
    resposta: { success: true, id, executionId: String(executionId), formato: format, totalCampos: fields.length, totalAnexos: files.filter((file) => file.papel === "anexo").length },
  };
  return Object.keys(binary).length ? { json, binary } : { json };
}
