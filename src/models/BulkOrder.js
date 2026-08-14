const mongoose = require('mongoose');

const BulkOrderSchema = new mongoose.Schema(
  {
    _id: { type: String },
    tenantId: { type: String, required: true, index: true },
    customerName: { type: String, default: 'Valued Customer' },
    customerPhone: { type: String, default: '' },
    phone: { type: String, default: '' },
    festivalTag: { type: String, default: 'GENERAL' },
    festivalName: { type: String, default: '' },
    deliveryDate: { type: String },
    deliverySlot: { type: String, default: '' },
    customBox: { type: String, default: '' },
    items: [],
    totalAmount: { type: Number, default: 0 },
    advancePaid: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },
    status: { type: String, enum: ['BOOKED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'], default: 'BOOKED' },
    notes: { type: String, default: '' },
    paymentStatus: { type: String, default: 'UNPAID' },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false, timestamps: true }
);

module.exports = mongoose.models.BulkOrder || mongoose.model('BulkOrder', BulkOrderSchema);
