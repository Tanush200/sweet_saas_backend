const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema(
  {
    _id: { type: String },
    tenantId: { type: String, required: true, index: true },
    phone: { type: String, required: true, index: true },
    name: { type: String, default: 'Valued Customer' },
    points: { type: Number, default: 0 },
    boxStamps: { type: Number, default: 0 },
    totalVisits: { type: Number, default: 1 },
    totalSpent: { type: Number, default: 0 },
    lastVisit: { type: Date, default: Date.now }
  },
  { _id: false, timestamps: true }
);

module.exports = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
