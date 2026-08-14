const Shop = require('../models/Shop');

const getTenantId = async (req) => {
  const shopSlug =
    req.query?.shopSlug ||
    req.body?.shopSlug ||
    req.headers['x-shop-slug'] ||
    req.params?.shopSlug;

  if (shopSlug) {
    try {
      const shop = await Shop.findOne({
        $or: [{ slug: shopSlug }, { _id: shopSlug }]
      }).lean();
      if (shop) return shop._id;
    } catch (e) {}

    return shopSlug;
  }

  return req.user?.tenantId || 'shop_001';
};

module.exports = { getTenantId };
