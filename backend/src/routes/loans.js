const express = require('express');
const Loan = require('../models/Loan');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's loans
router.get('/', auth, async (req, res) => {
  try {
    const loans = await Loan.find({ userId: req.userId, isActive: true });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new loan
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      type,
      originalAmount,
      currentBalance,
      interestRate,
      minimumPayment,
      termMonths,
    } = req.body;

    const loan = new Loan({
      userId: req.userId,
      name,
      type,
      originalAmount,
      currentBalance,
      interestRate,
      minimumPayment,
      termMonths,
      remainingMonths: termMonths,
    });

    await loan.save();
    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Make payment
router.post('/:loanId/payment', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const loan = await Loan.findOne({
      _id: req.params.loanId,
      userId: req.userId,
    });

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Calculate interest and principal portions
    const monthlyInterestRate = loan.interestRate / 100 / 12;
    const interestPayment = loan.currentBalance * monthlyInterestRate;
    const principalPayment = Math.max(0, amount - interestPayment);

    // Update loan balance
    loan.currentBalance = Math.max(0, loan.currentBalance - principalPayment);

    // Add to payment history
    loan.paymentHistory.push({
      amount,
      principal: principalPayment,
      interest: interestPayment,
      remainingBalance: loan.currentBalance,
    });

    // Update remaining months (simplified calculation)
    if (loan.currentBalance === 0) {
      loan.isActive = false;
      loan.remainingMonths = 0;
    } else {
      // Recalculate remaining months based on minimum payment
      const monthlyPayment = loan.minimumPayment;
      if (monthlyPayment > interestPayment) {
        loan.remainingMonths = Math.ceil(
          Math.log(1 + (loan.currentBalance * monthlyInterestRate) / monthlyPayment) /
          Math.log(1 + monthlyInterestRate)
        );
      }
    }

    await loan.save();
    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get loan payoff projections
router.get('/:loanId/projections', auth, async (req, res) => {
  try {
    const { extraPayment = 0 } = req.query;
    const loan = await Loan.findOne({
      _id: req.params.loanId,
      userId: req.userId,
    });

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    const projections = calculateLoanProjections(loan, parseFloat(extraPayment));
    res.json(projections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function calculateLoanProjections(loan, extraPayment = 0) {
  const monthlyInterestRate = loan.interestRate / 100 / 12;
  const monthlyPayment = loan.minimumPayment + extraPayment;
  let balance = loan.currentBalance;
  let month = 0;
  let totalInterest = 0;
  const schedule = [];

  while (balance > 0.01 && month < 600) { // Cap at 50 years
    const interestPayment = balance * monthlyInterestRate;
    const principalPayment = Math.min(monthlyPayment - interestPayment, balance);
    
    if (principalPayment <= 0) break; // Prevent infinite loop
    
    balance -= principalPayment;
    totalInterest += interestPayment;
    month++;

    schedule.push({
      month,
      payment: principalPayment + interestPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance),
    });

    if (balance <= 0) break;
  }

  return {
    monthsToPayoff: month,
    totalInterest,
    totalPayments: totalInterest + loan.currentBalance,
    schedule: schedule.slice(0, Math.min(120, schedule.length)), // First 10 years
  };
}

module.exports = router;

