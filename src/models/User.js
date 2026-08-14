const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    plainPassword: { type: String, default: '' },
    role: { type: String, enum: ['SUPER_ADMIN', 'SHOP_OWNER'], default: 'SHOP_OWNER' },
    tenantId: { type: String, default: null, index: true },
    language: { type: String, enum: ['en', 'bn'], default: 'en' },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false, timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
