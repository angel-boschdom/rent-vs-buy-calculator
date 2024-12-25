export interface SimulationParameters {
    MortgageDurationYears: number;
    MortgageInterestRateYearly: number; // decimal form (e.g., 0.04 = 4%)
    DownPaymentPercent: number;         // decimal form (e.g., 0.10 = 10%)
    YearlyReturnOnSavings: number;      // decimal
    YearlyNetSalaryGrowth: number;      // decimal
    YearlyHousePriceGrowth: number;     // decimal
    YearlyRentIncrease: number;         // decimal
    YearlyExpensesIncrease: number;     // decimal
    YearlyInterestOnDebt: number;       // decimal
    YearlyInflation: number;            // decimal
  }
  
  export interface InitialConditions {
    HousePrice: number;
    Savings: number;
    MonthlyRent: number;
    MonthlyNetSalary: number;
    MonthlyExpensesExceptRent: number;
    ServiceChargeYearly: number;
  }
  
  export interface SimulationResults {
    MaxNetWorth: number;
    SavingsTimeseries: number[];
    TotalNetWorthTimeseries: number[];
    HousingMonthlyCostTimeseries: number[];
  }  