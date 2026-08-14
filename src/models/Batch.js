const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema(
  {
    _id: { type: String },
    tenantId: { type: String, required: true, index: true },
    sweetName: { type: String, default: 'Sweet Item' },
    qty: { type: Number, default: 0 },
    currentQty: { type: Number, default: 0 },
    initialQty: { type: Number, default: 0 },
    unit: { type: String, default: 'kg' },
    dueDate: { type: String },
    expiryDate: { type: Date },
    mfgDate: { type: Date, default: Date.now },
    itemId: { type: String, index: true },
    batchCode: { type: String },
    discountPercent: { type: Number, default: 0 },
    status: { type: String, default: 'FRESH' },
    wasteQty: { type: Number, default: 0 },
    wasteReason: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false, timestamps: true }
);

module.exports = mongoose.models.Batch || mongoose.model('Batch', BatchSchema);
