document.addEventListener('DOMContentLoaded', function() {
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
        slider.addEventListener('input', function() {
            const valueSpan = document.getElementById(slider.id + 'Value');
            valueSpan.textContent = slider.value;
        });
    });

    document.getElementById('plotResults').addEventListener('click', function() {
        const housePrice = parseFloat(document.getElementById('housePrice').value);
        const savings = parseFloat(document.getElementById('savings').value);
        const monthlyRent = parseFloat(document.getElementById('monthlyRent').value);
        const monthlyNetSalary = parseFloat(document.getElementById('monthlyNetSalary').value);
        const monthlyExpensesExceptRent = parseFloat(document.getElementById('monthlyExpensesExceptRent').value);

        const parameters = {
            MortgageDurationYears: parseFloat(document.getElementById('mortgageDurationYears').value),
            MortgageInterestRateYearly: parseFloat(document.getElementById('mortgageInterestRateYearly').value) / 100,
            DownPaymentPercent: parseFloat(document.getElementById('downPaymentPercent').value) / 100,
            ReturnOnSavingsYearly: parseFloat(document.getElementById('returnOnSavingsYearly').value) / 100,
            YearlyNetSalaryGrowth: parseFloat(document.getElementById('yearlyNetSalaryGrowth').value) / 100,
            YearlyHousePriceGrowth: parseFloat(document.getElementById('yearlyHousePriceGrowth').value) / 100,
            YearlyRentIncrease: parseFloat(document.getElementById('yearlyRentIncrease').value) / 100,
            YearlyInterestOnDebt: parseFloat(document.getElementById('yearlyInterestOnDebt').value) / 100
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

let myChart = null; // This variable will hold the chart instance

function plotResults(parameters, initialConditions, timeHorizonYears) {
    const yearsToWait = Array.from({length: timeHorizonYears}, (_, i) => i + 1);
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
}

function computeFinalNetWorth(Parameters, InitialConditions, timeHorizonYears, yearHouseIsBought) {
    // Extract parameters
    const yearlyInterestRate = Parameters.MortgageInterestRateYearly;
    const returnOnSavingsYearly = Parameters.YearlyReturnOnSavings;
    const salaryGrowthYearly = Parameters.YearlyNetSalaryGrowth;
    const housePriceGrowthYearly = Parameters.YearlyHousePriceGrowth;
    const yearlyRentIncreasePercent = Parameters.YearlyRentIncrease;
    const yearlyExpensesIncreasePercent = Parameters.YearlyExpensesIncrease;
    const downPaymentPercent = Parameters.DownPaymentPercent;
    const mortgageDurationYears = Parameters.MortgageDurationYears;
    const yearlyInterestOnNonMortgageDebt = Parameters.YearlyInterestOnDebt;

    // Extract initial conditions
    let housePrice = InitialConditions.HousePrice;
    let savings = InitialConditions.Savings;
    let yearlyRent = InitialConditions.MonthlyRent * 12;
    let yearlyNetSalary = InitialConditions.MonthlyNetSalary * 12;
    let yearlyExpensesExceptRent = InitialConditions.MonthlyExpensesExceptRent * 12;
    
    // Initialize variables
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
    }
    
    // House purchase event
    if (yearHouseIsBought < timeHorizonYears) {
        houseHasBeenBought = true;
        // mortgage parameters
        const downPayment = downPaymentPercent * housePrice;
        const mortgageAmount = housePrice - downPayment;
        const yearlyMortgagePayment = mortgageAmount * yearlyInterestRate * Math.pow((1 + yearlyInterestRate), mortgageDurationYears) / (Math.pow((1 + yearlyInterestRate), mortgageDurationYears) - 1);

        // update balance after house purchase
        totalSavings -= downPayment;
        mortgageDebtOutstanding = housePrice - downPayment;

        // Mortgage period begins
        const yearEndOfMortgage = thisYear + mortgageDurationYears;
        while (thisYear < yearEndOfMortgage && thisYear < timeHorizonYears) {
            thisYear++; // increase time
            if (totalSavings > 0) {
                totalSavings *= (1 + returnOnSavingsYearly);
            } else {
                totalSavings *= (1 + yearlyInterestOnNonMortgageDebt);
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
        }

        // Post-mortgage period begins
        while (thisYear < timeHorizonYears) {
            thisYear++; // increase time
            if (totalSavings > 0) {
                totalSavings *= (1 + returnOnSavingsYearly);
            } else {
                totalSavings *= (1 + yearlyInterestOnNonMortgageDebt);
            }
            housePrice *= (1 + housePriceGrowthYearly);
            yearlyNetSalary *= (1 + salaryGrowthYearly);
            yearlyExpensesExceptRent *= (1 + yearlyExpensesIncreasePercent);
            // Savings balance
            totalSavings += (yearlyNetSalary - yearlyExpensesExceptRent);
        }
    }

    // Final net worth
    let finalNetWorth;
    if (houseHasBeenBought) {
        finalNetWorth = totalSavings + housePrice - mortgageDebtOutstanding;
    } else {
        finalNetWorth = totalSavings;
    }

    return finalNetWorth;
}