const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  ingredients: [
    {
      rawMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: 'RawMaterial', required: true },
      quantityPerUnit: { type: Number, required: true } // E.g., 0.4 kg Chhana per 1kg Rasgulla
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recipe', RecipeSchema);
