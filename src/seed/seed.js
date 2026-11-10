/**
 * Usage:
 *   npm run seed                       -> reads ./data/products.json
 *   npm run seed -- path/to/file.json  -> reads another file
 *
 * - Creates the admin user from ADMIN_* env vars (if it doesn't exist)
 * - Imports products from the old products.json (upsert by name, safe to re-run)
 * The field mapping below is tolerant; adjust it if your JSON uses other keys.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');

const num = (v) => {
  const n = parseFloat(String(v ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  // --- admin ---
  const email = (process.env.ADMIN_EMAIL || 'admin@rzcoach.com').toLowerCase();
  if (!(await User.exists({ email }))) {
    await User.create({
      name: process.env.ADMIN_NAME || 'Admin',
      email,
      password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
      role: 'admin',
    });
    console.log(`Admin created: ${email}`);
  } else {
    console.log(`Admin already exists: ${email}`);
  }

  // --- products ---
  const file = path.resolve(process.argv[2] || path.join(__dirname, '../../data/products.json'));
  if (fs.existsSync(file)) {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    const list = Array.isArray(raw) ? raw : raw.products || raw.items || [];

    let count = 0;
    for (const p of list) {
      const name = p.name || p.title || p.nom;
      if (!name) continue;
      const set = {
        name,
        description: p.description || p.desc || '',
        price: num(p.price ?? p.prix),
        image: p.image || p.img || p.imgSrc || p.photo || '',
        category: p.category || p.type || p.categorie || 'general',
      };
      const old = p.oldPrice ?? p.old_price;
      if (old !== undefined) set.oldPrice = num(old);
      await Product.updateOne({ name }, { $set: set, $setOnInsert: { stock: 100 } }, { upsert: true });
      count++;
    }
    console.log(`Products imported: ${count}`);
  } else {
    console.log(`No products file found at ${file} (copy your products.json to ./data/)`);
  }

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
