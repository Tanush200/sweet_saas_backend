const BulkOrder = require('../models/BulkOrder');
const { getTenantId } = require('../utils/tenant');

const getBulkOrders = async (req, res) => {
  try {
    const tenantId = await getTenantId(req);
    const shopSlug = req.query?.shopSlug || req.body?.shopSlug;

    const query = shopSlug
      ? { $or: [{ tenantId }, { tenantId: shopSlug }] }
      : { tenantId };

    const orders = await BulkOrder.find(query).sort({ createdAt: -1, _id: -1 }).lean();
    res.json({ success: true, orders: orders || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createBulkOrder = async (req, res) => {
  try {
    const tenantId = await getTenantId(req);
    const {
      customerName,
      customerPhone,
      phone,
      festivalTag,
      festivalName,
      deliveryDate,
      deliverySlot,
      items,
      totalAmount,
      advancePaid,
      dueAmount,
      customBox,
      notes
    } = req.body;

    const parsedItems = Array.isArray(items) ? items : [];
    const calcTotal = totalAmount || parsedItems.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.unitPrice || item.price || 0), 0);
    const advance = Number(advancePaid || 0);
    const due = dueAmount !== undefined ? Number(dueAmount) : Math.max(0, calcTotal - advance);

    const newOrder = {
      _id: `bo_${Date.now()}`,
      tenantId,
      customerName: customerName || 'Valued Customer',
      customerPhone: customerPhone || phone || '',
      phone: phone || customerPhone || '',
      festivalTag: festivalTag || 'GENERAL',
      festivalName: festivalName || festivalTag || 'Festival Order',
      deliveryDate: deliveryDate || new Date().toISOString().split('T')[0],
      deliverySlot: deliverySlot || 'Morning (9 AM - 12 PM)',
      customBox: customBox || 'Royal Decorative Gold Box',
      items: parsedItems,
      totalAmount: calcTotal,
      advancePaid: advance,
      dueAmount: due,
      balanceDue: due,
      status: 'BOOKED',
      notes: notes || '',
      paymentStatus: advance >= calcTotal ? 'PAID_FULL' : advance > 0 ? 'PARTIAL_ADVANCE' : 'UNPAID',
      createdAt: new Date()
    };

    const savedOrder = await BulkOrder.create(newOrder);

    res.status(201).json({ success: true, order: savedOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, additionalPayment } = req.body;

    const existing = await BulkOrder.findById(id).lean();
    if (existing) {
      const newAdvance = Number(existing.advancePaid || 0) + Number(additionalPayment || 0);
      const newDue = Math.max(0, Number(existing.totalAmount || 0) - newAdvance);
      await BulkOrder.updateOne(
        { _id: id },
        {
          $set: {
            ...(status ? { status } : {}),
            ...(paymentStatus ? { paymentStatus } : {}),
            advancePaid: newAdvance,
            dueAmount: newDue
          }
        }
      );
    } else {
      await BulkOrder.updateOne(
        { _id: id },
        { $set: { ...(status ? { status } : {}) } }
      );
    }

    res.json({ success: true, message: 'Order status updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteBulkOrder = async (req, res) => {
  try {
    const { id } = req.params;

    await BulkOrder.deleteOne({ _id: id });

    res.json({ success: true, message: 'Bulk order deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateBulkOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customerName,
      customerPhone,
      phone,
      festivalTag,
      festivalName,
      deliveryDate,
      deliverySlot,
      items,
      totalAmount,
      advancePaid,
      dueAmount,
      customBox,
      notes,
      status
    } = req.body;

    const parsedItems = Array.isArray(items) ? items : [];
    const calcTotal = totalAmount || parsedItems.reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.unitPrice || item.price || 0), 0);
    const advance = Number(advancePaid || 0);
    const due = dueAmount !== undefined ? Number(dueAmount) : Math.max(0, calcTotal - advance);

    const updateFields = {
      ...(customerName ? { customerName } : {}),
      ...(customerPhone || phone ? { customerPhone: customerPhone || phone, phone: phone || customerPhone } : {}),
      ...(festivalTag ? { festivalTag } : {}),
      ...(festivalName ? { festivalName } : {}),
      ...(deliveryDate ? { deliveryDate } : {}),
      ...(deliverySlot ? { deliverySlot } : {}),
      ...(customBox ? { customBox } : {}),
      ...(items ? { items: parsedItems } : {}),
      totalAmount: calcTotal,
      advancePaid: advance,
      dueAmount: due,
      balanceDue: due,
      ...(status ? { status } : {}),
      ...(notes !== undefined ? { notes } : {}),
      paymentStatus: advance >= calcTotal ? 'PAID_FULL' : advance > 0 ? 'PARTIAL_ADVANCE' : 'UNPAID'
    };

    await BulkOrder.updateOne({ _id: id }, { $set: updateFields });

    res.json({ success: true, message: 'Bulk order updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getBulkOrders, createBulkOrder, updateBulkOrder, updateOrderStatus, deleteBulkOrder };
