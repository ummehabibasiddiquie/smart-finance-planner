export interface RentVsBuyInput {
  propertyPrice: number;
  downPayment: number;
  monthlyRent: number;
  appreciationRate: number; // % yearly
  inflation: number; // % yearly
}

function compound(amount: number, annualPct: number, years: number) {
  return amount * Math.pow(1 + annualPct / 100, years);
}

export function rentVsBuy(input: RentVsBuyInput, years: number) {
  const buyNetWorth = compound(input.propertyPrice, input.appreciationRate, years) - input.downPayment;
  const rentCost = 12 * input.monthlyRent * ((Math.pow(1 + input.inflation / 100, years) - 1) / (input.inflation / 100 || 1));

  // Renting: assume down payment invested at appreciationRate (proxy)
  const rentNetWorth = compound(input.downPayment, input.appreciationRate, years) - rentCost;

  return {
    years,
    costOfRenting: rentCost,
    costOfBuying: input.downPayment, // simplified: cash outflow without loan modelling
    wealthRenting: rentNetWorth,
    wealthBuying: buyNetWorth,
    recommendation: buyNetWorth > rentNetWorth ? "Buy" : "Rent",
  };
}

