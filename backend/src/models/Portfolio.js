const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  shares: { type: Number, required: true },
  averageCost: { type: Number, required: true },
  currentPrice: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    default: 'My Portfolio',
  },
  totalValue: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  holdings: [holdingSchema],
  performance: {
    totalReturn: { type: Number, default: 0 },
    totalReturnPercent: { type: Number, default: 0 },
    dayChange: { type: Number, default: 0 },
    dayChangePercent: { type: Number, default: 0 },
  },
  isVirtual: { type: Boolean, default: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Portfolio', portfolioSchema);

