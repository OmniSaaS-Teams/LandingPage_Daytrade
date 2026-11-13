"use client";

import { useRef, useState, type FormEvent } from "react";

export const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
type Simulation = { name: string; amount: number; years: number; date: string };

async function sendInterest(data: Record<string, unknown>) {
  const response = await fetch("/api/investor-leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, pagina_origem: window.location.href }),
  });
  const result = await response.json();
  if (!response.ok || result.success !== true) {
    throw new Error(result.error || "Ocorreu um erro ao enviar. Tente novamente mais tarde.");
  }
}

export function useInvestorForms() {
  const [result, setResult] = useState<Simulation | null>(null);
  const [simulationBusy, setSimulationBusy] = useState(false);
  const [simulationError, setSimulationError] = useState("");
  const [contactBusy, setContactBusy] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState("");
  const simulationInProgress = useRef(false);
  const contactInProgress = useRef(false);
  const resultRef = useRef<HTMLDivElement>(null);

  async function simulate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (simulationInProgress.current) return;
    const data = new FormData(event.currentTarget);
    const rawAmount = String(data.get("valorInvestir") ?? "").trim();
    const amount = /^\d+(?:\.\d{3})*(?:,\d{1,2})?$/.test(rawAmount)
      ? Number(rawAmount.replaceAll(".", "").replace(",", ".")) : NaN;
    const years = Number(data.get("periodoInvestir"));
    if (!Number.isFinite(amount) || amount < 50000) {
      setSimulationError("O valor mínimo para investimento é R$ 50.000,00");
      return;
    }
    const name = String(data.get("nomeCompleto") ?? "").trim();
    simulationInProgress.current = true;
    setSimulationBusy(true);
    setSimulationError("");
    try {
      await sendInterest({ nome: name, email: data.get("emailInvestidor"), telefone: data.get("telefoneInvestidor"), valor: amount, periodo: String(years), origem: "simulador_investimento" });
      setResult({ name, amount, years, date: new Date().toLocaleDateString("pt-BR") });
      requestAnimationFrame(() => {
        resultRef.current?.focus({ preventScroll: true });
        resultRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "center" });
      });
    } catch (cause) {
      setSimulationError(cause instanceof Error ? cause.message : "Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      simulationInProgress.current = false;
      setSimulationBusy(false);
    }
  }

  async function submitInterest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (contactInProgress.current || contactSuccess) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    contactInProgress.current = true;
    setContactBusy(true);
    setContactError("");
    try {
      await sendInterest({ nome: data.get("nome"), email: data.get("email"), perfil: data.get("perfil"), origem: "solicitar_apresentacao" });
      form.reset();
      setContactSuccess(true);
    } catch (cause) {
      setContactError(cause instanceof Error ? cause.message : "Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      contactInProgress.current = false;
      setContactBusy(false);
    }
  }

  // Calculation assumptions from the original landing page, unchanged.
  const amount = result?.amount ?? 10000;
  const years = result?.years ?? 1;
  const annualCdi = 0.1125;
  const values = {
    poupanca: amount * (1 + annualCdi * 0.69) ** years,
    cdb: amount * (1 + annualCdi) ** years,
    carteira: amount * (1 + annualCdi * 1.2) ** years,
  };

  return { result, values, resultRef, simulate, simulationBusy, simulationError, submitInterest, contactBusy, contactSuccess, contactError };
}
