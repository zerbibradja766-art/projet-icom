const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, pick, requireFields, escapeRegex } = require('../utils/helpers');

const FIELDS = ['name', 'description', 'price', 'oldPrice', 'image', 'category', 'stock', 'featured', 'active'];

// GET /api/products?category=&q=&minPrice=&maxPrice=&featured=&sort=&page=&limit=
exports.list = asyncHandler(async (req, res) => {
  const { category, q, minPrice, maxPrice, featured, sort } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = { active: true };
  if (category) filter.category = category;
  if (featured === 'true') filter.featured = true;
  if (q) filter.name = { $regex: escapeRegex(q), $options: 'i' };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    newest: { createdAt: -1 },
    name: { name: 1 },
  };

  const [data, total] = await Promise.all([
    Product.find(filter).sort(sortMap[sort] || { createdAt: -1 }).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({ success: true, data, page, pages: Math.ceil(total / limit), total });
});

exports.categories = asyncHandler(async (req, res) => {
  const data = await Product.distinct('category', { active: true });
  res.json({ success: true, data });
});

exports.getOne = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, active: true });
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, data: product });
});

// ---- admin ----
exports.create = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name', 'price']);
  const product = await Product.create(pick(req.body, FIELDS));
  res.status(201).json({ success: true, data: product });
});

exports.update = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, pick(req.body, FIELDS), {
    new: true,
    runValidators: true,
  });
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, data: product });
});

exports.remove = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError('Product not found', 404);
  res.json({ success: true, message: 'Product deleted' });
});
