const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { isEmail, requireFields } = require('../utils/helpers');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

exports.signup = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name', 'email', 'password']);
  const { name, email, password, phone } = req.body;

  if (!isEmail(email)) throw new AppError('Invalid email', 400);
  if (String(password).length < 6) throw new AppError('Password must be at least 6 characters', 400);

  if (await User.exists({ email: email.toLowerCase().trim() })) {
    throw new AppError('Email already registered', 409);
  }

  // role is never taken from the request body
  const user = await User.create({ name, email, password, phone });
  res.status(201).json({ success: true, token: signToken(user._id), user });
});

exports.login = asyncHandler(async (req, res) => {
  requireFields(req.body, ['email', 'password']);
  const user = await User.findOne({ email: String(req.body.email).toLowerCase().trim() }).select('+password');

  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new AppError('Incorrect email or password', 401);
  }
  res.json({ success: true, token: signToken(user._id), user });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

exports.updateMe = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  if (name !== undefined) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  await req.user.save();
  res.json({ success: true, user: req.user });
});

exports.changePassword = asyncHandler(async (req, res) => {
  requireFields(req.body, ['currentPassword', 'newPassword']);
  if (String(req.body.newPassword).length < 6) throw new AppError('Password must be at least 6 characters', 400);

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(req.body.currentPassword))) {
    throw new AppError('Current password is incorrect', 401);
  }
  user.password = req.body.newPassword;
  await user.save();
  res.json({ success: true, token: signToken(user._id) });
});
