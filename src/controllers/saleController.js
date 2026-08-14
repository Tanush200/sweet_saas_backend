const Sale = require('../models/Sale');
const Batch = require('../models/Batch');
const { getTenantId } = require('../utils/tenant');

const getSales = async (req, res) => {
  try {
    const tenantId = await getTenantId(req);
    const shopSlug = req.query?.shopSlug || req.body?.shopSlug;

    const query = shopSlug
      ? { $or: [{ tenantId }, { tenantId: shopSlug }] }
      : { tenantId };

    const sales = await Sale.find(query).sort({ createdAt: -1, _id: -1 }).lean();
    res.json({ success: true, sales: sales || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createSale = async (req, res) => {
  try {
    const tenantId = await getTenantId(req);
    const { items, customerPhone, paymentMethod, discountAmount } = req.body;

    let totalAmount = 0;
    const processedItems = [];

    for (const item of items || []) {
      const subtotal = Math.round(Number(item.qty || 0) * Number(item.unitPrice || item.price || 0) * 100) / 100;
      totalAmount += subtotal;

      processedItems.push({
        itemId: item.itemId || item._id,
        batchId: item.batchId || null,
        nameEn: item.nameEn,
        nameBn: item.nameBn || item.nameEn,
        unit: item.unit || 'kg',
        qty: Number(item.qty || 0),
        unitPrice: Number(item.unitPrice || item.price || 0),
        subtotal
      });

      if (item.batchId) {
        try {
          await Batch.updateOne(
            { _id: item.batchId },
            { $inc: { currentQty: -Number(item.qty || 0) } }
          );
        } catch (e) {}
      }
    }

    totalAmount = Math.round(totalAmount * 100) / 100;
    const discount = Math.round(Number(discountAmount || 0) * 100) / 100;
    const finalPaidAmount = Math.round(Math.max(0, totalAmount - discount) * 100) / 100;
    const saleNumber = `INV-${Date.now().toString().slice(-6)}`;

    const newSale = {
      _id: `sale_${Date.now()}`,
      tenantId,
      saleNumber,
      customerPhone: customerPhone || '',
      items: processedItems,
      totalAmount,
      discountAmount: discount,
      finalPaidAmount,
      paymentMethod: paymentMethod || 'CASH',
      createdAt: new Date()
    };

    const createdSale = await Sale.create(newSale);

    res.status(201).json({ success: true, sale: createdSale });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    await Sale.deleteOne({ _id: id });
    res.json({ success: true, message: 'Sale receipt deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getSales, createSale, deleteSale };
