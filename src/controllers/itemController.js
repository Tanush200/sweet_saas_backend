const Item = require('../models/Item');
const { getTenantId } = require('../utils/tenant');

const getItems = async (req, res) => {
  try {
    const tenantId = await getTenantId(req);
    const shopSlug = req.query?.shopSlug || req.body?.shopSlug;

    const query = shopSlug
      ? { $or: [{ tenantId }, { tenantId: shopSlug }] }
      : { tenantId };

    const items = await Item.find(query).sort({ createdAt: -1, _id: -1 }).lean();
    res.json({ success: true, items: items || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createItem = async (req, res) => {
  try {
    const tenantId = await getTenantId(req);
    const { nameEn, nameBn, category, pricePerKg, price, shelfLifeDays, unit, imageUrl } = req.body;

    const newItem = {
      _id: `item_${Date.now()}`,
      tenantId,
      nameEn,
      nameBn: nameBn || nameEn,
      category: category || 'MILK_BASED',
      pricePerKg: Number(pricePerKg || price || 100),
      shelfLifeDays: Number(shelfLifeDays || 3),
      unit: unit || 'kg',
      imageUrl: imageUrl || '',
      createdAt: new Date()
    };

    const saved = await Item.create(newItem);

    res.status(201).json({ success: true, item: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    await Item.updateOne({ _id: id }, { $set: updateData });

    res.json({ success: true, message: 'Item updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    await Item.deleteOne({ _id: id });

    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const Shop = require('../models/Shop');

const getPublicItems = async (req, res) => {
  try {
    const shopSlug = req.query?.shopSlug;
    if (!shopSlug) {
      return res.status(400).json({ success: false, message: 'shopSlug query parameter is required' });
    }

    const shop = await Shop.findOne({
      $or: [{ slug: shopSlug }, { _id: shopSlug }, { slug: shopSlug.toLowerCase() }]
    }).lean();

    const tenantQueryIds = Array.from(
      new Set([
        shopSlug,
        shopSlug.toLowerCase(),
        shop?._id,
        shop?.slug
      ].filter(Boolean))
    );

    const items = await Item.find({
      tenantId: { $in: tenantQueryIds }
    })
      .sort({ createdAt: -1 })
      .lean();

    const formattedSlugName = shopSlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const shopData = {
      name: shop?.name || formattedSlugName,
      nameBn: shop?.nameBn || shop?.name || formattedSlugName,
      phone: shop?.phone || '+91 98300 98300',
      address: shop?.address || 'Kolkata, West Bengal',
      tagline: shop?.tagline || 'Traditional Fresh Sweets & Snacks'
    };

    res.json({
      success: true,
      shop: shopData,
      items: items || []
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getItems, getPublicItems, createItem, updateItem, deleteItem };
