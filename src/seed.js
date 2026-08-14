const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Shop = require('./models/Shop');
const Item = require('./models/Item');
const Batch = require('./models/Batch');
const BulkOrder = require('./models/BulkOrder');
const RawMaterial = require('./models/RawMaterial');
const Customer = require('./models/Customer');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sweet_saas');
    console.log('[Seed] Connected to MongoDB...');

    // Clear existing collection records
    await User.deleteMany({});
    await Shop.deleteMany({});
    await Item.deleteMany({});
    await Batch.deleteMany({});
    await BulkOrder.deleteMany({});
    await RawMaterial.deleteMany({});
    await Customer.deleteMany({});

    // 1. Create Super Admin
    const adminPassword = await bcrypt.hash('tanush.saha05@gmail.com', 10);
    const superAdmin = await User.create({
      name: 'Super Admin (System Owner)',
      email: 'tanush.saha05@gmail.com',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      language: 'en'
    });
    console.log('[Seed] Super Admin created:', superAdmin.email);

    // 2. Create Demo Sweet Shop Tenant ("Mithaas Sweets" / "মিষ্টি মহল")
    const shop = await Shop.create({
      name: 'Mithaas Sweets & Confectionery',
      nameBn: 'মিষ্টি মহল ও মিষ্টান্ন ভাণ্ডার',
      ownerName: 'Rabindra Nath Basu',
      phone: '9830012345',
      address: '45 MG Road, Kolkata, West Bengal'
    });

    const ownerPassword = await bcrypt.hash('owner123', 10);
    const shopOwner = await User.create({
      name: 'Rabindra Nath Basu',
      email: 'owner@mithaas.com',
      password: ownerPassword,
      role: 'SHOP_OWNER',
      tenantId: shop._id,
      language: 'bn' // Default Bengali language preference
    });
    console.log('[Seed] Shop Owner created:', shopOwner.email);

    // 3. Create Sweet Product Items
    const items = await Item.insertMany([
      {
        tenantId: shop._id,
        nameEn: 'Rosogolla (Spongy Milk Sweets)',
        nameBn: 'স্পঞ্জ রসগোল্লা',
        category: 'MILK_BASED',
        pricePerKg: 320,
        shelfLifeDays: 2,
        unit: 'kg'
      },
      {
        tenantId: shop._id,
        nameEn: 'Nolen Gur Sandesh',
        nameBn: 'নলেন গুড়ের সন্দেশ',
        category: 'CHHANA_BASED',
        pricePerKg: 450,
        shelfLifeDays: 3,
        unit: 'kg'
      },
      {
        tenantId: shop._id,
        nameEn: 'Special Kaju Katli',
        nameBn: 'কাজু কাতলি',
        category: 'DRY_SWEET',
        pricePerKg: 850,
        shelfLifeDays: 15,
        unit: 'kg'
      },
      {
        tenantId: shop._id,
        nameEn: 'Pure Desi Ghee Laddu',
        nameBn: 'খাটি ঘি এর লাড্ডু',
        category: 'GHEE_BASED',
        pricePerKg: 400,
        shelfLifeDays: 10,
        unit: 'kg'
      },
      {
        tenantId: shop._id,
        nameEn: 'Mishti Doi (Sweet Yogurt)',
        nameBn: 'মিষ্টি দই',
        category: 'MILK_BASED',
        pricePerKg: 220,
        shelfLifeDays: 4,
        unit: 'box'
      }
    ]);
    console.log(`[Seed] ${items.length} Sweet items created.`);

    // 4. Create Production Batches (Including Fresh and Expiring Today)
    const now = new Date();
    const todayExpiring = new Date(now);
    todayExpiring.setHours(todayExpiring.getHours() + 12); // Expiring in 12 hours!

    const twoDaysLater = new Date(now);
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);

    await Batch.insertMany([
      {
        tenantId: shop._id,
        itemId: items[0]._id, // Rosogolla
        batchCode: 'BATCH-ROS-001',
        mfgDate: now,
        expiryDate: todayExpiring,
        initialQty: 25,
        currentQty: 18,
        discountPercent: 25, // Flagged for 25% discount today!
        status: 'DISCOUNT_TODAY'
      },
      {
        tenantId: shop._id,
        itemId: items[1]._id, // Sandesh
        batchCode: 'BATCH-SAN-002',
        mfgDate: now,
        expiryDate: twoDaysLater,
        initialQty: 30,
        currentQty: 30,
        discountPercent: 0,
        status: 'FRESH'
      },
      {
        tenantId: shop._id,
        itemId: items[2]._id, // Kaju Katli
        batchCode: 'BATCH-KAJ-003',
        mfgDate: now,
        expiryDate: new Date(now.valueOf() + 10 * 24 * 60 * 60 * 1000),
        initialQty: 50,
        currentQty: 45,
        discountPercent: 0,
        status: 'FRESH'
      }
    ]);
    console.log('[Seed] Batches created.');

    // 5. Create Raw Material Stock & Forecasting Data
    await RawMaterial.insertMany([
      {
        tenantId: shop._id,
        nameEn: 'Khoya / Mawa',
        nameBn: 'খোয়া (মাওয়া)',
        currentStock: 12, // 12 kg left
        unit: 'kg',
        reorderAlertLevel: 15,
        avgDailyUsage: 5 // Will run out in 2.4 days!
      },
      {
        tenantId: shop._id,
        nameEn: 'Pure Chhana (Cottage Cheese)',
        nameBn: 'খাটি ছানা',
        currentStock: 40,
        unit: 'kg',
        reorderAlertLevel: 15,
        avgDailyUsage: 10
      },
      {
        tenantId: shop._id,
        nameEn: 'Pure Cow Milk',
        nameBn: 'খাঁটি গরুর দুধ',
        currentStock: 100,
        unit: 'liter',
        reorderAlertLevel: 30,
        avgDailyUsage: 25
      },
      {
        tenantId: shop._id,
        nameEn: 'Desi Ghee',
        nameBn: 'গাওয়া ঘি',
        currentStock: 25,
        unit: 'kg',
        reorderAlertLevel: 10,
        avgDailyUsage: 3
      }
    ]);
    console.log('[Seed] Raw materials created.');

    // 6. Create Festival Bulk Pre-Orders
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3); // Delivery in 3 days

    await BulkOrder.create({
      tenantId: shop._id,
      orderNumber: 'ORD-DIWALI-101',
      customerName: 'Anjan Sen (Royals Corporate)',
      customerPhone: '9831198765',
      festivalName: 'Durga Puja Corporate Gift Boxes',
      deliveryDate,
      deliverySlot: 'Morning (10 AM Pickup)',
      items: [
        {
          itemId: items[1]._id,
          itemName: 'Nolen Gur Sandesh',
          qty: 20,
          unitPrice: 450,
          boxCustomization: 'Royal Red Decorative Gold Box'
        },
        {
          itemId: items[2]._id,
          itemName: 'Special Kaju Katli',
          qty: 10,
          unitPrice: 850,
          boxCustomization: 'Premium Silver Foil Box'
        }
      ],
      totalAmount: 17500,
      advancePaid: 5000,
      balanceDue: 12500,
      paymentStatus: 'PARTIAL',
      orderStatus: 'BOOKED',
      notes: 'Customer requested eco-friendly carrying bags.'
    });
    console.log('[Seed] Festival Bulk Pre-order created.');

    // 7. Create Customer Loyalty Profiles
    await Customer.create({
      tenantId: shop._id,
      phone: '9830099999',
      name: 'Subhash Mukherjee',
      points: 120,
      boxStamps: 8, // 8 stamps collected so far out of 10
      totalVisits: 8,
      totalSpent: 4200
    });
    console.log('[Seed] Loyalty customer created.');

    console.log('\n========================================');
    console.log('✅ SEEDING COMPLETE SUCCESFULLY!');
    console.log('Super Admin Credentials: admin@sweetsaas.com / admin123');
    console.log('Shop Owner Credentials:  owner@mithaas.com / owner123');
    console.log('========================================\n');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
};

seedDB();
