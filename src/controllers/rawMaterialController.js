const RawMaterial = require('../models/RawMaterial');
const { getTenantId } = require('../utils/tenant');

const getRawMaterials = async (req, res) => {
  try {
    const tenantId = await getTenantId(req);
    const shopSlug = req.query?.shopSlug || req.body?.shopSlug;

    const query = shopSlug
      ? { $or: [{ tenantId }, { tenantId: shopSlug }] }
      : { tenantId };

    const materials = await RawMaterial.find(query).sort({ createdAt: -1, _id: -1 }).lean();

    const formatted = (materials || []).map((mat) => {
      const dailyUsage = mat.avgDailyUsage || 1;
      const daysRemaining = dailyUsage > 0 ? Number((mat.currentStock / dailyUsage).toFixed(1)) : 99;
      const isReorderNeeded = mat.currentStock <= (mat.reorderAlertLevel || mat.reorderLevel || 10);
      return {
        ...mat,
        daysRemaining,
        isReorderNeeded,
        stockDate: mat.stockDate || mat.entryDate || new Date().toISOString().split('T')[0]
      };
    });

    res.json({ success: true, materials: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createRawMaterial = async (req, res) => {
  try {
    const tenantId = await getTenantId(req);
    const { nameEn, nameBn, currentStock, unit, reorderAlertLevel, avgDailyUsage, stockDate, entryDate } = req.body;

    const stock = Number(currentStock || 0);
    const dailyUsage = Number(avgDailyUsage || 5);
    const alertLevel = Number(reorderAlertLevel || 10);
    const formattedDate = stockDate || entryDate || new Date().toISOString().split('T')[0];

    const newMaterial = {
      _id: `rm_${Date.now()}`,
      tenantId,
      nameEn: nameEn || 'Raw Material',
      nameBn: nameBn || nameEn || 'কাঁচামাল',
      currentStock: stock,
      unit: unit || 'kg',
      reorderAlertLevel: alertLevel,
      reorderLevel: alertLevel,
      avgDailyUsage: dailyUsage,
      daysRemaining: Number((stock / (dailyUsage || 1)).toFixed(1)),
      isReorderNeeded: stock <= alertLevel,
      stockDate: formattedDate,
      entryDate: formattedDate,
      createdAt: new Date()
    };

    const savedMaterial = await RawMaterial.create(newMaterial);

    res.status(201).json({ success: true, material: savedMaterial });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateRawMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { nameEn, nameBn, currentStock, unit, reorderAlertLevel, avgDailyUsage, stockDate, entryDate } = req.body;

    const updateData = {};
    if (nameEn) updateData.nameEn = nameEn;
    if (nameBn) updateData.nameBn = nameBn;
    if (currentStock !== undefined) updateData.currentStock = Number(currentStock);
    if (unit) updateData.unit = unit;
    if (reorderAlertLevel !== undefined) {
      updateData.reorderAlertLevel = Number(reorderAlertLevel);
      updateData.reorderLevel = Number(reorderAlertLevel);
    }
    if (avgDailyUsage !== undefined) updateData.avgDailyUsage = Number(avgDailyUsage);
    if (stockDate || entryDate) {
      updateData.stockDate = stockDate || entryDate;
      updateData.entryDate = stockDate || entryDate;
    }

    await RawMaterial.updateOne({ _id: id }, { $set: updateData });

    res.json({ success: true, message: 'Raw material updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { addedStock, currentStock } = req.body;

    if (currentStock !== undefined) {
      await RawMaterial.updateOne({ _id: id }, { $set: { currentStock: Number(currentStock) } });
    } else if (addedStock !== undefined) {
      await RawMaterial.updateOne({ _id: id }, { $inc: { currentStock: Number(addedStock) } });
    }

    res.json({ success: true, message: 'Stock updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteRawMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    await RawMaterial.deleteOne({ _id: id });
    res.json({ success: true, message: 'Raw material deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getRawMaterials, createRawMaterial, updateRawMaterial, updateStock, deleteRawMaterial };
