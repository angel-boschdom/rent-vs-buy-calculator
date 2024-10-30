document.addEventListener('DOMContentLoaded', function() {

     // Add transition behavior to tooltip elements
     addTooltipBehavior(); // defined in uicomponents/tooltip.js

    // Generate a plot with the default values
    plotResultsBasedOnCurrentInputValues();

    // Add slider inputs callback (except for the purchaseAge slider, which has a different callback)
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
        if (slider.id !== "purchaseAge") { // Fix: use !== for "not equal to"
            slider.addEventListener('input', function() {
                const valueSpan = document.getElementById(slider.id + 'Value');
                if (valueSpan) {
                    valueSpan.textContent = slider.value;
                }
                plotResultsBasedOnCurrentInputValues();
            });
        }
    });

    // Add radio button groups callback
    const radioButtonsCustom = document.querySelectorAll('.radio-button-custom');
    radioButtonsCustom.forEach(radioButton => {
        radioButton.addEventListener('value-has-been-modified', function() {
            plotResultsBasedOnCurrentInputValues();
        });
    });
});

let timeseriesChart = null; // This variable will hold the timeseries chart instance
const radioButtonInstances = {}; // Global object to hold RadioButtonCustom instances

function plotResultsBasedOnCurrentInputValues() {
    // Function to get or create a RadioButtonCustom instance
    function getOrCreateRadioButtonCustom(key, options, defaultIndex) {
        if (!radioButtonInstances[key]) {
            radioButtonInstances[key] = new RadioButtonCustom(key, options, defaultIndex);
        }
        return radioButtonInstances[key];
    }

    // Retrieve or create RadioButtonCustom objects for mortgage parameters
    const mortgageDurationYearsRadio = getOrCreateRadioButtonCustom('mortgageDurationYearsRadio', [20, 25, 30], 2);

    // Retrieve or create RadioButtonCustom objects for interest rate, down payment, and other parameters
    const mortgageInterestRateYearlyRadio = getOrCreateRadioButtonCustom('mortgageInterestRateYearlyRadio', [3.0, 4.5, 6.0], 3);
    const downPaymentPercentRadio = getOrCreateRadioButtonCustom('downPaymentPercentRadio', [5, 10, 15], 1);

    // Retrieve or create RadioButtonCustom objects for rates of change
    const yearlyReturnOnSavingsRadio = getOrCreateRadioButtonCustom('yearlyReturnOnSavingsRadio', [2, 4, 7], 1);
    const yearlyNetSalaryGrowthRadio = getOrCreateRadioButtonCustom('yearlyNetSalaryGrowthRadio', [0, 3, 6], 2);
    const yearlyHousePriceGrowthRadio = getOrCreateRadioButtonCustom('yearlyHousePriceGrowthRadio', [0, 3, 6], 2);
    const yearlyRentIncreaseRadio = getOrCreateRadioButtonCustom('yearlyRentIncreaseRadio', [0, 3, 6], 2);
    const yearlyExpensesIncreaseRadio = getOrCreateRadioButtonCustom('yearlyExpensesIncreaseRadio', [0, 3, 6], 2);
    const yearlyInterestOnDebtRadio = getOrCreateRadioButtonCustom('yearlyInterestOnDebtRadio', [5, 10, 15], 3);
    const yearlyInflationRadio = getOrCreateRadioButtonCustom('yearlyInflationRadio', [0, 2, 4], 2);

    // Get slider input values
    const housePrice = parseFloat(document.getElementById('housePrice').value);
    const savings = parseFloat(document.getElementById('savings').value);
    const monthlyRent = parseFloat(document.getElementById('monthlyRent').value);
    const monthlyNetSalary = parseFloat(document.getElementById('monthlyNetSalary').value);
    const monthlyExpensesExceptRent = parseFloat(document.getElementById('monthlyExpensesExceptRent').value);
    const serviceChargeYearly = parseFloat(document.getElementById('serviceChargeYearly').value);

    const parameters = {
        MortgageDurationYears: parseInt(mortgageDurationYearsRadio.getValue()),
        MortgageInterestRateYearly: parseFloat(mortgageInterestRateYearlyRadio.getValue()) / 100,
        DownPaymentPercent: parseInt(downPaymentPercentRadio.getValue()) / 100,
        YearlyReturnOnSavings: parseFloat(yearlyReturnOnSavingsRadio.getValue()) / 100,
        YearlyNetSalaryGrowth: parseFloat(yearlyNetSalaryGrowthRadio.getValue()) / 100,
        YearlyHousePriceGrowth: parseFloat(yearlyHousePriceGrowthRadio.getValue()) / 100,
        YearlyRentIncrease: parseFloat(yearlyRentIncreaseRadio.getValue()) / 100,
        YearlyExpensesIncrease: parseFloat(yearlyExpensesIncreaseRadio.getValue()) / 100,
        YearlyInterestOnDebt: parseFloat(yearlyInterestOnDebtRadio.getValue()) / 100,
        YearlyInflation: parseFloat(yearlyInflationRadio.getValue()) / 100
    };

    const initialConditions = {
        HousePrice: housePrice,
        Savings: savings,
        MonthlyRent: monthlyRent,
        MonthlyNetSalary: monthlyNetSalary,
        MonthlyExpensesExceptRent: monthlyExpensesExceptRent,
        ServiceChargeYearly: serviceChargeYearly
    };

    const ageYears = parseInt(document.getElementById('ageYears').value);
    const retirementAgeYears = parseInt(document.getElementById('retirementAgeYears').value);

    plotResults(parameters, initialConditions, ageYears, retirementAgeYears);
}

