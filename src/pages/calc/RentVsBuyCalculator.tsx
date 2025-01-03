import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import SplitLayout from '@/components/SplitLayout';
import RadioButtonCustom from '@/components//RadioButtonCustom';
import Slider from '@/components/Slider';
import { useSimulation } from '@/hooks/useSimulation';
import { SimulationParameters, InitialConditions } from '@/types';
import { themeColors } from '@/theme/colors'; 

Chart.register(...registerables);

const RentVsBuyCalculator: React.FC = () => {
  const { runSimulation, findOptimalAgeHouseIsBought, computeMaxNetWorth } = useSimulation();

  // === STATE FOR SLIDERS (with initial defaults) ===
  const [housePrice, setHousePrice] = useState(325000);
  const [retirementAgeYears, setRetirementAgeYears] = useState(65);
  const [ageYears, setAgeYears] = useState(30);
  const [serviceChargeYearly, setServiceChargeYearly] = useState(2200);
  const [savings, setSavings] = useState(34000);
  const [monthlyRent, setMonthlyRent] = useState(1200);
  const [monthlyExpensesExceptRent, setMonthlyExpensesExceptRent] = useState(1000);
  const [monthlyNetSalary, setMonthlyNetSalary] = useState(2600);

  // PURCHASE AGE SLIDER + FLAG
  const [purchaseAge, setPurchaseAge] = useState(0);
  const [purchaseAgeManuallyChanged, setPurchaseAgeManuallyChanged] = useState(false);

  // === STATE FOR "RADIO BUTTON CUSTOM" GROUPS ===
  const [mortgageDurationYears, setMortgageDurationYears] = useState('25');
  const [mortgageInterestRateYearly, setMortgageInterestRateYearly] = useState('6.0');
  const [downPaymentPercent, setDownPaymentPercent] = useState('10');
  const [yearlyReturnOnSavings, setYearlyReturnOnSavings] = useState('4');
  const [yearlyNetSalaryGrowth, setYearlyNetSalaryGrowth] = useState('6');
  const [yearlyHousePriceGrowth, setYearlyHousePriceGrowth] = useState('6');
  const [yearlyRentIncrease, setYearlyRentIncrease] = useState('6');
  const [yearlyExpensesIncrease, setYearlyExpensesIncrease] = useState('6');
  const [yearlyInterestOnDebt, setYearlyInterestOnDebt] = useState('15');
  const [yearlyInflation, setYearlyInflation] = useState('4');

  // CHART REFERENCE
  const chartRef = useRef<Chart | null>(null);

  // === HELPERS TO BUILD PARAMS ===
  const getParameters = (): SimulationParameters => ({
    MortgageDurationYears: parseInt(mortgageDurationYears),
    MortgageInterestRateYearly: parseFloat(mortgageInterestRateYearly) / 100,
    DownPaymentPercent: parseFloat(downPaymentPercent) / 100,
    YearlyReturnOnSavings: parseFloat(yearlyReturnOnSavings) / 100,
    YearlyNetSalaryGrowth: parseFloat(yearlyNetSalaryGrowth) / 100,
    YearlyHousePriceGrowth: parseFloat(yearlyHousePriceGrowth) / 100,
    YearlyRentIncrease: parseFloat(yearlyRentIncrease) / 100,
    YearlyExpensesIncrease: parseFloat(yearlyExpensesIncrease) / 100,
    YearlyInterestOnDebt: parseFloat(yearlyInterestOnDebt) / 100,
    YearlyInflation: parseFloat(yearlyInflation) / 100,
  });

  const getInitialConditions = (): InitialConditions => ({
    HousePrice: housePrice,
    Savings: savings,
    MonthlyRent: monthlyRent,
    MonthlyNetSalary: monthlyNetSalary,
    MonthlyExpensesExceptRent: monthlyExpensesExceptRent,
    ServiceChargeYearly: serviceChargeYearly,
  });

  // === MAIN PLOTTING FUNCTION (does NOT force setPurchaseAge) ===
  const plotResults = () => {
    const parameters = getParameters();
    const initialConditions = getInitialConditions();

    // Compute the "best" (optimal) purchase age:
    const optimalAge = findOptimalAgeHouseIsBought(parameters, initialConditions, ageYears, retirementAgeYears);
    const maxNetWorthPossible = computeMaxNetWorth(parameters, initialConditions, ageYears, retirementAgeYears, optimalAge);

    // Update the "wait X years" text:
    const waitYears = optimalAge - ageYears;
    const headlineElement = document.getElementById('optimalYearsWaitBuyHouse');
    if (headlineElement) {
      headlineElement.textContent = String(waitYears);
    }

    // Prepare the time-series for the *current* purchaseAge
    const simResults = runSimulation(parameters, initialConditions, ageYears, retirementAgeYears, purchaseAge);
    const { SavingsTimeseries, TotalNetWorthTimeseries } = simResults;

    const labels = SavingsTimeseries.map((_, i) => i + ageYears);

    // Destroy old chart instance if any
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Create new chart
    const ctx = (document.getElementById('timeseriesChart') as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Savings',
            data: SavingsTimeseries,
            borderColor: themeColors.secondary,
            backgroundColor: `${themeColors.secondary}80`, // Some opacity
            fill: true,
            tension: 0.1,
          },
          {
            label: 'Savings + House Equity',
            data: TotalNetWorthTimeseries,
            borderColor: themeColors.tertiary, 
            backgroundColor: `${themeColors.tertiary}80`, // Some opacity
            fill: true,
            tension: 0.1,
          },
        ],
      },
      options: {
        aspectRatio: 1.7,
        animation: { duration: 0 },
        scales: {
          y: {
            beginAtZero: true,
            min: 0,
            max: maxNetWorthPossible,
          },
        },
        plugins: {
          filler: { propagate: false },
        },
      },
    });
  };

  // === 1) useEffect for ALL PARAMETERS EXCEPT purchaseAge ===
  useEffect(() => {
    const parameters = getParameters();
    const initialConditions = getInitialConditions();

    const newOptimalAge = findOptimalAgeHouseIsBought(parameters, initialConditions, ageYears, retirementAgeYears);
    setPurchaseAge(newOptimalAge);
    setPurchaseAgeManuallyChanged(false);

    // Re-plot with the new optimum purchaseAge
    plotResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    housePrice,
    retirementAgeYears,
    ageYears,
    serviceChargeYearly,
    savings,
    monthlyRent,
    monthlyNetSalary,
    monthlyExpensesExceptRent,
    mortgageDurationYears,
    mortgageInterestRateYearly,
    downPaymentPercent,
    yearlyReturnOnSavings,
    yearlyNetSalaryGrowth,
    yearlyHousePriceGrowth,
    yearlyRentIncrease,
    yearlyExpensesIncrease,
    yearlyInterestOnDebt,
    yearlyInflation,
  ]);

  // === 2) useEffect for purchaseAge ONLY ===
  useEffect(() => {
    plotResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchaseAge]);

  // === HANDLERS ===

  // Helper for handling changes to any param that is *not* purchaseAge
  const handleNonPurchaseAgeSliderChange = (
    newValue: number,
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    setPurchaseAgeManuallyChanged(false);
    setter(newValue);
  };

  // Handle purchaseAge slider
  const handlePurchaseAgeChange = (newValue: number) => {
    setPurchaseAgeManuallyChanged(true);
    setPurchaseAge(newValue);
  };
  
    return (
      <SplitLayout
        leftTop={
          <>
            <h1 className="text-center text-2xl font-bold">
              Calculate Optimal Time to Buy a House
            </h1>
            <p className="text-center">
              You are renting now, and you have some savings. Should you buy a house, or keep renting?
              How does this affect your retirement goals? This calculator clarifies this.
            </p>
  
            <div id="timeseriesControls" className="flex flex-col items-center space-y-1">
              <Slider
                id="housePrice"
                label="House price"
                tooltipText="Specify the price of the house you are considering."
                min={50000}
                max={1500000}
                step={10000}
                value={housePrice}
                onChangeValue={(val) => handleNonPurchaseAgeSliderChange(val, setHousePrice)}
              />
  
              <Slider
                id="ageYears"
                label="Your age now (years)"
                tooltipText="Your current age. Used to calculate the time horizon."
                min={15}
                max={90}
                step={1}
                value={ageYears}
                onChangeValue={(val) => handleNonPurchaseAgeSliderChange(val, setAgeYears)}
              />
  
              <Slider
                id="purchaseAge"
                label="Age at which you buy the house"
                tooltipText="Specify the age at which you would purchase the house."
                min={ageYears} // can't buy before your current age
                max={100}
                step={1}
                value={purchaseAge}
                onChangeValue={handlePurchaseAgeChange}
                valueSuffix=" years old"
              />
            </div>
          </>
        }
  
        leftBottom={
          /* This chunk stays sticky on mobile when scrolling */
          <>
            <canvas
              id="timeseriesChart"
              className="w-full h-56 md:h-32 lg:h-28"
            ></canvas>
            <div id="resultsSummaryHeadline" className="text-center">
              <h4 className="font-medium">Based on the parameters specified below,</h4>
              <h3 className="text-primary font-bold text-xl">
                you should wait <span id="optimalYearsWaitBuyHouse">0</span> years to buy the house
              </h3>
              <h4 className="font-medium">to maximize your future net worth.</h4>
            </div>
          </>
        }
  
        /* Right panel content goes here */
        right={
          <div id="form" className="space-y-4">
            <h2 className="text-center text-xl font-bold mb-2">Parameters</h2>
  
            {/* === Retirement Goals === */}
            <div>
              <h3 className="text-center text-lg font-semibold mb-2">Retirement goals</h3>
              <Slider
                id="retirementAgeYears"
                label="Retirement age (years)"
                tooltipText="The age you plan to retire. After this age, you don't have a monthly salary."
                min={purchaseAge}
                max={95}
                step={1}
                value={retirementAgeYears}
                onChangeValue={(val) => handleNonPurchaseAgeSliderChange(val, setRetirementAgeYears)}
              />
            </div>
  
            {/* === Mortgage === */}
            <div>
              <h3 className="text-center text-lg font-semibold mb-2">Mortgage</h3>
              <RadioButtonCustom
                name="mortgageDurationYearsRadio"
                values={[20, 25, 30]}
                defaultSelectedIndex={2}
                onValueChange={(val) => {
                  setPurchaseAgeManuallyChanged(false);
                  setMortgageDurationYears(val);
                }}
                label="Mortgage duration (years):"
                tooltipText="Total duration of your mortgage in years."
              />
  
              <RadioButtonCustom
                name="mortgageInterestRateYearlyRadio"
                values={[3.0, 4.5, 6.0]}
                defaultSelectedIndex={3}
                onValueChange={(val) => {
                  setPurchaseAgeManuallyChanged(false);
                  setMortgageInterestRateYearly(val);
                }}
                label="Mortgage interest rate yearly (%):"
                tooltipText="Average annual interest rate for your mortgage."
              />
  
              <RadioButtonCustom
                name="downPaymentPercentRadio"
                values={[5, 10, 15]}
                defaultSelectedIndex={1}
                onValueChange={(val) => {
                  setPurchaseAgeManuallyChanged(false);
                  setDownPaymentPercent(val);
                }}
                label="Down payment percent (%):"
                tooltipText="Percentage of the house price that you pay upfront."
              />
            </div>
  
            {/* === House Ownership Costs === */}
            <div>
              <h3 className="text-center text-lg font-semibold mb-2">House Ownership Costs</h3>
              <Slider
                id="serviceChargeYearly"
                label="Service charge per year"
                tooltipText="Yearly service charge for maintenance, building insurance, etc."
                min={0}
                max={7000}
                step={25}
                value={serviceChargeYearly}
                onChangeValue={(val) => handleNonPurchaseAgeSliderChange(val, setServiceChargeYearly)}
              />
            </div>
  
            {/* === Current Personal Finances === */}
            <div>
              <h3 className="text-center text-lg font-semibold mb-2">Current personal finances</h3>
              <Slider
                id="savings"
                label="Savings and liquid investments"
                tooltipText="The total amount of your current savings and liquid investments."
                min={0}
                max={500000}
                step={2000}
                value={savings}
                onChangeValue={(val) => handleNonPurchaseAgeSliderChange(val, setSavings)}
              />
  
              <Slider
                id="monthlyRent"
                label="Monthly rent"
                tooltipText="The amount you currently pay for rent each month."
                min={0}
                max={4000}
                step={20}
                value={monthlyRent}
                onChangeValue={(val) => handleNonPurchaseAgeSliderChange(val, setMonthlyRent)}
              />
  
              <Slider
                id="monthlyExpensesExceptRent"
                label="Monthly expenses except rent"
                tooltipText="Your monthly expenses excluding rent."
                min={0}
                max={4000}
                step={20}
                value={monthlyExpensesExceptRent}
                onChangeValue={(val) => handleNonPurchaseAgeSliderChange(val, setMonthlyExpensesExceptRent)}
              />
  
              <Slider
                id="monthlyNetSalary"
                label="Monthly net salary"
                tooltipText="Your take-home pay each month after taxes."
                min={900}
                max={9000}
                step={50}
                value={monthlyNetSalary}
                onChangeValue={(val) => handleNonPurchaseAgeSliderChange(val, setMonthlyNetSalary)}
              />
            </div>
  
            {/* === Future Rates of Change === */}
            <div>
              <h3 className="text-center text-lg font-semibold mb-2">Future rates of change</h3>
              <RadioButtonCustom
                name="yearlyReturnOnSavingsRadio"
                values={[2, 4, 7]}
                defaultSelectedIndex={2}
                onValueChange={(val) => {
                  setPurchaseAgeManuallyChanged(false);
                  setYearlyReturnOnSavings(val);
                }}
                label="Yearly return on savings or liquid investments (%):"
                tooltipText="The expected annual return rate on your savings/investments."
              />
  
              <RadioButtonCustom
                name="yearlyNetSalaryGrowthRadio"
                values={[0, 3, 6]}
                defaultSelectedIndex={3}
                onValueChange={(val) => {
                  setPurchaseAgeManuallyChanged(false);
                  setYearlyNetSalaryGrowth(val);
                }}
                label="Yearly net salary growth (%):"
                tooltipText="Annual percentage increase in your net salary."
              />
  
              <RadioButtonCustom
                name="yearlyHousePriceGrowthRadio"
                values={[0, 3, 6]}
                defaultSelectedIndex={3}
                onValueChange={(val) => {
                  setPurchaseAgeManuallyChanged(false);
                  setYearlyHousePriceGrowth(val);
                }}
                label="Yearly house price growth (%):"
                tooltipText="Expected annual growth rate of house prices."
              />
  
              <RadioButtonCustom
                name="yearlyRentIncreaseRadio"
                values={[0, 3, 6]}
                defaultSelectedIndex={3}
                onValueChange={(val) => {
                  setPurchaseAgeManuallyChanged(false);
                  setYearlyRentIncrease(val);
                }}
                label="Yearly rent increase (%):"
                tooltipText="Expected annual increase in rent."
              />
  
              <RadioButtonCustom
                name="yearlyExpensesIncreaseRadio"
                values={[0, 3, 6]}
                defaultSelectedIndex={3}
                onValueChange={(val) => {
                  setPurchaseAgeManuallyChanged(false);
                  setYearlyExpensesIncrease(val);
                }}
                label="Yearly expenses increase (%) except rent:"
                tooltipText="Expected annual increase in your living expenses (except rent)."
              />
  
              <RadioButtonCustom
                name="yearlyInterestOnDebtRadio"
                values={[5, 10, 15]}
                defaultSelectedIndex={3}
                onValueChange={(val) => {
                  setPurchaseAgeManuallyChanged(false);
                  setYearlyInterestOnDebt(val);
                }}
                label="Yearly interest on non-mortgage debt (%):"
                tooltipText="Annual interest rate on any debt outside of a mortgage."
              />
            </div>
  
            {/* === Inflation Adjustment === */}
            <div>
              <h3 className="text-center text-lg font-semibold mb-2">Inflation adjustment</h3>
              <RadioButtonCustom
                name="yearlyInflationRadio"
                values={[0, 2, 4]}
                defaultSelectedIndex={3}
                onValueChange={(val) => {
                  setPurchaseAgeManuallyChanged(false);
                  setYearlyInflation(val);
                }}
                label="Yearly inflation rate (%):"
                tooltipText="Expected annual inflation rate for adjusting money values."
              />
            </div>
          </div>
        }
      />
    );
  };
  
  export default RentVsBuyCalculator;
  