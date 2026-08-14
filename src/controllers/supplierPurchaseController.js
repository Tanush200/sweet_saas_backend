const SupplierPurchase = require('../models/SupplierPurchase');
const RawMaterial = require('../models/RawMaterial');
const { getTenantId } = require('../utils/tenant');

const getSupplierPurchases = async (req, res) => {
  try {
    const tenantId = await getTenantId(req);
    const shopSlug = req.query?.shopSlug || req.body?.shopSlug;

    const query = shopSlug
      ? { $or: [{ tenantId }, { tenantId: shopSlug }] }
      : { tenantId };

    const purchases = await SupplierPurchase.find(query).sort({ createdAt: -1, _id: -1 }).lean();

    res.json({ success: true, purchases: purchases || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createSupplierPurchase = async (req, res) => {
  try {
    const tenantId = await getTenantId(req);
    const { supplierName, materialName, qty, unit, totalCost, amountPaid, paymentMethod } = req.body;

    const cost = Number(totalCost || 0);
    const paid = Number(amountPaid || 0);
    const balanceDue = Math.max(0, cost - paid);
    const status = balanceDue === 0 ? 'PAID' : paid > 0 ? 'PARTIAL_PAID' : 'UNPAID';

    const newPurchase = {
      _id: `sp_${Date.now()}`,
      tenantId,
      supplierName: supplierName || 'Local Supplier / Person',
      materialName: materialName || 'Raw Material Item',
      qty: Number(qty || 0),
      unit: unit || 'kg',
      totalCost: cost,
      amountPaid: paid,
      balanceDue,
      dueAmount: balanceDue,
      paymentMethod: paymentMethod || 'CASH',
      purchaseDate: new Date().toISOString(),
      status,
      createdAt: new Date()
    };

    const savedPurchase = await SupplierPurchase.create(newPurchase);

    // Auto update matching raw material stock in MongoDB
    if (materialName) {
      try {
        await RawMaterial.updateOne(
          {
            tenantId,
            $or: [
              { nameEn: { $regex: new RegExp(materialName, 'i') } },
              { nameBn: { $regex: new RegExp(materialName, 'i') } }
            ]
          },
          { $inc: { currentStock: Number(qty || 0) } }
        );
      } catch (e) {}
    }

    res.status(201).json({ success: true, purchase: savedPurchase });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateSupplierPurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplierName, materialName, qty, unit, totalCost, amountPaid, paymentMethod } = req.body;

    const updateData = {};
    if (supplierName) updateData.supplierName = supplierName;
    if (materialName) updateData.materialName = materialName;
    if (qty !== undefined) updateData.qty = Number(qty);
    if (unit) updateData.unit = unit;
    if (totalCost !== undefined) updateData.totalCost = Number(totalCost);
    if (amountPaid !== undefined) updateData.amountPaid = Number(amountPaid);
    if (paymentMethod) updateData.paymentMethod = paymentMethod;

    if (totalCost !== undefined || amountPaid !== undefined) {
      const cost = totalCost !== undefined ? Number(totalCost) : 0;
      const paid = amountPaid !== undefined ? Number(amountPaid) : 0;
      updateData.balanceDue = Math.max(0, cost - paid);
      updateData.dueAmount = Math.max(0, cost - paid);
      updateData.status = updateData.balanceDue === 0 ? 'PAID' : paid > 0 ? 'PARTIAL_PAID' : 'UNPAID';
    }

    await SupplierPurchase.updateOne({ _id: id }, { $set: updateData });

    res.json({ success: true, message: 'Supplier purchase updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const recordSupplierPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { additionalPayment } = req.body;
    const pay = Number(additionalPayment || 0);

    const existing = await SupplierPurchase.findById(id).lean();
    if (existing) {
      const newPaid = Number(existing.amountPaid || 0) + pay;
      const newDue = Math.max(0, Number(existing.totalCost || 0) - newPaid);
      await SupplierPurchase.updateOne(
        { _id: id },
        {
          $set: {
            amountPaid: newPaid,
            balanceDue: newDue,
            dueAmount: newDue,
            status: newDue === 0 ? 'PAID' : 'PARTIAL_PAID'
          }
        }
      );
    }

    res.json({ success: true, message: 'Payment recorded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteSupplierPurchase = async (req, res) => {
  try {
    const { id } = req.params;
    await SupplierPurchase.deleteOne({ _id: id });
    res.json({ success: true, message: 'Supplier purchase deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getSupplierPurchases,
  createSupplierPurchase,
  updateSupplierPurchase,
  recordSupplierPayment,
  deleteSupplierPurchase
};
