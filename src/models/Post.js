const mongoose = require('mongoose');

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    slug: { type: String, unique: true, index: true },
    excerpt: { type: String, default: '' },
    content: { type: String, required: [true, 'Content is required'] },
    image: { type: String, default: '' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

postSchema.pre('validate', async function (next) {
  if (this.isModified('title') || !this.slug) {
    const base = slugify(this.title) || 'post';
    let slug = base;
    let i = 1;
    // ensure uniqueness
    while (await mongoose.models.Post.exists({ slug, _id: { $ne: this._id } })) {
      slug = `${base}-${i++}`;
    }
    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);
