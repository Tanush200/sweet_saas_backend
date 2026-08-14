const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema(
  {
    _id: { type: String },
    tenantId: { type: String, required: true, index: true },
    saleNumber: { type: String, required: true },
    customerPhone: { type: String, default: '' },
    items: [
      {
        itemId: { type: String, required: true },
        batchId: { type: String },
        nameEn: { type: String, required: true },
        nameBn: { type: String, required: true },
        unit: { type: String, default: 'kg' },
        qty: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        subtotal: { type: Number, required: true }
      }
    ],
    totalAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    finalPaidAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['CASH', 'UPI', 'CARD'], default: 'CASH' },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false, timestamps: true }
);

module.exports = mongoose.models.Sale || mongoose.model('Sale', SaleSchema);