/*
function scrollIntoTimeseriesChartView() {
    // Scroll into timeseriesChart to focus user attention into it
    const chartElement = document.getElementById('timeseriesChart');
    chartElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
}
*/

function plotResults(parameters, initialConditions, ageYears, retirementAgeYears) {
     
    // Timeseries slider and chart
    const purchaseAgeSlider = document.getElementById('purchaseAge');
    const purchaseAgeValue = document.getElementById('purchaseAgeValue');
    purchaseAgeSlider.min = ageYears; // Update the slider's min value to ageYears
    
    // Find optimal age to buy
    const optimalAgeToBuy = findOptimalAgeHouseIsBought(parameters, initialConditions, ageYears, retirementAgeYears);
    const maxNetWorthPossible = computeMaxNetWorth(parameters, initialConditions, ageYears, retirementAgeYears, optimalAgeToBuy);
    
    // Update resultsSummaryHeadline
    const optimalYearsWaitBuyHouse = document.getElementById('optimalYearsWaitBuyHouse');  
    const ageYearsValue = parseInt(document.getElementById('ageYears').value);  
    const yearsWaitValue = optimalAgeToBuy - ageYearsValue;
    optimalYearsWaitBuyHouse.textContent = yearsWaitValue;

    // Set initial timeseries slider value equal to optimal age to buy
    purchaseAgeSlider.value = optimalAgeToBuy;
    purchaseAgeValue.textContent = optimalAgeToBuy;

    // Trigger input event to update the textContent and other listeners
    purchaseAgeSlider.dispatchEvent(new Event('input'));
    
    // Initial plot of the timeseries chart
    updateTimeseriesChart(parameters, initialConditions, ageYears, retirementAgeYears, purchaseAgeSlider.value);

    purchaseAgeSlider.oninput = function() {
        purchaseAgeValue.textContent = this.value;
        updateTimeseriesChart(parameters, initialConditions, ageYears, retirementAgeYears, this.value);
    };

    function updateTimeseriesChart(parameters, initialConditions, ageYears, retirementAgeYears, ageHouseIsBought) {
        const ctxTimeseries = document.getElementById('timeseriesChart').getContext('2d');
        const savingsData = computeSavingsTimeseries(parameters, initialConditions, ageYears, retirementAgeYears, ageHouseIsBought);
        const totalNetWorthData = computeTotalNetWorthTimeseries(parameters, initialConditions, ageYears, retirementAgeYears, ageHouseIsBought);
        const labels = Array.from({length: savingsData.length}, (_, i) => i + ageYears);
    
        if (timeseriesChart) {
            timeseriesChart.destroy();
        }

        timeseriesChart = new Chart(ctxTimeseries, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Savings',
                        data: savingsData,
                        borderColor: 'rgb(0, 100, 0, 0.5)',
                        backgroundColor: 'rgba(0, 100, 0, 0.5)',
                        fill: true,
                        tension: 0.1
                    },
                    {
                        label: 'Savings + House Equity',
                        data: totalNetWorthData,
                        borderColor: 'rgb(152, 251, 152, 0.5)',
                        backgroundColor: 'rgba(152, 251, 152, 0.5)',
                        fill: true,
                        tension: 0.1
                    }
                ]
            },
            options: {
                aspectRatio: 1.7, // width/height
                animation: {
                    duration: 0 // Remove animation
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        min: 0, // Set Y-axis min to 0
                        max: maxNetWorthPossible // Set Y-axis max to maxNetWorthPossible
                    }
                },
                plugins: {
                    filler: {
                        propagate: false
                    }
                }
            }
        });
    }
}

