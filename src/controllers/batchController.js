const Batch = require('../models/Batch');
const { getTenantId } = require('../utils/tenant');

const getBatches = async (req, res) => {
  try {
    const tenantId = await getTenantId(req);
    const shopSlug = req.query?.shopSlug || req.body?.shopSlug;
    const now = new Date();

    const query = shopSlug
      ? { $or: [{ tenantId }, { tenantId: shopSlug }] }
      : { tenantId };

    const batches = await Batch.find(query).sort({ createdAt: -1, _id: -1 }).lean();

    const updatedBatches = (batches || []).map((batch) => {
      const bObj = { ...batch };
      const expDate = bObj.dueDate || bObj.expiryDate;
      const hoursUntilExpiry = expDate ? (new Date(expDate) - now) / (1000 * 60 * 60) : 48;

      if (bObj.status !== 'WASTED') {
        if (hoursUntilExpiry < 0 && (bObj.qty > 0 || bObj.currentQty > 0)) {
          bObj.status = 'EXPIRED';
        } else if (hoursUntilExpiry <= 24 && (bObj.qty > 0 || bObj.currentQty > 0) && bObj.status !== 'DISCOUNT_TODAY') {
          bObj.status = 'DISCOUNT_TODAY';
          if (!bObj.discountPercent) bObj.discountPercent = 30;
        }
      }
      return bObj;
    });

    res.json({ success: true, batches: updatedBatches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createBatch = async (req, res) => {
  try {
    const tenantId = await getTenantId(req);
    const { itemId, sweetName, batchCode, qty, unit, mfgDate, dueDate } = req.body;

    const productionDate = mfgDate ? new Date(mfgDate) : new Date();
    const expiryDate = dueDate ? new Date(dueDate) : new Date(productionDate.getTime() + 3 * 24 * 60 * 60 * 1000);
    const generatedCode = batchCode || `BATCH-${Date.now().toString().slice(-6)}`;

    const newBatch = {
      _id: `batch_${Date.now()}`,
      tenantId,
      itemId: itemId || `item_${Date.now()}`,
      sweetName: sweetName || 'Sweet Batch',
      batchCode: generatedCode,
      qty: Number(qty || 0),
      initialQty: Number(qty || 0),
      currentQty: Number(qty || 0),
      unit: unit || 'kg',
      mfgDate: productionDate,
      dueDate: dueDate || expiryDate.toISOString().split('T')[0],
      expiryDate: expiryDate,
      status: 'FRESH',
      discountPercent: 0,
      createdAt: new Date()
    };

    const savedBatch = await Batch.create(newBatch);

    res.status(201).json({ success: true, batch: savedBatch });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const applyDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { discountPercent = 30 } = req.body;

    await Batch.updateOne(
      { _id: id },
      { $set: { discountPercent: Number(discountPercent), status: 'DISCOUNT_TODAY' } }
    );

    res.json({ success: true, message: 'Discount applied successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const markWasted = async (req, res) => {
  try {
    const { id } = req.params;

    await Batch.updateOne({ _id: id }, { $set: { status: 'WASTED', currentQty: 0, qty: 0 } });

    res.json({ success: true, message: 'Batch marked as wasted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;

    await Batch.deleteOne({ _id: id });

    res.json({ success: true, message: 'Batch deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getBatches, createBatch, applyDiscount, markWasted, deleteBatch };
