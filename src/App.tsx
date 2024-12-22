// file: /src/App.tsx

import React, { useState, useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import RadioButtonCustom from './components/RadioButtonCustom'
import TooltipIcon from './components/TooltipIcon'
import { useSimulation } from './hooks/useSimulation'
import { SimulationParameters, InitialConditions } from './types'

// IMPORTANT: Register all Chart.js components or you’ll get warnings
Chart.register(...registerables)

const App: React.FC = () => {
  const { runSimulation, findOptimalAgeHouseIsBought, computeMaxNetWorth } = useSimulation()

  // === STATE FOR SLIDERS (with initial defaults) ===
  const [housePrice, setHousePrice] = useState(325000)
  const [retirementAgeYears, setRetirementAgeYears] = useState(65)
  const [ageYears, setAgeYears] = useState(30)
  const [serviceChargeYearly, setServiceChargeYearly] = useState(2200)
  const [savings, setSavings] = useState(34000)
  const [monthlyRent, setMonthlyRent] = useState(1200)
  const [monthlyExpensesExceptRent, setMonthlyExpensesExceptRent] = useState(1000)
  const [monthlyNetSalary, setMonthlyNetSalary] = useState(2600)

  // PURCHASE AGE SLIDER + FLAG
  const [purchaseAge, setPurchaseAge] = useState(0)
  // This flag tracks whether the user has manually overridden the purchaseAge
  const [purchaseAgeManuallyChanged, setPurchaseAgeManuallyChanged] = useState(false)

  // === STATE FOR "RADIO BUTTON CUSTOM" GROUPS ===
  const [mortgageDurationYears, setMortgageDurationYears] = useState('25') // default = 25 (2nd option)
  const [mortgageInterestRateYearly, setMortgageInterestRateYearly] = useState('6.0') // default = 6.0
  const [downPaymentPercent, setDownPaymentPercent] = useState('10')    // default = 10%
  const [yearlyReturnOnSavings, setYearlyReturnOnSavings] = useState('4')  // default = 4%
  const [yearlyNetSalaryGrowth, setYearlyNetSalaryGrowth] = useState('6')  // default = 6%
  const [yearlyHousePriceGrowth, setYearlyHousePriceGrowth] = useState('6')
  const [yearlyRentIncrease, setYearlyRentIncrease] = useState('6')
  const [yearlyExpensesIncrease, setYearlyExpensesIncrease] = useState('6')
  const [yearlyInterestOnDebt, setYearlyInterestOnDebt] = useState('15')   // default = 15%
  const [yearlyInflation, setYearlyInflation] = useState('4')             // default = 4%

  // CHART REFERENCE
  const chartRef = useRef<Chart | null>(null)

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
    YearlyInflation: parseFloat(yearlyInflation) / 100
  })

  const getInitialConditions = (): InitialConditions => ({
    HousePrice: housePrice,
    Savings: savings,
    MonthlyRent: monthlyRent,
    MonthlyNetSalary: monthlyNetSalary,
    MonthlyExpensesExceptRent: monthlyExpensesExceptRent,
    ServiceChargeYearly: serviceChargeYearly
  })

  // === MAIN PLOTTING FUNCTION (does NOT force setPurchaseAge) ===
  const plotResults = () => {
    const parameters = getParameters()
    const initialConditions = getInitialConditions()

    // Compute the "best" (optimal) purchase age:
    const optimalAge = findOptimalAgeHouseIsBought(parameters, initialConditions, ageYears, retirementAgeYears)
    const maxNetWorthPossible = computeMaxNetWorth(parameters, initialConditions, ageYears, retirementAgeYears, optimalAge)

    // Update the "wait X years" text:
    const waitYears = optimalAge - ageYears
    const headlineElement = document.getElementById('optimalYearsWaitBuyHouse')
    if (headlineElement) {
      headlineElement.textContent = String(waitYears)
    }

    // Prepare the time-series for the *current* purchaseAge (NOT forced to optimal).
    const simResults = runSimulation(parameters, initialConditions, ageYears, retirementAgeYears, purchaseAge)
    const { SavingsTimeseries, TotalNetWorthTimeseries } = simResults

    // X-axis labels
    const labels = SavingsTimeseries.map((_, i) => i + ageYears)

    // Destroy existing chart if any
    if (chartRef.current) {
      chartRef.current.destroy()
    }

    const ctx = (document.getElementById('timeseriesChart') as HTMLCanvasElement)?.getContext('2d')
    if (!ctx) return

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Savings',
            data: SavingsTimeseries,
            borderColor: 'rgba(0, 100, 0, 0.5)',
            backgroundColor: 'rgba(0, 100, 0, 0.5)',
            fill: true,
            tension: 0.1
          },
          {
            label: 'Savings + House Equity',
            data: TotalNetWorthTimeseries,
            borderColor: 'rgba(152, 251, 152, 0.5)',
            backgroundColor: 'rgba(152, 251, 152, 0.5)',
            fill: true,
            tension: 0.1
          }
        ]
      },
      options: {
        aspectRatio: 1.7,
        animation: { duration: 0 },
        scales: {
          y: {
            beginAtZero: true,
            min: 0,
            max: maxNetWorthPossible
          }
        },
        plugins: {
          filler: { propagate: false }
        }
      }
    })
  }

  // === 1) useEffect for ALL PARAMETERS EXCEPT purchaseAge ===
  //     Whenever the user changes anything else, we recalc optimum and force the slider to it.
  useEffect(() => {
    // We only want to run this AFTER mount, so that the user can override the slider later.
    // If you need to skip an initial run, you can add a "mounted" ref or guard condition.
    const parameters = getParameters()
    const initialConditions = getInitialConditions()

    const newOptimalAge = findOptimalAgeHouseIsBought(parameters, initialConditions, ageYears, retirementAgeYears)
    
    // Force the purchaseAge slider to the newly computed optimum
    setPurchaseAge(newOptimalAge)
    // Mark that it was NOT manually changed by the user
    setPurchaseAgeManuallyChanged(false)

    // Re-plot with the new optimum purchaseAge
    plotResults()

  // Dependencies: all except purchaseAge and purchaseAgeManuallyChanged
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
    yearlyInflation
  ])

  // === 2) useEffect for purchaseAge ONLY ===
  //     If the user moves the slider, it re-plots using the current purchaseAge.
  useEffect(() => {
    // Each time purchaseAge changes, just re-run the chart
    plotResults()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchaseAge])

  // === HANDLERS ===

  // Helper for handling changes to any param that is *not* purchaseAge,
  // so we can reset "purchaseAgeManuallyChanged" to false.
  const handleNonPurchaseAgeSliderChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    // The user changed some other slider => reset the "manual override" flag
    setPurchaseAgeManuallyChanged(false)
    setter(Number(e.target.value))
  }

  // This is how we handle the purchaseAge slider directly
  const handlePurchaseAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // The user is overriding
    setPurchaseAgeManuallyChanged(true)
    setPurchaseAge(Number(e.target.value))
  }

  return (
    <div className="container">
      <h1>Calculate Optimal Time to Buy a House</h1>
      <p>
        You are renting now, and you have some savings. Should you buy a house, or keep renting?
        How does this affect your retirement goals? This calculator clarifies this.
      </p>

      {/* Timeseries Controls */}
      <div id="timeseriesControls">
        <label htmlFor="housePrice">
          House price: <span id="housePriceValue">{housePrice}</span>
          <TooltipIcon text="Specify the price of the house you are considering." />
        </label>
        <input
          type="range"
          id="housePrice"
          min={50000}
          max={1500000}
          step={10000}
          value={housePrice}
          className="slider"
          onChange={(e) => handleNonPurchaseAgeSliderChange(e, setHousePrice)}
        />

        <label htmlFor="purchaseAge">
          Age at which you buy the house: <span id="purchaseAgeValue">{purchaseAge}</span> years old
          <TooltipIcon text="Specify the age at which you would purchase the house." />
        </label>
        <input
          type="range"
          id="purchaseAge"
          min={ageYears}  // can't buy before your current age
          max={100}
          step={1}
          value={purchaseAge}
          className="slider"
          onChange={handlePurchaseAgeChange}
        />
      </div>

      <div className="sticky-container">
        <div id="resultsSummaryHeadline">
          <h4>Based on the parameters specified, you should</h4>
          <h3>
            wait <span id="optimalYearsWaitBuyHouse">0</span> years to buy the house
          </h3>
          <h4>to maximize your future net worth.</h4>
        </div>
        <canvas id="timeseriesChart"></canvas>
      </div>

      {/* Main Form */}
      <div id="form">
        <h2>Parameters</h2>

        <h3>Retirement goals</h3>
        <label htmlFor="retirementAgeYears">
          Retirement age (years): <span id="retirementAgeYearsValue">{retirementAgeYears}</span>
          <TooltipIcon text="The age you plan to retire. After this age, you don't have a monthly salary." />
        </label>
        <input
          type="range"
          id="retirementAgeYears"
          // We want the retirement age to be at least purchaseAge
          min={purchaseAge}
          max={95}
          step={1}
          value={retirementAgeYears}
          className="slider"
          onChange={(e) => handleNonPurchaseAgeSliderChange(e, setRetirementAgeYears)}
        />

        <label htmlFor="ageYears">
          Age now (years): <span id="ageYearsValue">{ageYears}</span>
          <TooltipIcon text="Your current age. Used to calculate the time horizon." />
        </label>
        <input
          type="range"
          id="ageYears"
          min={15}
          max={90}
          step={1}
          value={ageYears}
          className="slider"
          onChange={(e) => handleNonPurchaseAgeSliderChange(e, setAgeYears)}
        />

        <h3>Mortgage</h3>
        <label>
          Mortgage duration (years):
          <TooltipIcon text="Total duration of your mortgage in years." />
        </label>
        <RadioButtonCustom
          name="mortgageDurationYearsRadio"
          values={[20, 25, 30]}
          defaultSelectedIndex={2} 
          onValueChange={(val) => {
            setPurchaseAgeManuallyChanged(false)
            setMortgageDurationYears(val)
          }}
        />

        <label>
          Mortgage interest rate yearly (%):
          <TooltipIcon text="Average annual interest rate for your mortgage." />
        </label>
        <RadioButtonCustom
          name="mortgageInterestRateYearlyRadio"
          values={[3.0, 4.5, 6.0]}
          defaultSelectedIndex={3}
          onValueChange={(val) => {
            setPurchaseAgeManuallyChanged(false)
            setMortgageInterestRateYearly(val)
          }}
        />

        <label>
          Down payment percent (%):
          <TooltipIcon text="Percentage of the house price that you pay upfront." />
        </label>
        <RadioButtonCustom
          name="downPaymentPercentRadio"
          values={[5, 10, 15]}
          defaultSelectedIndex={1}
          onValueChange={(val) => {
            setPurchaseAgeManuallyChanged(false)
            setDownPaymentPercent(val)
          }}
        />

        <h3>House Ownership Costs</h3>
        <label htmlFor="serviceChargeYearly">
          Service charge per year: <span id="serviceChargeYearlyValue">{serviceChargeYearly}</span>
          <TooltipIcon text="Yearly service charge for maintenance, building insurance, etc." />
        </label>
        <input
          type="range"
          id="serviceChargeYearly"
          min={0}
          max={7000}
          step={25}
          value={serviceChargeYearly}
          className="slider"
          onChange={(e) => handleNonPurchaseAgeSliderChange(e, setServiceChargeYearly)}
        />

        <h3>Current personal finances</h3>
        <label htmlFor="savings">
          Savings and liquid investments: <span id="savingsValue">{savings}</span>
          <TooltipIcon text="The total amount of your current savings and liquid investments." />
        </label>
        <input
          type="range"
          id="savings"
          min={0}
          max={500000}
          step={2000}
          value={savings}
          className="slider"
          onChange={(e) => handleNonPurchaseAgeSliderChange(e, setSavings)}
        />

        <label htmlFor="monthlyRent">
          Monthly rent: <span id="monthlyRentValue">{monthlyRent}</span>
          <TooltipIcon text="The amount you currently pay for rent each month." />
        </label>
        <input
          type="range"
          id="monthlyRent"
          min={0}
          max={4000}
          step={20}
          value={monthlyRent}
          className="slider"
          onChange={(e) => handleNonPurchaseAgeSliderChange(e, setMonthlyRent)}
        />

        <label htmlFor="monthlyExpensesExceptRent">
          Monthly expenses except rent: <span id="monthlyExpensesExceptRentValue">{monthlyExpensesExceptRent}</span>
          <TooltipIcon text="Your monthly expenses excluding rent." />
        </label>
        <input
          type="range"
          id="monthlyExpensesExceptRent"
          min={0}
          max={4000}
          step={20}
          value={monthlyExpensesExceptRent}
          className="slider"
          onChange={(e) => handleNonPurchaseAgeSliderChange(e, setMonthlyExpensesExceptRent)}
        />

        <label htmlFor="monthlyNetSalary">
          Monthly net salary: <span id="monthlyNetSalaryValue">{monthlyNetSalary}</span>
          <TooltipIcon text="Your take-home pay each month after taxes." />
        </label>
        <input
          type="range"
          id="monthlyNetSalary"
          min={900}
          max={9000}
          step={50}
          value={monthlyNetSalary}
          className="slider"
          onChange={(e) => handleNonPurchaseAgeSliderChange(e, setMonthlyNetSalary)}
        />

        <h3>Future rates of change</h3>
        <label>
          Yearly return on savings or liquid investments (%):
          <TooltipIcon text="The expected annual return rate on your savings/investments." />
        </label>
        <RadioButtonCustom
          name="yearlyReturnOnSavingsRadio"
          values={[2, 4, 7]}
          defaultSelectedIndex={2}
          onValueChange={(val) => {
            setPurchaseAgeManuallyChanged(false)
            setYearlyReturnOnSavings(val)
          }}
        />

        <label>
          Yearly net salary growth (%):
          <TooltipIcon text="Annual percentage increase in your net salary." />
        </label>
        <RadioButtonCustom
          name="yearlyNetSalaryGrowthRadio"
          values={[0, 3, 6]}
          defaultSelectedIndex={3}
          onValueChange={(val) => {
            setPurchaseAgeManuallyChanged(false)
            setYearlyNetSalaryGrowth(val)
          }}
        />

        <label>
          Yearly house price growth (%):
          <TooltipIcon text="Expected annual growth rate of house prices." />
        </label>
        <RadioButtonCustom
          name="yearlyHousePriceGrowthRadio"
          values={[0, 3, 6]}
          defaultSelectedIndex={3}
          onValueChange={(val) => {
            setPurchaseAgeManuallyChanged(false)
            setYearlyHousePriceGrowth(val)
          }}
        />

        <label>
          Yearly rent increase (%):
          <TooltipIcon text="Expected annual increase in rent." />
        </label>
        <RadioButtonCustom
          name="yearlyRentIncreaseRadio"
          values={[0, 3, 6]}
          defaultSelectedIndex={3}
          onValueChange={(val) => {
            setPurchaseAgeManuallyChanged(false)
            setYearlyRentIncrease(val)
          }}
        />

        <label>
          Yearly expenses increase (%) except rent:
          <TooltipIcon text="Expected annual increase in your living expenses (except rent)." />
        </label>
        <RadioButtonCustom
          name="yearlyExpensesIncreaseRadio"
          values={[0, 3, 6]}
          defaultSelectedIndex={3}
          onValueChange={(val) => {
            setPurchaseAgeManuallyChanged(false)
            setYearlyExpensesIncrease(val)
          }}
        />

        <label>
          Yearly interest on non-mortgage debt (%):
          <TooltipIcon text="Annual interest rate on any debt outside of a mortgage." />
        </label>
        <RadioButtonCustom
          name="yearlyInterestOnDebtRadio"
          values={[5, 10, 15]}
          defaultSelectedIndex={3}
          onValueChange={(val) => {
            setPurchaseAgeManuallyChanged(false)
            setYearlyInterestOnDebt(val)
          }}
        />

        <h3>Inflation adjustment</h3>
        <label>
          Yearly inflation rate (%):
          <TooltipIcon text="Expected annual inflation rate for adjusting money values." />
        </label>
        <RadioButtonCustom
          name="yearlyInflationRadio"
          values={[0, 2, 4]}
          defaultSelectedIndex={3}
          onValueChange={(val) => {
            setPurchaseAgeManuallyChanged(false)
            setYearlyInflation(val)
          }}
        />
      </div>
    </div>
  )
}

export default App