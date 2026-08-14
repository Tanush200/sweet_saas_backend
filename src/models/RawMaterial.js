const mongoose = require('mongoose');

const RawMaterialSchema = new mongoose.Schema(
  {
    _id: { type: String },
    tenantId: { type: String, required: true, index: true },
    nameEn: { type: String, default: 'Raw Material' },
    nameBn: { type: String, default: 'কাঁচামাল' },
    unit: { type: String, default: 'kg' },
    currentStock: { type: Number, default: 0 },
    reorderAlertLevel: { type: Number, default: 10 },
    reorderLevel: { type: Number, default: 10 },
    avgDailyUsage: { type: Number, default: 5 },
    costPerUnit: { type: Number, default: 0 },
    daysRemaining: { type: Number, default: 10 },
    isReorderNeeded: { type: Boolean, default: false },
    stockDate: { type: String },
    entryDate: { type: String },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false, timestamps: true }
);

module.exports = mongoose.models.RawMaterial || mongoose.model('RawMaterial', RawMaterialSchema);
