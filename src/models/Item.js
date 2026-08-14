const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema(
  {
    _id: { type: String },
    tenantId: { type: String, required: true, index: true },
    nameEn: { type: String, required: true },
    nameBn: { type: String, required: true },
    category: { type: String, default: 'MILK_BASED' },
    pricePerKg: { type: Number, required: true },
    shelfLifeDays: { type: Number, default: 3 },
    unit: { type: String, default: 'kg' },
    imageUrl: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now, index: true }
  },
  { _id: false, timestamps: true }
);

module.exports = mongoose.models.Item || mongoose.model('Item', ItemSchema);
