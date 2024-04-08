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
            MortgageInterestRateYearly: parseFloat(document.getElementById('mortgageInterestRateYearly').value) / 100,
            DownPaymentPercent: parseFloat(document.getElementById('downPaymentPercent').value) / 100,
            MortgageDurationYears: parseFloat(document.getElementById('mortgageDurationYears').value),
            ReturnOnSavingsYearly: parseFloat(document.getElementById('returnOnSavingsYearly').value) / 100,
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
    const monthsToWait = Array.from({length: timeHorizonYears * 12 - 1}, (_, i) => i + 1);
    const finalNetWorthForThisCase = monthsToWait.map(month => computeFinalNetWorth(parameters, initialConditions, timeHorizonYears, month));

    const ctx = document.getElementById('resultsChart').getContext('2d');
    
    // Check if a chart instance already exists
    if (myChart) {
        myChart.destroy(); // Destroy the existing chart
    }
    
    // Create a new chart instance and assign it to the 'myChart' variable
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthsToWait.map(month => (month / 12).toFixed(1)),
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
                        text: 'Savings + HouseEquity - Debts (GBP)'
                    }
                }
            }
        }
    });
}

function computeFinalNetWorth(Parameters, InitialConditions, timeHorizonYears, monthHouseIsBought) {
    // Extract parameters and initial conditions
    const monthlyInterestRate = Parameters.MortgageInterestRateYearly / 12;
    const returnOnSavingsMonthly = Parameters.ReturnOnSavingsYearly / 12;
    const monthlyRentIncreasePercent = Parameters.YearlyRentIncrease / 12;
    const downPaymentPercent = Parameters.DownPaymentPercent;
    const mortgageDurationMonths = Parameters.MortgageDurationYears * 12;
    const monthlyInterestOnNonMortgageDebt = Parameters.YearlyInterestOnDebt / 12;
    const housePrice = InitialConditions.HousePrice;
    const savings = InitialConditions.Savings;
    const monthlyRent = InitialConditions.MonthlyRent;
    const monthlyNetSalary = InitialConditions.MonthlyNetSalary;
    const monthlyExpensesExceptRent = InitialConditions.MonthlyExpensesExceptRent;
  
    // Calculate down payment and initial mortgage amount
    const downPayment = downPaymentPercent * housePrice;
    let mortgageAmount = housePrice - downPayment;
  
    // Calculate monthly mortgage payment using the formula for fixed-rate mortgages
    const monthlyMortgagePayment = mortgageAmount * (monthlyInterestRate * Math.pow((1 + monthlyInterestRate), mortgageDurationMonths)) / (Math.pow((1 + monthlyInterestRate), mortgageDurationMonths) - 1);
  
    // Initialize variables to track savings and expenses
    let totalSavings = savings;
    const monthsToWait = monthHouseIsBought - 1; // Convert to 0-based indexing for calculations
    let monthlyRentVar = monthlyRent; // To allow monthly rent to be updated
    
    // Calculate financial situation until the house is bought
    for (let month = 1; month <= monthsToWait; month++) {
      totalSavings *= (1 + returnOnSavingsMonthly); // Increase savings by monthly ROI
      monthlyRentVar *= (1 + monthlyRentIncreasePercent);
      totalSavings += (monthlyNetSalary - monthlyRentVar - monthlyExpensesExceptRent); // Add net income
    }
  
    // Update savings to account for down payment
    totalSavings -= downPayment;
    let debtOutstanding = housePrice - downPayment;
    let equityInHouse = downPayment;
  
    // Calculate financial situation from house purchase to end of mortgage
    const monthEndOfMortgage = monthsToWait + mortgageDurationMonths;
    for (let month = monthsToWait; month <= monthEndOfMortgage; month++) {
      if (totalSavings > 0) {
        totalSavings *= (1 + returnOnSavingsMonthly); // Increase savings by monthly ROI
      } else {
        totalSavings *= (1 + monthlyInterestOnNonMortgageDebt); // consider adding debt interest rate
      }
      totalSavings += (monthlyNetSalary - monthlyMortgagePayment - monthlyExpensesExceptRent);
      const interestPaidOnMortgageThisMonth = debtOutstanding * monthlyInterestRate;
      const incrementInEquityThisMonth = monthlyMortgagePayment - interestPaidOnMortgageThisMonth;
      equityInHouse += incrementInEquityThisMonth;
      debtOutstanding -= incrementInEquityThisMonth;
    }
  
    // Calculate financial situation from end of mortgage to end of timeHorizonInYears
    const finalMonth = timeHorizonYears * 12;
    for (let month = monthEndOfMortgage; month <= finalMonth; month++) {
      totalSavings *= (1 + returnOnSavingsMonthly); // Increase savings by monthly ROI
      totalSavings += (monthlyNetSalary - monthlyExpensesExceptRent);
    }
  
    // Final net worth is the total savings plus the house value because it is fully paid
    const finalNetWorth = totalSavings + equityInHouse - debtOutstanding;
  
    return finalNetWorth;
  }