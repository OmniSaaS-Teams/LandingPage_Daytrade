"use client";

import { useRef, useState, type FormEvent } from "react";
import { createFormRequest, type SubmissionReceipt } from "../../lib/form-request";
import type { InvestmentSimulation } from "../../lib/investment-simulation";

export const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
type Simulation = InvestmentSimulation & { name: string; date: string };

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
  const sendSimulation = useRef(createFormRequest());
  const sendPresentation = useRef(createFormRequest());

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
      const receipt = await sendSimulation.current<SubmissionReceipt & { simulation: InvestmentSimulation }>("/api/investor-leads", { nome: name, email: data.get("emailInvestidor"), telefone: data.get("telefoneInvestidor"), valor: amount, periodo: String(years), origem: "simulador_investimento", pagina_origem: window.location.pathname });
      if (!receipt.simulation?.values) throw new Error("Não foi possível obter o resultado da simulação. Tente novamente.");
      setResult({ ...receipt.simulation, name, date: new Date(receipt.createdAt).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) });
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
      await sendPresentation.current("/api/investor-leads", { nome: data.get("nome"), email: data.get("email"), perfil: data.get("perfil"), origem: "solicitar_apresentacao", pagina_origem: window.location.pathname });
      form.reset();
      setContactSuccess(true);
    } catch (cause) {
      setContactError(cause instanceof Error ? cause.message : "Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      contactInProgress.current = false;
      setContactBusy(false);
    }
  }

  const values = result?.values ?? { poupanca: 0, cdb: 0, carteira: 0 };

  return { result, values, resultRef, simulate, simulationBusy, simulationError, submitInterest, contactBusy, contactSuccess, contactError };
}
