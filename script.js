document.addEventListener('DOMContentLoaded', function() {
    // Instantiate RadioButtonCustom objects for mortgage parameters
    const mortgageDurationYearsRadio = new RadioButtonCustom('mortgageDurationYearsRadio', [20, 25, 30], 2);

    // Instantiate RadioButtonCustom objects for interest rate, down payment, and other parameters
    const mortgageInterestRateYearlyRadio = new RadioButtonCustom('mortgageInterestRateYearlyRadio', [3.0, 4.5, 6.0], 3);
    const downPaymentPercentRadio = new RadioButtonCustom('downPaymentPercentRadio', [5, 10, 15, 20], 2);

    // Instantiate RadioButtonCustom objects for rates of change
    const yearlyReturnOnSavingsRadio = new RadioButtonCustom('yearlyReturnOnSavingsRadio', [0, 4, 8], 1);
    const yearlyNetSalaryGrowthRadio = new RadioButtonCustom('yearlyNetSalaryGrowthRadio', [0, 3, 6], 2);
    const yearlyHousePriceGrowthRadio = new RadioButtonCustom('yearlyHousePriceGrowthRadio', [0, 3, 6], 2);
    const yearlyRentIncreaseRadio = new RadioButtonCustom('yearlyRentIncreaseRadio', [0, 3, 6], 2);
    const yearlyExpensesIncreaseRadio = new RadioButtonCustom('yearlyExpensesIncreaseRadio', [0, 3, 6], 2);
    const yearlyInterestOnDebtRadio = new RadioButtonCustom('yearlyInterestOnDebtRadio', [5, 10, 15], 3);

    // Handle slider inputs
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
        slider.addEventListener('input', function() {
            const valueSpan = document.getElementById(slider.id + 'Value');
            valueSpan.textContent = slider.value;
        });
    });

    // Handle "Plot Results" button click
    document.getElementById('plotResults').addEventListener('click', function() {
        const housePrice = parseFloat(document.getElementById('housePrice').value);
        const savings = parseFloat(document.getElementById('savings').value);
        const monthlyRent = parseFloat(document.getElementById('monthlyRent').value);
        const monthlyNetSalary = parseFloat(document.getElementById('monthlyNetSalary').value);
        const monthlyExpensesExceptRent = parseFloat(document.getElementById('monthlyExpensesExceptRent').value);

        const parameters = {
            MortgageDurationYears: parseInt(mortgageDurationYearsRadio.getValue()),
            MortgageInterestRateYearly: parseFloat(mortgageInterestRateYearlyRadio.getValue()) / 100,
            DownPaymentPercent: parseInt(downPaymentPercentRadio.getValue()) / 100,
            YearlyReturnOnSavings: parseFloat(yearlyReturnOnSavingsRadio.getValue()) / 100,
            YearlyNetSalaryGrowth: parseFloat(yearlyNetSalaryGrowthRadio.getValue()) / 100,
            YearlyHousePriceGrowth: parseFloat(yearlyHousePriceGrowthRadio.getValue()) / 100,
            YearlyRentIncrease: parseFloat(yearlyRentIncreaseRadio.getValue()) / 100,
            YearlyExpensesIncrease: parseFloat(yearlyExpensesIncreaseRadio.getValue()) / 100,
            YearlyInterestOnDebt: parseFloat(yearlyInterestOnDebtRadio.getValue()) / 100
        };

        const initialConditions = {
            HousePrice: housePrice,
            Savings: savings,
            MonthlyRent: monthlyRent,
            MonthlyNetSalary: monthlyNetSalary,
            MonthlyExpensesExceptRent: monthlyExpensesExceptRent
        };

        const timeHorizonYears = parseInt(document.getElementById('timeHorizonYears').value);

        plotResults(parameters, initialConditions, timeHorizonYears);

    });
});

let myChart = null; // This variable will hold the main chart instance
let timeseriesChart = null; // This variable will hold the timeseries chart instance

