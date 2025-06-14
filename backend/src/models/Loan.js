const mongoose = require('mongoose');

const paymentHistorySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  amount: { type: Number, required: true },
  principal: { type: Number, required: true },
  interest: { type: Number, required: true },
  remainingBalance: { type: Number, required: true },
});

const loanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['student', 'auto', 'mortgage', 'credit', 'personal'],
    required: true,
  },
  originalAmount: { type: Number, required: true },
  currentBalance: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  minimumPayment: { type: Number, required: true },
  termMonths: { type: Number, required: true },
  remainingMonths: { type: Number, required: true },
  paymentHistory: [paymentHistorySchema],
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Loan', loanSchema);

