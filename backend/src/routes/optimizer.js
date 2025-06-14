const express = require('express');
const auth = require('../middleware/auth');
const optimizerService = require('../services/optimizerService');
const Loan = require('../models/Loan');

const router = express.Router();

// Get optimal allocation recommendation
router.post('/allocation', auth, async (req, res) => {
  try {
    const { availableAmount, expectedReturn = 7 } = req.body;
    
    // Get user's loans
    const loans = await Loan.find({ userId: req.userId, isActive: true });
    
    if (loans.length === 0) {
      return res.json({
        recommendation: 'invest_all',
        message: 'No debt found - invest the full amount',
        allocation: {
          debtPayment: 0,
          investment: availableAmount,
        },
        reasoning: 'No debt to pay off',
      });
    }

    const optimization = optimizerService.calculateOptimalAllocation(
      loans, 
      parseFloat(availableAmount), 
      parseFloat(expectedReturn)
    );

    res.json(optimization);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get debt avalanche strategy
router.post('/debt-avalanche', auth, async (req, res) => {
  try {
    const { extraAmount } = req.body;
    const loans = await Loan.find({ userId: req.userId, isActive: true });
    
    const strategy = optimizerService.calculateDebtAvalanche(loans, parseFloat(extraAmount));
    res.json(strategy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get debt snowball strategy
router.post('/debt-snowball', auth, async (req, res) => {
  try {
    const { extraAmount } = req.body;
    const loans = await Loan.find({ userId: req.userId, isActive: true });
    
    const strategy = optimizerService.calculateDebtSnowball(loans, parseFloat(extraAmount));
    res.json(strategy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get long-term projections
router.post('/projections', auth, async (req, res) => {
  try {
    const { monthlyInvestment, expectedReturn = 7, years = 10 } = req.body;
    const loans = await Loan.find({ userId: req.userId, isActive: true });
    
    const projections = optimizerService.calculateLongTermProjections(
      loans,
      parseFloat(monthlyInvestment),
      parseFloat(expectedReturn),
      parseInt(years)
    );
    
    res.json(projections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