function plotResults(parameters, initialConditions, timeHorizonYears) {
    const yearsToWait = Array.from({length: timeHorizonYears}, (_, i) => i);
    const finalNetWorthForThisCase = yearsToWait.map(year => computeFinalNetWorth(parameters, initialConditions, timeHorizonYears, year));

    const ctx = document.getElementById('resultsChart').getContext('2d');
    
    // Check if a chart instance already exists
    if (myChart) {
        myChart.destroy(); // Destroy the existing chart
    }
    
    // Create a new chart instance and assign it to the 'myChart' variable
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: yearsToWait,
            datasets: [{
                label: 'Final Net Worth (GBP) at End of Time Horizon',
                data: finalNetWorthForThisCase,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'How long you waited to buy the house (Years)'
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'Savings + HouseValue - MortgageDebt (GBP)' 
                    }
                }
            }
        }
    });
    
    // Timeseries slider and chart
    document.getElementById('timeseriesControls').style.display = 'block';
    document.getElementById('timeseriesChart').style.display = 'block';
    const purchaseTimeSlider = document.getElementById('purchaseTimeSlider');
    const purchaseTimeValue = document.getElementById('purchaseTimeValue');
    purchaseTimeSlider.max = timeHorizonYears; // Update the slider's max value to the time horizon
    purchaseTimeValue.textContent = purchaseTimeSlider.value; // Set the initial slider value text

    // Initial plot of the timeseries chart
    updateTimeseriesChart(parameters, initialConditions, timeHorizonYears, purchaseTimeSlider.value);

    // Event listener for the timeseries dropdown and slider
    document.getElementById('timeseriesSelect').addEventListener('change', function() {
        updateTimeseriesChart(parameters, initialConditions, timeHorizonYears, purchaseTimeSlider.value);
    });
    purchaseTimeSlider.oninput = function() {
        purchaseTimeValue.textContent = this.value;
        updateTimeseriesChart(parameters, initialConditions, timeHorizonYears, this.value);
    };

    function updateTimeseriesChart(parameters, initialConditions, timeHorizonYears, yearHouseIsBought) {
        const ctxTimeseries = document.getElementById('timeseriesChart').getContext('2d');
        const selectedTimeseries = document.getElementById('timeseriesSelect').value;
        let timeseriesData;
        if (selectedTimeseries === 'savings') {
            timeseriesData = computeSavingsTimeseries(parameters, initialConditions, timeHorizonYears, yearHouseIsBought);
        } else {
            timeseriesData = computeHousingMonthlyCostTimeseries(parameters, initialConditions, timeHorizonYears, yearHouseIsBought);
        }
        const labels = Array.from({length: timeseriesData.length}, (_, i) => i + 1);
    
        // Check if a timeseries chart instance already exists
        if (timeseriesChart) {
            timeseriesChart.destroy(); // Destroy the existing timeseries chart
        }

        timeseriesChart = new Chart(ctxTimeseries, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: selectedTimeseries === 'savings' ? 'Savings (total)' : 'Housing costs (monthly)',
                    data: timeseriesData,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                animation: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Year'
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: selectedTimeseries === 'savings' ? 'Total Savings (GBP)' : 'Monthly Housing Costs (GBP)' 
                        }
                    }
                }
            }
        });
    }
}

function computeFinalNetWorth(parameters, initialConditions, timeHorizonYears, yearHouseIsBought) {
    Results = runSimulation(parameters, initialConditions, timeHorizonYears, yearHouseIsBought)
    return Results.FinalNetWorth;
}

function computeSavingsTimeseries(parameters, initialConditions, timeHorizonYears, yearHouseIsBought) {
    Results = runSimulation(parameters, initialConditions, timeHorizonYears, yearHouseIsBought)
    return Results.SavingsTimeseries;
}

function computeHousingMonthlyCostTimeseries(parameters, initialConditions, timeHorizonYears, yearHouseIsBought) {
    Results = runSimulation(parameters, initialConditions, timeHorizonYears, yearHouseIsBought)
    return Results.HousingMonthlyCostTimeseries;
}

