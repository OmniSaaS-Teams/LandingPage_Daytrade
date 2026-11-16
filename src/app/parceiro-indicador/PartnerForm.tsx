"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./Partner.module.css";

export function PartnerForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [error, setError] = useState("");
  const sending = useRef(false);
  const submitButton = useRef<HTMLButtonElement>(null);
  const successDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (status !== "success") return;
    const dialog = successDialog.current;
    if (!dialog) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [status]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current || status === "success") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    sending.current = true;
    setStatus("sending");
    setError("");

    try {
      const response = await fetch("/api/partner-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data)),
        signal: AbortSignal.timeout(15_000),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error(result.error || "Não foi possível confirmar seu cadastro. Tente novamente.");
      form.reset();
      setStatus("success");
    } catch (cause) {
      setError(cause instanceof Error && cause.name === "Error" ? cause.message : "Não foi possível enviar. Verifique sua conexão e tente novamente.");
      setStatus("idle");
    } finally {
      sending.current = false;
    }
  }

  return (
    <>
    <form className={styles.form} onSubmit={submit} aria-label="Cadastro de parceiro indicador" aria-busy={status === "sending"}>
      <fieldset disabled={status !== "idle"} className={styles.fields}>
        <legend className={styles.srOnly}>Dados para a parceria</legend>
        <label className={styles.field}><span>Nome</span><input name="nome" placeholder="Seu nome" autoComplete="name" maxLength={200} required /></label>
        <label className={styles.field}><span>E-mail</span><input name="email" type="email" placeholder="voce@empresa.com" autoComplete="email" maxLength={254} required /></label>
        <label className={styles.field}><span>Telefone ou Celular</span><input name="telefone" type="tel" placeholder="(DDD) 99999-9999" autoComplete="tel" maxLength={25} pattern="[0-9\s\(\)\+\.\-]{10,25}" title="Informe o telefone ou celular com DDD." required /></label>
        <label className={styles.field}><span>Tem carteira própria?</span><select name="experiencia" defaultValue="" required><option value="" disabled>Selecione</option><option value="sim">Sim</option><option value="nao">Não</option></select></label>
      </fieldset>
      {error && <p className={styles.formError} role="alert">{error}</p>}
      <div className={styles.formActions}>
        <p>Ao enviar, você autoriza nosso contato sobre a parceria.</p>
        <button ref={submitButton} className={styles.submit} type="submit" disabled={status !== "idle"}>
          <span aria-live="polite">{status === "sending" ? "Enviando…" : "Quero ser parceiro"}</span>
          {status === "sending" ? <span className={styles.spinner} aria-hidden="true" /> : <span aria-hidden="true">↗</span>}
        </button>
      </div>
    </form>
    {status === "success" && createPortal(
      <dialog
        ref={successDialog}
        className={styles.successDialog}
        aria-labelledby="partner-success-title"
        aria-describedby="partner-success-description"
        onClose={() => {
          setStatus("idle");
          window.requestAnimationFrame(() => submitButton.current?.focus());
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) successDialog.current?.close();
        }}
      >
        <div className={styles.successContent}>
          <button className={styles.closeDialog} type="button" aria-label="Fechar confirmação" onClick={() => successDialog.current?.close()}>×</button>
          <span className={styles.successIcon} aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg></span>
          <h2 id="partner-success-title">Cadastro enviado!</h2>
          <p id="partner-success-description">Recebemos seus dados. Nossa equipe entrará em contato para conversar sobre a parceria.</p>
          <button className={styles.confirmDialog} type="button" onClick={() => successDialog.current?.close()}>Entendi</button>
        </div>
      </dialog>,
      document.body,
    )}
    </>
  );
}
