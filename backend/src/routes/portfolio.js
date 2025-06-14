const express = require('express');
const Portfolio = require('../models/Portfolio');
const auth = require('../middleware/auth');
const { getStockPrice } = require('../services/stockService');

const router = express.Router();

// Get user's portfolios
router.get('/', auth, async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ userId: req.userId });
    res.json(portfolios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new portfolio
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const portfolio = new Portfolio({
      userId: req.userId,
      name: name || 'My Portfolio',
    });

    await portfolio.save();
    res.status(201).json(portfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add stock to portfolio
router.post('/:portfolioId/stocks', auth, async (req, res) => {
  try {
    const { symbol, shares, price } = req.body;
    const portfolio = await Portfolio.findOne({
      _id: req.params.portfolioId,
      userId: req.userId,
    });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    // Check if stock already exists
    const existingHolding = portfolio.holdings.find(h => h.symbol === symbol.toUpperCase());
    
    if (existingHolding) {
      // Update existing holding
      const totalShares = existingHolding.shares + shares;
      const totalCost = (existingHolding.shares * existingHolding.averageCost) + (shares * price);
      existingHolding.shares = totalShares;
      existingHolding.averageCost = totalCost / totalShares;
    } else {
      // Add new holding
      portfolio.holdings.push({
        symbol: symbol.toUpperCase(),
        shares,
        averageCost: price,
        currentPrice: price,
      });
    }

    // Update portfolio totals
    portfolio.totalCost += shares * price;
    await portfolio.save();
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update portfolio with current prices
router.put('/:portfolioId/refresh', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({
      _id: req.params.portfolioId,
      userId: req.userId,
    });

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    let totalValue = 0;

    // Update current prices for each holding
    for (let holding of portfolio.holdings) {
      try {
        const currentPrice = await getStockPrice(holding.symbol);
        holding.currentPrice = currentPrice;
        holding.lastUpdated = new Date();
        totalValue += holding.shares * currentPrice;
      } catch (error) {
        console.error(`Error updating price for ${holding.symbol}:`, error);
        // Use existing price if update fails
        totalValue += holding.shares * holding.currentPrice;
      }
    }

    // Update portfolio performance
    portfolio.totalValue = totalValue;
    portfolio.performance.totalReturn = totalValue - portfolio.totalCost;
    portfolio.performance.totalReturnPercent = portfolio.totalCost > 0 
      ? ((totalValue - portfolio.totalCost) / portfolio.totalCost) * 100 
      : 0;

    await portfolio.save();
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

