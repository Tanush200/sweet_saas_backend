const Shop = require('../models/Shop');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// Seed initial default shop in MongoDB if DB is completely empty
const seedInitialShopInDB = async () => {
  try {
    const count = await Shop.countDocuments();
    if (count === 0) {
      const initialShop = {
        _id: 'shop_001',
        name: 'Mithaas Sweets & Confectionery',
        nameBn: 'মিষ্টি মহল ও মিষ্টান্ন ভাণ্ডার',
        slug: 'mithaas-sweets',
        ownerName: 'Rabindra Nath Basu',
        phone: '9830012345',
        ownerEmail: 'owner@mithaas.com',
        ownerPassword: 'owner123',
        address: '45 MG Road, Kolkata, West Bengal',
        status: 'ACTIVE'
      };

      const initialUser = {
        _id: 'user_owner',
        name: 'Rabindra Nath Basu',
        email: 'owner@mithaas.com',
        password: bcrypt.hashSync('owner123', 10),
        plainPassword: 'owner123',
        role: 'SHOP_OWNER',
        tenantId: 'shop_001',
        language: 'bn'
      };

      const superAdminUser = {
        _id: 'user_admin',
        name: 'Super Admin (System Owner)',
        email: 'tanush.saha05@gmail.com',
        password: bcrypt.hashSync('tanush.saha05@gmail.com', 10),
        plainPassword: 'tanush.saha05@gmail.com',
        role: 'SUPER_ADMIN',
        tenantId: null,
        language: 'en'
      };

      await Shop.create(initialShop);
      await User.create(initialUser);
      await User.create(superAdminUser);
    }
  } catch (e) {
    console.error('[DB Seed Warning]', e.message);
  }
};

// List all shops directly from MongoDB
const getAllShops = async (req, res) => {
  try {
    await seedInitialShopInDB();

    const shops = await Shop.find().sort({ createdAt: -1, _id: -1 }).lean();

    const formattedShops = (shops || []).map((s) => ({
      _id: s._id,
      name: s.name,
      nameBn: s.nameBn || s.name,
      slug: s.slug || slugify(s.name),
      ownerName: s.ownerName,
      phone: s.phone,
      status: s.status || 'ACTIVE',
      ownerEmail: s.ownerEmail || 'N/A',
      ownerPassword: s.ownerPassword || 'owner123'
    }));

    res.json({ success: true, shops: formattedShops });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new shop tenant in MongoDB
const createShopTenant = async (req, res) => {
  try {
    const { name, nameBn, ownerName, phone, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Shop name, email, and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Check existing user in MongoDB
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Owner email already registered' });
    }

    const shopSlug = slugify(name);
    const shopId = `shop_${Date.now()}`;
    const userId = `user_${Date.now()}`;
    const hashedPassword = bcrypt.hashSync(cleanPassword, 10);

    const newShop = {
      _id: shopId,
      name,
      nameBn: nameBn || name,
      slug: shopSlug,
      ownerName,
      phone,
      address: 'Kolkata, West Bengal',
      status: 'ACTIVE',
      ownerEmail: cleanEmail,
      ownerPassword: cleanPassword
    };

    const newUser = {
      _id: userId,
      name: ownerName,
      email: cleanEmail,
      password: hashedPassword,
      plainPassword: cleanPassword,
      role: 'SHOP_OWNER',
      tenantId: shopId,
      language: 'en'
    };

    // Save directly to MongoDB database
    await Shop.create(newShop);
    await User.create(newUser);

    res.status(201).json({
      success: true,
      shop: newShop,
      owner: { id: newUser._id, email: newUser.email, password: cleanPassword }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update shop tenant details or status in MongoDB
const updateShopTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, nameBn, ownerName, phone, status, password } = req.body;

    const updateFields = {};
    if (name) {
      updateFields.name = name;
      updateFields.slug = slugify(name);
    }
    if (nameBn) updateFields.nameBn = nameBn;
    if (ownerName) updateFields.ownerName = ownerName;
    if (phone) updateFields.phone = phone;
    if (status) updateFields.status = status;
    if (password) updateFields.ownerPassword = password;

    const updatedShop = await Shop.findOneAndUpdate(
      { $or: [{ _id: id }, { slug: id }] },
      { $set: updateFields },
      { new: true }
    ).lean();

    if (password || ownerName) {
      const userUpdate = {};
      if (ownerName) userUpdate.name = ownerName;
      if (password) {
        userUpdate.plainPassword = password;
        userUpdate.password = bcrypt.hashSync(password, 10);
      }
      await User.updateMany({ tenantId: id }, { $set: userUpdate });
    }

    res.json({ success: true, shop: updatedShop });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a shop tenant PERMANENTLY from MongoDB
const deleteShopTenant = async (req, res) => {
  try {
    const { id } = req.params;

    const targetShop = await Shop.findOne({ $or: [{ _id: id }, { slug: id }] }).lean();

    // Permanent Mongo deletion
    await Shop.deleteMany({
      $or: [{ _id: id }, { slug: id }, ...(targetShop?.ownerEmail ? [{ ownerEmail: targetShop.ownerEmail }] : [])]
    });

    await User.deleteMany({
      $or: [{ tenantId: id }, ...(targetShop?.ownerEmail ? [{ email: targetShop.ownerEmail }] : [])]
    });

    res.json({
      success: true,
      message: 'Shop tenant and user credentials permanently deleted from MongoDB database.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllShops, createShopTenant, updateShopTenant, deleteShopTenant, slugify };
