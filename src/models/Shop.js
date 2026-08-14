const mongoose = require('mongoose');

const ShopSchema = new mongoose.Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    nameBn: { type: String, default: '' },
    slug: { type: String, default: '', index: true },
    ownerName: { type: String, required: true },
    phone: { type: String, required: true },
    ownerEmail: { type: String, default: '', index: true },
    ownerPassword: { type: String, default: '' },
    address: { type: String, default: '' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false, timestamps: true }
);

module.exports = mongoose.models.Shop || mongoose.model('Shop', ShopSchema);
