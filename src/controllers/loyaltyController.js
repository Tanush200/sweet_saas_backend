const Customer = require('../models/Customer');
const { getTenantId } = require('../utils/tenant');

const getCustomerByPhone = async (req, res) => {
  try {
    const tenantId = await getTenantId(req);
    const { phone } = req.params;

    let customer = await Customer.findOne({ phone, tenantId }).lean();

    if (!customer) {
      const newCustData = {
        _id: `cust_${Date.now()}`,
        tenantId,
        phone,
        name: 'Regular Customer',
        points: 0,
        boxStamps: 0,
        totalVisits: 1,
        totalSpent: 0,
        lastVisit: new Date()
      };
      try {
        customer = await Customer.create(newCustData);
      } catch (e) {
        customer = newCustData;
      }
    }

    const freeBoxesEarned = Math.floor((customer.boxStamps || 0) / 10);
    res.json({
      success: true,
      customer: { ...customer, freeBoxesEarned }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const redeemReward = async (req, res) => {
  try {
    const tenantId = await getTenantId(req);
    const { phone, redeemType } = req.body;

    let customer = await Customer.findOne({ phone, tenantId });

    let discountApplied = 0;
    if (customer) {
      if (redeemType === 'STAMP_BOX' && customer.boxStamps >= 10) {
        customer.boxStamps -= 10;
        discountApplied = 250;
      } else if (redeemType === 'POINTS' && customer.points >= 50) {
        discountApplied = customer.points;
        customer.points = 0;
      }
      await customer.save();
    }

    res.json({ success: true, customer, discountApplied });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCustomerByPhone, redeemReward };