function runSimulation(parameters, initialConditions, timeHorizonYears, yearHouseIsBought) {
    // Extract parameters
    const yearlyInterestRate = parameters.MortgageInterestRateYearly;
    const returnOnSavingsYearly = parameters.YearlyReturnOnSavings;
    const salaryGrowthYearly = parameters.YearlyNetSalaryGrowth;
    const housePriceGrowthYearly = parameters.YearlyHousePriceGrowth;
    const yearlyRentIncreasePercent = parameters.YearlyRentIncrease;
    const yearlyExpensesIncreasePercent = parameters.YearlyExpensesIncrease;
    const downPaymentPercent = parameters.DownPaymentPercent;
    const mortgageDurationYears = parameters.MortgageDurationYears;
    const yearlyInterestOnNonMortgageDebt = parameters.YearlyInterestOnDebt;

    // Extract initial conditions
    let housePrice = initialConditions.HousePrice;
    let savings = initialConditions.Savings;
    let yearlyRent = initialConditions.MonthlyRent * 12;
    let yearlyNetSalary = initialConditions.MonthlyNetSalary * 12;
    let yearlyExpensesExceptRent = initialConditions.MonthlyExpensesExceptRent * 12;

    // State variable size initialization
    let savingsTimeseries = [];
    let housingMonthlyCostTimeseries = [];

    // Variables at t=0
    let thisYear = 0; // time iterator
    let houseHasBeenBought = false;
    let totalSavings = savings;
    let mortgageDebtOutstanding = 0;

    // Renting period begins
    while (thisYear < yearHouseIsBought && thisYear < timeHorizonYears) {
        thisYear++; // increase time
        // Apply growth in this year
        if (totalSavings > 0) {
            totalSavings *= (1 + returnOnSavingsYearly); // Increase savings by yearly ROI
        } else {
            totalSavings *= (1 + yearlyInterestOnNonMortgageDebt); // consider adding debt interest rate
        }
        housePrice *= (1 + housePriceGrowthYearly);
        yearlyNetSalary *= (1 + salaryGrowthYearly);
        yearlyExpensesExceptRent *= (1 + yearlyExpensesIncreasePercent);
        yearlyRent *= (1 + yearlyRentIncreasePercent);
        // Savings balance
        totalSavings += (yearlyNetSalary - yearlyRent - yearlyExpensesExceptRent);
        // Pass value to state variable for this year
        savingsTimeseries.push(totalSavings);
        housingMonthlyCostTimeseries.push(yearlyRent / 12);
    }

    // House purchase event
    if (yearHouseIsBought < timeHorizonYears) {
        houseHasBeenBought = true;
        // mortgage parameters
        const downPayment = downPaymentPercent * housePrice;
        const mortgageAmount = housePrice - downPayment;
        const yearlyMortgagePayment = (mortgageAmount * yearlyInterestRate * Math.pow((1 + yearlyInterestRate), mortgageDurationYears)) / (Math.pow((1 + yearlyInterestRate), mortgageDurationYears) - 1);

        // update balance after house purchase
        totalSavings -= downPayment;
        mortgageDebtOutstanding = housePrice - downPayment;

        // Mortgage period begins
        const yearEndOfMortgage = thisYear + mortgageDurationYears;
        while (thisYear < yearEndOfMortgage && thisYear < timeHorizonYears) {
            thisYear++; // increase time
            // Apply growth in this year
            if (totalSavings > 0) {
                totalSavings *= (1 + returnOnSavingsYearly); // Increase savings by yearly ROI
            } else {
                totalSavings *= (1 + yearlyInterestOnNonMortgageDebt); // consider adding debt interest rate
            }
            housePrice *= (1 + housePriceGrowthYearly);
            yearlyNetSalary *= (1 + salaryGrowthYearly);
            yearlyExpensesExceptRent *= (1 + yearlyExpensesIncreasePercent);
            // Mortgage balance
            const interestPaidOnMortgageThisYear = mortgageDebtOutstanding * yearlyInterestRate;
            const incrementInEquityThisYear = yearlyMortgagePayment - interestPaidOnMortgageThisYear;
            mortgageDebtOutstanding -= incrementInEquityThisYear;
            // Savings balance
            totalSavings += (yearlyNetSalary - yearlyMortgagePayment - yearlyExpensesExceptRent);
            // Pass value to state variable for this year
            savingsTimeseries.push(totalSavings);
            housingMonthlyCostTimeseries.push(yearlyMortgagePayment / 12);
        }

        // Post-mortgage period begins
        while (thisYear < timeHorizonYears) {
            thisYear++; // increase time
            // Apply growth in this year
            if (totalSavings > 0) {
                totalSavings *= (1 + returnOnSavingsYearly); // Increase savings by yearly ROI
            } else {
                totalSavings *= (1 + yearlyInterestOnNonMortgageDebt); // consider adding debt interest rate
            }
            housePrice *= (1 + housePriceGrowthYearly);
            yearlyNetSalary *= (1 + salaryGrowthYearly);
            yearlyExpensesExceptRent *= (1 + yearlyExpensesIncreasePercent);
            // Savings balance
            totalSavings += (yearlyNetSalary - yearlyExpensesExceptRent);
            // Pass value to state variable for this year
            savingsTimeseries.push(totalSavings);
            housingMonthlyCostTimeseries.push(0);
        }
    }

    // Final net worth
    const finalNetWorth = houseHasBeenBought ? totalSavings + housePrice - mortgageDebtOutstanding : totalSavings;

    return {
        FinalNetWorth: finalNetWorth,
        SavingsTimeseries: savingsTimeseries,
        HousingMonthlyCostTimeseries: housingMonthlyCostTimeseries
    };
}