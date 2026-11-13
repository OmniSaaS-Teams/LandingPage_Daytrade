"use client";

import { type FormEvent, useRef, useState } from "react";
import styles from "../../app/carreira/Careers.module.css";

export function CareerForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const sending = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("curriculo");
    if (!(file instanceof File) || !file.size || file.size > 5 * 1024 * 1024 || !/\.(pdf|doc|docx)$/i.test(file.name)) {
      setStatus("error");
      setMessage("Anexe um currículo em PDF, DOC ou DOCX de até 5 MB.");
      return;
    }
    sending.current = true;
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/careers", { method: "POST", body: data, signal: AbortSignal.timeout(25_000) });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error(result.error || "Não foi possível confirmar o envio. Tente novamente.");
      form.reset();
      setStatus("success");
      setMessage("Currículo enviado! Obrigado por compartilhar sua trajetória com a DayTrade.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error && error.name === "Error" ? error.message : "Não foi possível confirmar o envio. Verifique sua conexão e tente novamente.");
    } finally {
      sending.current = false;
    }
  }

  return (
    <form className={styles.form} onSubmit={submit} encType="multipart/form-data" aria-busy={status === "sending"}>
      <h3>Conte sua história.</h3>
      <p className={styles.formIntro}>Preencha seus dados e anexe seu currículo.<br />Os campos com * são obrigatórios.</p>
      <fieldset className={styles.fields} disabled={status === "sending"}>
        <label className={styles.field} htmlFor="career-name">Nome completo *<input id="career-name" name="nome" autoComplete="name" placeholder="Como podemos chamar você?" required maxLength={200} /></label>
        <div className={styles.twoColumns}>
          <label className={styles.field} htmlFor="career-email">E-mail *<input id="career-email" name="email" type="email" autoComplete="email" placeholder="voce@email.com" required maxLength={254} /></label>
          <label className={styles.field} htmlFor="career-phone">Telefone *<input id="career-phone" name="telefone" type="tel" autoComplete="tel" placeholder="(15) 99999-9999" required maxLength={30} /></label>
        </div>
        <label className={styles.field} htmlFor="career-area">Área de interesse *<select id="career-area" name="area" required defaultValue=""><option value="" disabled>Selecione uma área</option><option>Comercial e relacionamento</option><option>Crédito e operações</option><option>Administrativo e financeiro</option><option>Tecnologia e dados</option><option>Outras áreas</option></select></label>
        <label className={styles.field} htmlFor="career-message">Um pouco sobre você <textarea id="career-message" name="mensagem" maxLength={2000} placeholder="Sua experiência, seus interesses e o que busca para o próximo passo." /></label>
        <label className={styles.upload} htmlFor="career-file"><span className={styles.uploadHeading}>Seu currículo * <span aria-hidden="true">↑</span></span><small>PDF, DOC ou DOCX · até 5 MB</small><input id="career-file" name="curriculo" type="file" accept=".pdf,.doc,.docx" required /></label>
        <label className={styles.consent}><input name="consentimento" type="checkbox" required value="true" /><span>Autorizo a DayTrade a utilizar meus dados e currículo para avaliar meu perfil e entrar em contato sobre oportunidades profissionais. *</span></label>
      </fieldset>
      {message && <p className={`${styles.status} ${status === "error" ? styles.error : ""}`} role={status === "error" ? "alert" : "status"}>{message}</p>}
      <button className={`${styles.primaryButton} ${styles.submit}`} type="submit" disabled={status === "sending"}>{status === "sending" ? "Enviando currículo…" : "Enviar meu currículo"}<span aria-hidden="true">↗</span></button>
    </form>
  );
}
