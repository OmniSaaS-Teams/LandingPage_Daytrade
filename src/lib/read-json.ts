export class BodyTooLargeError extends Error {}
export async function readJson(request: Request, limit = 32 * 1024): Promise<unknown> {
  if (Number(request.headers.get("content-length")) > limit) throw new BodyTooLargeError();
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Corpo vazio.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    size += chunk.value.byteLength;
    if (size > limit) { await reader.cancel(); throw new BodyTooLargeError(); }
    chunks.push(chunk.value);
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(body));
}
