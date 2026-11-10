const Post = require('../models/Post');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, pick, requireFields } = require('../utils/helpers');

const FIELDS = ['title', 'excerpt', 'content', 'image', 'published'];

exports.list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 9);
  const filter = { published: true };
  const [data, total] = await Promise.all([
    Post.find(filter).select('-content').populate('author', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Post.countDocuments(filter),
  ]);
  res.json({ success: true, data, page, pages: Math.ceil(total / limit), total });
});

exports.getBySlug = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug, published: true }).populate('author', 'name');
  if (!post) throw new AppError('Post not found', 404);
  res.json({ success: true, data: post });
});

// ---- admin ----
exports.listAll = asyncHandler(async (req, res) => {
  const data = await Post.find().select('-content').sort({ createdAt: -1 });
  res.json({ success: true, data });
});

exports.create = asyncHandler(async (req, res) => {
  requireFields(req.body, ['title', 'content']);
  const post = await Post.create({ ...pick(req.body, FIELDS), author: req.user._id });
  res.status(201).json({ success: true, data: post });
});

exports.update = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError('Post not found', 404);
  Object.assign(post, pick(req.body, FIELDS));
  await post.save(); // re-runs slug logic if title changed
  res.json({ success: true, data: post });
});

exports.remove = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) throw new AppError('Post not found', 404);
  res.json({ success: true, message: 'Post deleted' });
});
