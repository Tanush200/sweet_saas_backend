const mongoose = require('mongoose');

const SupplierPurchaseSchema = new mongoose.Schema(
  {
    _id: { type: String },
    tenantId: { type: String, required: true, index: true },
    supplierName: { type: String, default: 'Local Supplier' },
    materialName: { type: String, default: 'Raw Material' },
    qty: { type: Number, default: 0 },
    unit: { type: String, default: 'kg' },
    totalCost: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, default: 'CASH' },
    purchaseDate: { type: String },
    status: { type: String, default: 'PAID' },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false, timestamps: true }
);

module.exports = mongoose.models.SupplierPurchase || mongoose.model('SupplierPurchase', SupplierPurchaseSchema);
