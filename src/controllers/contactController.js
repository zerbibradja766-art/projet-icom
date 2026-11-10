const Message = require('../models/Message');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { isEmail, requireFields, getPagination } = require('../utils/helpers');

exports.send = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name', 'email', 'message']);
  if (!isEmail(req.body.email)) throw new AppError('Invalid email', 400);

  const { name, email, subject, message } = req.body;
  await Message.create({ name, email, subject, message });
  res.status(201).json({ success: true, message: 'Message sent. Thank you!' });
});

// ---- admin ----
exports.list = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 20);
  const filter = req.query.unread === 'true' ? { read: false } : {};
  const [data, total] = await Promise.all([
    Message.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Message.countDocuments(filter),
  ]);
  res.json({ success: true, data, page, pages: Math.ceil(total / limit), total });
});

exports.markRead = asyncHandler(async (req, res) => {
  const msg = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  if (!msg) throw new AppError('Message not found', 404);
  res.json({ success: true, data: msg });
});

exports.remove = asyncHandler(async (req, res) => {
  const msg = await Message.findByIdAndDelete(req.params.id);
  if (!msg) throw new AppError('Message not found', 404);
  res.json({ success: true, message: 'Message deleted' });
});
