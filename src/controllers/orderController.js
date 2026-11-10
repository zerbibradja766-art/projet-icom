const Order = require('../models/Order');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, requireFields } = require('../utils/helpers');

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

// POST /api/orders
// body: { items: [{ product, qty }], shippingAddress: {...}, paymentMethod }
// Prices are ALWAYS read from the database, never from the client.
exports.create = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod } = req.body;

  if (!Array.isArray(items) || items.length === 0) throw new AppError('Order must contain items', 400);
  if (!shippingAddress) throw new AppError('Shipping address is required', 400);
  requireFields(shippingAddress, ['fullName', 'phone', 'wilaya', 'address']);

  // merge duplicate lines
  const merged = new Map();
  for (const it of items) {
    const qty = parseInt(it.qty, 10);
    if (!it.product || !qty || qty < 1) throw new AppError('Invalid item', 400);
    merged.set(String(it.product), (merged.get(String(it.product)) || 0) + qty);
  }

  const products = await Product.find({ _id: { $in: [...merged.keys()] }, active: true });
  if (products.length !== merged.size) throw new AppError('One or more products are unavailable', 400);

  // reserve stock atomically, roll back on failure
  const reserved = [];
  try {
    for (const p of products) {
      const qty = merged.get(String(p._id));
      const updated = await Product.findOneAndUpdate(
        { _id: p._id, stock: { $gte: qty } },
        { $inc: { stock: -qty } }
      );
      if (!updated) throw new AppError(`Not enough stock for "${p.name}"`, 409);
      reserved.push({ id: p._id, qty });
    }
  } catch (err) {
    await Promise.all(reserved.map((r) => Product.updateOne({ _id: r.id }, { $inc: { stock: r.qty } })));
    throw err;
  }

  const orderItems = products.map((p) => ({
    product: p._id,
    name: p.name,
    price: p.price,
    qty: merged.get(String(p._id)),
  }));
  const total = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    total,
    shippingAddress,
    paymentMethod,
  });

  res.status(201).json({ success: true, data: order });
});

exports.mine = asyncHandler(async (req, res) => {
  const data = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data });
});

exports.getOne = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) throw new AppError('Order not found', 404);
  const ownerId = order.user._id ? String(order.user._id) : String(order.user);
  if (req.user.role !== 'admin' && ownerId !== String(req.user._id)) throw new AppError('Forbidden', 403);
  res.json({ success: true, data: order });
});

// Customer can cancel only while the order is still pending
exports.cancel = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);
  if (req.user.role !== 'admin' && String(order.user) !== String(req.user._id)) throw new AppError('Forbidden', 403);
  if (order.status !== 'pending') throw new AppError('Only pending orders can be cancelled', 400);

  order.status = 'cancelled';
  await order.save();
  await Promise.all(order.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.qty } })));
  res.json({ success: true, data: order });
});

// ---- admin ----
exports.listAll = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 20);
  const filter = STATUSES.includes(req.query.status) ? { status: req.query.status } : {};
  const [data, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email phone').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);
  res.json({ success: true, data, page, pages: Math.ceil(total / limit), total });
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) throw new AppError(`Status must be one of: ${STATUSES.join(', ')}`, 400);

  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);

  // restock when an order becomes cancelled
  if (status === 'cancelled' && order.status !== 'cancelled') {
    await Promise.all(order.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.qty } })));
  }
  order.status = status;
  await order.save();
  res.json({ success: true, data: order });
});
