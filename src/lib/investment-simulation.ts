// These are the existing illustrative assumptions, not live market rates.
export type InvestmentSimulation = {
  amount: number;
  years: number;
  annualCdi: number;
  values: { poupanca: number; cdb: number; carteira: number };
};

export function simulateInvestment(amount: number, years: number): InvestmentSimulation {
  if (!Number.isFinite(amount) || amount < 50_000 || amount > 1_000_000_000 || ![1, 3, 5].includes(years)) {
    throw new Error("Informe um valor entre R$ 50.000,00 e R$ 1 bilhão e um prazo de 1, 3 ou 5 anos.");
  }
  const annualCdi = 0.1125;
  const futureValue = (factor: number) => Math.round(amount * (1 + annualCdi * factor) ** years * 100) / 100;
  return { amount, years, annualCdi, values: { poupanca: futureValue(0.69), cdb: futureValue(1), carteira: futureValue(1.2) } };
}
