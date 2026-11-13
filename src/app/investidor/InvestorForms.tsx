"use client";

import { useRef, useState, type FormEvent } from "react";
import styles from "./Investor.module.css";

const currency = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

async function sendInterest(data: Record<string, unknown>) {
  const response = await fetch("/api/investor-leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, pagina_origem: window.location.href }),
  });
  const result = await response.json();
  if (!response.ok || result.success !== true) {
    throw new Error(result.error || "Não foi possível enviar seus dados. Tente novamente.");
  }
}

export function InvestmentSimulator() {
  const [result, setResult] = useState<{ name: string; amount: number; years: number } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inProgress = useRef(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  async function simulate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inProgress.current) return;
    const data = new FormData(event.currentTarget);
    const rawAmount = String(data.get("valor") ?? "").trim();
    const amount = /^\d+(?:\.\d{3})*(?:,\d{1,2})?$/.test(rawAmount)
      ? Number(rawAmount.replaceAll(".", "").replace(",", ".")) : NaN;
    const years = Number(data.get("periodo"));
    if (!Number.isFinite(amount) || amount < 50000 || amount > 1_000_000_000) {
      setError("Informe um valor entre R$ 50.000,00 e R$ 1.000.000.000,00, usando vírgula para os centavos.");
      return;
    }
    const name = String(data.get("nome") ?? "").trim();
    inProgress.current = true;
    setBusy(true);
    setError("");
    try {
      await sendInterest({ nome: name, email: data.get("email"), telefone: data.get("telefone"), valor: amount, periodo: String(years), origem: "simulador_investimento" });
      setResult({ name, amount, years });
      requestAnimationFrame(() => {
        resultRef.current?.focus({ preventScroll: true });
        resultRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "center" });
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Verifique sua conexão e tente novamente.");
    } finally {
      inProgress.current = false;
      setBusy(false);
    }
  }

  // Fixed illustrative assumptions retained from the supplied reference, not a live market quotation.
  const annualCdi = 0.1125;
  const comparisons = result ? [
    { label: "Poupança", rate: "69% do CDI*", value: result.amount * (1 + annualCdi * 0.69) ** result.years },
    { label: "CDB", rate: "100% do CDI*", value: result.amount * (1 + annualCdi) ** result.years },
    { label: "DayTrade", rate: "120% do CDI*", value: result.amount * (1 + annualCdi * 1.2) ** result.years },
  ] : [];

  return (
    <>
      <div className={styles.simulatorHeading}>
        <p className={styles.eyebrow}>Planeje o próximo passo</p>
        <h2 id="simulation-title" ref={titleRef} tabIndex={-1}>Veja o que seu capital<br />pode construir.</h2>
        <p>Informe o valor e o prazo para visualizar uma projeção ilustrativa do investimento.</p>
      </div>
      {result ? (
        <div ref={resultRef} className={styles.results} tabIndex={-1} aria-label="Resultado da simulação">
          <div className={styles.resultCopy}>
            <span className={styles.eyebrow}>Sua simulação</span>
            <h3>Olá, {result.name.split(/\s+/)[0]}.</h3>
            <p>Com {currency(result.amount)} em {result.years} {result.years === 1 ? "ano" : "anos"}, o saldo bruto projetado seria de</p>
            <strong className={styles.resultTotal}>{currency(comparisons[2].value)}</strong>
            <p>Rendimento bruto: {currency(comparisons[2].value - result.amount)}</p>
            <a className={styles.primaryButton} href="#contato">Conversar sobre meu investimento <span aria-hidden="true">↗</span></a>
            <button type="button" className={styles.resetButton} onClick={() => { setResult(null); requestAnimationFrame(() => titleRef.current?.focus()); }}>Fazer uma nova simulação</button>
          </div>
          <div>
            <h3 className={styles.chartTitle}>Compare os cenários ilustrativos</h3>
            <div className={styles.chart}>
              {comparisons.map((item, index) => (
                <div key={item.label} className={styles.chartColumn}>
                  <strong>{currency(item.value)}</strong>
                  <div className={`${styles.bar} ${index === 2 ? styles.highlightBar : ""}`} style={{ height: `${item.value / comparisons[2].value * 190}px` }} />
                  <span>{item.label}</span><small>{item.rate}</small>
                </div>
              ))}
            </div>
            <p className={styles.disclaimer}>* Cenários calculados com CDI hipotético e fixo de 11,25% a.a., juros compostos anuais e sem novos aportes. Os percentuais de 69%, 100% e 120% são premissas ilustrativas da referência, não taxas vigentes ou uma oferta. Valores brutos, sem impostos, taxas ou inflação. Não garantem rentabilidade futura; os produtos podem ter riscos, liquidez e tributação distintos.</p>
          </div>
        </div>
      ) : (
        <div className={styles.simulatorGrid}>
          <form className={styles.formCard} onSubmit={simulate} aria-busy={busy}>
            <fieldset disabled={busy} className={styles.formFields}>
              <div className={styles.formRow}>
                <label htmlFor="investment-amount">Valor pretendido (R$)<input id="investment-amount" name="valor" type="text" inputMode="decimal" defaultValue="50.000,00" aria-describedby="investment-minimum" required maxLength={20} /><small id="investment-minimum">A partir de R$ 50.000,00</small></label>
                <label htmlFor="investment-period">Prazo do investimento<select id="investment-period" name="periodo" defaultValue="1" required><option value="1">1 ano</option><option value="3">3 anos</option><option value="5">5 anos</option></select></label>
              </div>
              <label htmlFor="investment-name">Nome completo<input id="investment-name" name="nome" autoComplete="name" placeholder="Como podemos chamar você?" required maxLength={200} /></label>
              <div className={styles.formRow}>
                <label htmlFor="investment-email">E-mail<input id="investment-email" name="email" type="email" autoComplete="email" placeholder="voce@email.com" required maxLength={254} /></label>
                <label htmlFor="investment-phone">Telefone com DDD<input id="investment-phone" name="telefone" type="tel" autoComplete="tel" placeholder="(15) 99999-9999" required maxLength={25} /></label>
              </div>
              <p className={styles.formNote}>Ao simular, você envia seus dados à DayTrade para contato sobre seu interesse em investimentos.</p>
              <button type="submit" className={styles.primaryButton}>{busy ? "Enviando dados…" : "Simular meu investimento"}<span aria-hidden="true">↗</span></button>
            </fieldset>
            {error && <p role="alert" className={styles.formError}>{error}</p>}
          </form>
          <div className={styles.simulatorBenefits}>
            <h3>Um ponto de partida para a sua decisão.</h3>
            <div><span>01</span><div><h4>Escolha seu horizonte</h4><p>Compare o potencial do seu capital em um, três ou cinco anos.</p></div></div>
            <div><span>02</span><div><h4>Visualize os cenários</h4><p>Veja uma estimativa de saldo e rendimento para o valor informado.</p></div></div>
            <div><span>03</span><div><h4>Converse sem compromisso</h4><p>Entenda a estrutura e as condições disponíveis com nossa equipe.</p></div></div>
            <p className={styles.disclaimer}>Simulação ilustrativa com taxas fixas hipotéticas, sem garantia de retorno. Todo investimento possui riscos. As condições e o perfil do investidor estão sujeitos a análise e aprovação.</p>
          </div>
        </div>
      )}
    </>
  );
}

