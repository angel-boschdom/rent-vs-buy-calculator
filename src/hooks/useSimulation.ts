// file: /src/hooks/useSimulation.ts
import { useCallback } from 'react';
import { SimulationParameters, InitialConditions, SimulationResults } from '../types';

// We replicate the same code from script.js. 
// The difference is that these are in TypeScript, and we expose them for use in App or any other component.

export function useSimulation() {

  const runSimulation = useCallback((
    parameters: SimulationParameters,
    initialConditions: InitialConditions,
    ageYears: number,
    retirementAgeYears: number,
    ageHouseIsBought: number
  ): SimulationResults => {

    const {
      MortgageInterestRateYearly,
      YearlyReturnOnSavings,
      YearlyNetSalaryGrowth,
      YearlyHousePriceGrowth,
      YearlyRentIncrease,
      YearlyExpensesIncrease,
      DownPaymentPercent,
      MortgageDurationYears,
      YearlyInterestOnDebt,
      YearlyInflation
    } = parameters;

    let housePrice = initialConditions.HousePrice;
    let savings = initialConditions.Savings;
    let yearlyRent = initialConditions.MonthlyRent * 12;
    let yearlyNetSalary = initialConditions.MonthlyNetSalary * 12;
    let yearlyExpensesExceptRent = initialConditions.MonthlyExpensesExceptRent * 12;
    let serviceChargeYearly = initialConditions.ServiceChargeYearly;

    const finalAge = 100;
    const savingsTimeseries: number[] = [];
    const totalNetWorthTimeseries: number[] = [];
    const housingMonthlyCostTimeseries: number[] = [];

    let thisYear = ageYears;
    let mortgageDebtOutstanding = 0;

    // RENTING period
    while (thisYear < ageHouseIsBought) {
      thisYear++;
      if (savings > 0) {
        savings *= (1 + YearlyReturnOnSavings);
      } else {
        savings *= (1 + YearlyInterestOnDebt);
      }
      housePrice *= (1 + YearlyHousePriceGrowth);
      yearlyNetSalary *= (1 + YearlyNetSalaryGrowth);
      yearlyExpensesExceptRent *= (1 + YearlyExpensesIncrease);
      yearlyRent *= (1 + YearlyRentIncrease);

      if (thisYear > retirementAgeYears) {
        yearlyNetSalary = 0;
      }

      savings += (yearlyNetSalary - yearlyRent - yearlyExpensesExceptRent);

      savingsTimeseries.push(savings);
      totalNetWorthTimeseries.push(savings);
      housingMonthlyCostTimeseries.push(yearlyRent / 12);
    }

    // BUYING period
    if (ageHouseIsBought < finalAge) {
      const downPayment = DownPaymentPercent * housePrice;
      const mortgageAmount = housePrice - downPayment;

      // Yearly mortgage payment using standard annuity formula
      const r = MortgageInterestRateYearly;
      const n = MortgageDurationYears;
      const yearlyMortgagePayment = (mortgageAmount * r * Math.pow((1 + r), n)) / (Math.pow((1 + r), n) - 1);

      // subtract the down payment
      savings -= downPayment;
      mortgageDebtOutstanding = mortgageAmount;

      const yearEndOfMortgage = thisYear + MortgageDurationYears;

      // Mortgage period
      while (thisYear < yearEndOfMortgage && thisYear < finalAge) {
        thisYear++;

        if (savings > 0) {
          savings *= (1 + YearlyReturnOnSavings);
        } else {
          savings *= (1 + YearlyInterestOnDebt);
        }
        housePrice *= (1 + YearlyHousePriceGrowth);
        yearlyNetSalary *= (1 + YearlyNetSalaryGrowth);
        yearlyExpensesExceptRent *= (1 + YearlyExpensesIncrease);
        serviceChargeYearly *= (1 + YearlyInflation);

        if (thisYear > retirementAgeYears) {
          yearlyNetSalary = 0;
        }

        const interestPaidOnMortgageThisYear = mortgageDebtOutstanding * r;
        const incrementInEquityThisYear = yearlyMortgagePayment - interestPaidOnMortgageThisYear;
        mortgageDebtOutstanding -= incrementInEquityThisYear;

        savings += (yearlyNetSalary - yearlyMortgagePayment - yearlyExpensesExceptRent - serviceChargeYearly);

        savingsTimeseries.push(savings);
        totalNetWorthTimeseries.push(savings + housePrice - mortgageDebtOutstanding);
        housingMonthlyCostTimeseries.push(yearlyMortgagePayment / 12);
      }

      // Post mortgage period
      while (thisYear < finalAge) {
        thisYear++;
        if (savings > 0) {
          savings *= (1 + YearlyReturnOnSavings);
        } else {
          savings *= (1 + YearlyInterestOnDebt);
        }
        housePrice *= (1 + YearlyHousePriceGrowth);
        yearlyNetSalary *= (1 + YearlyNetSalaryGrowth);
        yearlyExpensesExceptRent *= (1 + YearlyExpensesIncrease);
        serviceChargeYearly *= (1 + YearlyInflation);

        if (thisYear > retirementAgeYears) {
          yearlyNetSalary = 0;
        }

        savings += (yearlyNetSalary - yearlyExpensesExceptRent - serviceChargeYearly);

        savingsTimeseries.push(savings);
        totalNetWorthTimeseries.push(savings + housePrice);
        housingMonthlyCostTimeseries.push(0);
      }
    }

    // Inflation adjustment
    for (let i = 0; i < savingsTimeseries.length; i++) {
      const adjustmentFactor = Math.pow(1 + YearlyInflation, i);
      savingsTimeseries[i] /= adjustmentFactor;
      totalNetWorthTimeseries[i] /= adjustmentFactor;
      housingMonthlyCostTimeseries[i] /= adjustmentFactor;
    }

    const maxNetWorth = Math.max(...totalNetWorthTimeseries);

    return {
      MaxNetWorth: maxNetWorth,
      SavingsTimeseries: savingsTimeseries,
      TotalNetWorthTimeseries: totalNetWorthTimeseries,
      HousingMonthlyCostTimeseries: housingMonthlyCostTimeseries
    };
  }, []);

  const computeMaxNetWorth = useCallback((
    parameters: SimulationParameters,
    initialConditions: InitialConditions,
    ageYears: number,
    retirementAgeYears: number,
    ageHouseIsBought: number
  ) => {
    const result = runSimulation(parameters, initialConditions, ageYears, retirementAgeYears, ageHouseIsBought);
    return result.MaxNetWorth;
  }, [runSimulation]);

  const findOptimalAgeHouseIsBought = useCallback((
    parameters: SimulationParameters,
    initialConditions: InitialConditions,
    ageYears: number,
    retirementAgeYears: number
  ) => {
    const finalAge = 100;
    const ages = Array.from({ length: finalAge - ageYears + 1 }, (_, idx) => ageYears + idx);
    const maxNetWorthForEachAge = ages.map(age => computeMaxNetWorth(parameters, initialConditions, ageYears, retirementAgeYears, age));
    const maxValue = Math.max(...maxNetWorthForEachAge);
    const optimalIndex = maxNetWorthForEachAge.findIndex(val => val === maxValue);
    return ages[optimalIndex];
  }, [computeMaxNetWorth]);

  return {
    runSimulation,
    findOptimalAgeHouseIsBought,
    computeMaxNetWorth
  };
}