function computeMaxNetWorth(parameters, initialConditions, ageYears, retirementAgeYears, ageHouseIsBought) {
    Results = runSimulation(parameters, initialConditions, ageYears, retirementAgeYears, ageHouseIsBought)
    return Results.MaxNetWorth;
}

function findOptimalAgeHouseIsBought(parameters, initialConditions, ageYears, retirementAgeYears) {
    // Set final age (time horizon)
    const finalAge = 100;
    // Generate an array of ages from current age to final age
    const ages = Array.from({ length: finalAge - ageYears + 1 }, (_, index) => ageYears + index);
    // Compute max net worth for each possible age of house purchase
    const maxNetWorthForThisCase = ages.map(thisAge => computeMaxNetWorth(parameters, initialConditions, ageYears, retirementAgeYears, thisAge));
    // Find the maximum net worth value
    const maxNetWorthValue = Math.max(...maxNetWorthForThisCase);
    // Find the index of the maximum net worth value, which corresponds to the optimal age offset from the current age
    const optimalAgeIndex = maxNetWorthForThisCase.findIndex(netWorth => netWorth === maxNetWorthValue);
    // Find the optimal age for buying the house using the index
    const optimalAgeHouseIsBought = ages[optimalAgeIndex];
    
    return optimalAgeHouseIsBought;
}

function computeSavingsTimeseries(parameters, initialConditions, ageYears, retirementAgeYears, ageHouseIsBought) {
    Results = runSimulation(parameters, initialConditions, ageYears, retirementAgeYears, ageHouseIsBought)
    return Results.SavingsTimeseries;
}

function computeTotalNetWorthTimeseries(parameters, initialConditions, ageYears, retirementAgeYears, ageHouseIsBought) {
    Results = runSimulation(parameters, initialConditions, ageYears, retirementAgeYears, ageHouseIsBought)
    return Results.TotalNetWorthTimeseries;
}

function computeHousingMonthlyCostTimeseries(parameters, initialConditions, ageYears, retirementAgeYears, ageHouseIsBought) {
    Results = runSimulation(parameters, initialConditions, ageYears, retirementAgeYears, ageHouseIsBought)
    return Results.HousingMonthlyCostTimeseries;
}

