class OptimizerService {
  // Debt avalanche method - pay minimum on all, extra on highest interest rate
  calculateDebtAvalanche(loans, extraAmount) {
    const sortedLoans = [...loans].sort((a, b) => b.interestRate - a.interestRate);
    const payments = {};
    let remainingExtra = extraAmount;

    // Pay minimums first
    sortedLoans.forEach(loan => {
      payments[loan._id] = {
        loanId: loan._id,
        loanName: loan.name,
        minimumPayment: loan.minimumPayment,
        extraPayment: 0,
        totalPayment: loan.minimumPayment,
        interestRate: loan.interestRate,
      };
    });

    // Allocate extra to highest interest rate loan
    if (remainingExtra > 0 && sortedLoans.length > 0) {
      const highestInterestLoan = sortedLoans[0];
      payments[highestInterestLoan._id].extraPayment = remainingExtra;
      payments[highestInterestLoan._id].totalPayment += remainingExtra;
    }

    return Object.values(payments);
  }

  // Debt snowball method - pay minimum on all, extra on smallest balance
  calculateDebtSnowball(loans, extraAmount) {
    const sortedLoans = [...loans].sort((a, b) => a.currentBalance - b.currentBalance);
    const payments = {};
    let remainingExtra = extraAmount;

    // Pay minimums first
    sortedLoans.forEach(loan => {
      payments[loan._id] = {
        loanId: loan._id,
        loanName: loan.name,
        minimumPayment: loan.minimumPayment,
        extraPayment: 0,
        totalPayment: loan.minimumPayment,
        currentBalance: loan.currentBalance,
      };
    });

    // Allocate extra to smallest balance loan
    if (remainingExtra > 0 && sortedLoans.length > 0) {
      const smallestBalanceLoan = sortedLoans[0];
      payments[smallestBalanceLoan._id].extraPayment = remainingExtra;
      payments[smallestBalanceLoan._id].totalPayment += remainingExtra;
    }

    return Object.values(payments);
  }

  // Investment vs debt payoff optimization
  calculateOptimalAllocation(loans, availableAmount, expectedReturnRate = 7) {
    const totalMinimumPayments = loans.reduce((sum, loan) => sum + loan.minimumPayment, 0);
    const extraAmount = Math.max(0, availableAmount - totalMinimumPayments);

    if (extraAmount === 0) {
      return {
        recommendation: 'minimum_only',
        message: 'Available amount only covers minimum payments',
        allocation: {
          debtPayment: totalMinimumPayments,
          investment: 0,
        },
        reasoning: 'No extra funds available for optimization',
      };
    }

    // Find highest interest rate
    const highestInterestRate = Math.max(...loans.map(loan => loan.interestRate));

    // Simple rule: if highest debt interest rate > expected return, pay debt first
    if (highestInterestRate > expectedReturnRate) {
      return {
        recommendation: 'debt_first',
        message: `Pay extra toward debt (${highestInterestRate.toFixed(1)}% > ${expectedReturnRate}% expected return)`,
        allocation: {
          debtPayment: availableAmount,
          investment: 0,
        },
        debtStrategy: this.calculateDebtAvalanche(loans, extraAmount),
        reasoning: 'Guaranteed debt interest savings exceed expected investment returns',
      };
    } else {
      // Consider a balanced approach
      const debtPortion = extraAmount * 0.3; // 30% to debt
      const investmentPortion = extraAmount * 0.7; // 70% to investment

      return {
        recommendation: 'balanced',
        message: 'Split between debt payoff and investment',
        allocation: {
          debtPayment: totalMinimumPayments + debtPortion,
          investment: investmentPortion,
        },
        debtStrategy: this.calculateDebtAvalanche(loans, debtPortion),
        reasoning: 'Expected investment returns justify balanced approach',
      };
    }
  }

  // Calculate long-term projections
  calculateLongTermProjections(loans, monthlyInvestment, expectedReturnRate = 7, yearsToProject = 10) {
    const monthlyRate = expectedReturnRate / 100 / 12;
    const months = yearsToProject * 12;

    // Investment growth calculation (compound interest)
    const futureValue = monthlyInvestment *
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

    // Debt payoff calculations
    let totalInterestSaved = 0;
    const debtProjections = loans.map(loan => {
      const projection = this.calculateLoanProjection(loan, 0); // minimum payments
      totalInterestSaved += projection.totalInterest;
      return projection;
    });

    return {
      investmentValue: futureValue,
      totalInvested: monthlyInvestment * months,
      investmentGains: futureValue - (monthlyInvestment * months),
      totalInterestSaved,
      netWorthImpact: futureValue - totalInterestSaved,
      debtProjections,
    };
  }

  calculateLoanProjection(loan, extraPayment = 0) {
    const monthlyInterestRate = loan.interestRate / 100 / 12;
    const monthlyPayment = loan.minimumPayment + extraPayment;
    let balance = loan.currentBalance;
    let totalInterest = 0;
    let months = 0;

    while (balance > 0.01 && months < 600) {
      const interestPayment = balance * monthlyInterestRate;
      const principalPayment = Math.min(monthlyPayment - interestPayment, balance);
      
      if (principalPayment <= 0) break;
      
      balance -= principalPayment;
      totalInterest += interestPayment;
      months++;

      if (balance <= 0) break;
    }

    return {
      monthsToPayoff: months,
      totalInterest,
      totalPayments: totalInterest + loan.currentBalance,
    };
  }
}

module.exports = new OptimizerService();