export function InvestorContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [error, setError] = useState("");
  const inProgress = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inProgress.current || status === "success") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    inProgress.current = true;
    setStatus("sending");
    setError("");
    try {
      await sendInterest({ nome: data.get("nome"), email: data.get("email"), perfil: data.get("perfil"), origem: "solicitar_apresentacao" });
      form.reset();
      setStatus("success");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Verifique sua conexão e tente novamente.");
      setStatus("idle");
    } finally { inProgress.current = false; }
  }

  return (
    <form className={styles.contactForm} onSubmit={submit} aria-busy={status === "sending"}>
      <fieldset className={styles.formFields} disabled={status !== "idle"}>
        <label htmlFor="investor-contact-name">Nome<input id="investor-contact-name" name="nome" autoComplete="name" placeholder="Seu nome completo" required maxLength={200} /></label>
        <label htmlFor="investor-contact-email">E-mail<input id="investor-contact-email" name="email" type="email" autoComplete="email" placeholder="voce@email.com" required maxLength={254} /></label>
        <label htmlFor="investor-contact-profile">Perfil<select id="investor-contact-profile" name="perfil" required defaultValue=""><option value="" disabled>Selecione seu perfil</option><option>Investidor pessoa física</option><option>Investidor pessoa jurídica</option><option>Parceiro comercial</option><option>Outro</option></select></label>
        <p className={styles.formNote}>Seus dados serão enviados à DayTrade para contato e apresentação da estrutura de investimento.</p>
        <button type="submit" className={styles.primaryButton}>{status === "sending" ? "Enviando…" : status === "success" ? "Interesse enviado" : "Solicitar apresentação"}<span aria-hidden="true">↗</span></button>
      </fieldset>
      {error && <p className={styles.formError} role="alert">{error}</p>}
      {status === "success" && <p className={styles.formSuccess} role="status">Recebemos seu interesse. Nossa equipe entrará em contato.</p>}
    </form>
  );
}