function runSimulation(parameters, initialConditions, ageYears, retirementAgeYears, ageHouseIsBought) {
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
    const yearlyInflation = parameters.YearlyInflation;
    
    // Extract initial conditions
    let housePrice = initialConditions.HousePrice;
    let savings = initialConditions.Savings;
    let yearlyRent = initialConditions.MonthlyRent * 12;
    let yearlyNetSalary = initialConditions.MonthlyNetSalary * 12;
    let yearlyExpensesExceptRent = initialConditions.MonthlyExpensesExceptRent * 12;
    let serviceChargeYearly = initialConditions.ServiceChargeYearly;

    // Set final age (time horizon)
    let finalAge = 100;

    // State variable size initialization
    let savingsTimeseries = [];
    let totalNetWorthTimeseries = [];
    let housingMonthlyCostTimeseries = [];

    // Variables at t=0
    let thisYear = ageYears; // time iterator
    let houseHasBeenBought = false;
    let totalSavings = savings;
    let mortgageDebtOutstanding = 0;

    // Renting period begins
    while (thisYear < ageHouseIsBought) {
        thisYear++; // increase time
        // Apply growth in this year
        if (totalSavings > 0) {
            totalSavings *= (1 + returnOnSavingsYearly); // Increase savings by yearly ROI
        } else {
            totalSavings *= (1 + yearlyInterestOnNonMortgageDebt); // Decrease savings by yearly debt interest
        }
        housePrice *= (1 + housePriceGrowthYearly);
        yearlyNetSalary *= (1 + salaryGrowthYearly);
        yearlyExpensesExceptRent *= (1 + yearlyExpensesIncreasePercent);
        yearlyRent *= (1 + yearlyRentIncreasePercent);
        // Check if already retired
        if (thisYear > retirementAgeYears) {
            yearlyNetSalary = 0;
        } 
        // Savings balance
        totalSavings += (yearlyNetSalary - yearlyRent - yearlyExpensesExceptRent);
        // Pass value to state variable for this year
        savingsTimeseries.push(totalSavings);
        totalNetWorthTimeseries.push(totalSavings);
        housingMonthlyCostTimeseries.push(yearlyRent / 12);
    }

    // House purchase event
    if (ageHouseIsBought < finalAge) {
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
        while (thisYear < yearEndOfMortgage && thisYear < finalAge) {
            thisYear++; // increase time
            // Apply growth in this year
            if (totalSavings > 0) {
                totalSavings *= (1 + returnOnSavingsYearly); // Increase savings by yearly ROI
            } else {
                totalSavings *= (1 + yearlyInterestOnNonMortgageDebt); // Decrease savings by yearly debt interest
            }
            housePrice *= (1 + housePriceGrowthYearly);
            yearlyNetSalary *= (1 + salaryGrowthYearly);
            yearlyExpensesExceptRent *= (1 + yearlyExpensesIncreasePercent);
            serviceChargeYearly *= (1 + yearlyInflation); // Increase service charge with inflation
            // Check if already retired
            if (thisYear > retirementAgeYears) {
                yearlyNetSalary = 0;
            } 
            // Mortgage balance
            const interestPaidOnMortgageThisYear = mortgageDebtOutstanding * yearlyInterestRate;
            const incrementInEquityThisYear = yearlyMortgagePayment - interestPaidOnMortgageThisYear;
            mortgageDebtOutstanding -= incrementInEquityThisYear;
            // Savings balance
            totalSavings += (yearlyNetSalary - yearlyMortgagePayment - yearlyExpensesExceptRent - serviceChargeYearly);
            // Pass value to state variable for this year
            savingsTimeseries.push(totalSavings);
            totalNetWorthTimeseries.push(totalSavings + housePrice - mortgageDebtOutstanding);
            housingMonthlyCostTimeseries.push(yearlyMortgagePayment / 12);
        }

        // Post-mortgage period begins
        while (thisYear < finalAge) {
            thisYear++; // increase time
            // Apply growth in this year
            if (totalSavings > 0) {
                totalSavings *= (1 + returnOnSavingsYearly); // Increase savings by yearly ROI
            } else {
                totalSavings *= (1 + yearlyInterestOnNonMortgageDebt); // Decrease savings by yearly debt interest
            }
            housePrice *= (1 + housePriceGrowthYearly);
            yearlyNetSalary *= (1 + salaryGrowthYearly);
            yearlyExpensesExceptRent *= (1 + yearlyExpensesIncreasePercent);
            // Check if already retired
            if (thisYear > retirementAgeYears) {
                yearlyNetSalary = 0;
            } 
            // Savings balance
            totalSavings += (yearlyNetSalary - yearlyExpensesExceptRent);
            // Pass value to state variable for this year
            savingsTimeseries.push(totalSavings);
            totalNetWorthTimeseries.push(totalSavings + housePrice); 
            housingMonthlyCostTimeseries.push(0);
        }
    }

    // Adjust timeseries for inflation
    for (let i = 0; i < savingsTimeseries.length; i++) {
        let adjustmentFactor = Math.pow(1 + yearlyInflation, i);
        savingsTimeseries[i] /= adjustmentFactor;
        totalNetWorthTimeseries[i] /= adjustmentFactor;
        housingMonthlyCostTimeseries[i] /= adjustmentFactor;
    }

    // Compute max inflation-adjusted net worth
    const maxNetWorth = Math.max(...totalNetWorthTimeseries); // Using the spread operator to find the max value


    return {
        MaxNetWorth: maxNetWorth,
        TotalNetWorthTimeseries: totalNetWorthTimeseries, 
        SavingsTimeseries: savingsTimeseries,
        HousingMonthlyCostTimeseries: housingMonthlyCostTimeseries
    };
}