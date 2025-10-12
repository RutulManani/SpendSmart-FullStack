const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['financial-wellness', 'emotional-health', 'mindful-spending', 'saving-tips', 'general'],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: String,
    default: 'SpendSmart Team'
  },
  coverImage: {
    type: String,
    default: '/images/articles/default.jpg'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  readTime: {
    type: Number, // in minutes
    default: 5
  },
  relatedArticles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  meta: {
    description: String,
    keywords: [String]
  },
  status: {
    type: String,
    enum: ['draft', 'review', 'published', 'archived'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
articleSchema.index({ title: 'text', content: 'text', tags: 'text' });
articleSchema.index({ category: 1, isPublished: 1 });
articleSchema.index({ createdBy: 1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ featured: 1, isPublished: 1 });

// Virtual for URL slug
articleSchema.virtual('slug').get(function() {
  return this.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
});

// Method to increment views
articleSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to increment likes
articleSchema.methods.incrementLikes = function() {
  this.likes += 1;
  return this.save();
};

// Static method to get published articles
articleSchema.statics.getPublished = function(filters = {}) {
  return this.find({ 
    isPublished: true, 
    status: 'published',
    ...filters 
  }).sort({ publishedAt: -1 });
};

// Static method to get featured articles
articleSchema.statics.getFeatured = function(limit = 5) {
  return this.find({ 
    isPublished: true, 
    status: 'published',
    featured: true 
  })
  .sort({ publishedAt: -1 })
  .limit(limit);
};

// Static method to get articles by category
articleSchema.statics.getByCategory = function(category, limit = 10) {
  return this.find({ 
    category,
    isPublished: true, 
    status: 'published'
  })
  .sort({ publishedAt: -1 })
  .limit(limit);
};

// Pre-save middleware to calculate read time
articleSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Calculate read time based on average reading speed (200 words per minute)
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200);
  }

  // Auto-generate excerpt if not provided
  if (this.isModified('content') && !this.excerpt) {
    this.excerpt = this.content.substring(0, 200) + '...';
  }

  // Set publishedAt date when publishing
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

// Pre-save middleware to update status based on isPublished
articleSchema.pre('save', function(next) {
  if (this.isModified('isPublished')) {
    if (this.isPublished) {
      this.status = 'published';
    } else if (this.status === 'published') {
      this.status = 'draft';
    }
  }
  next();
});

// Method to publish article
articleSchema.methods.publish = function() {
  this.isPublished = true;
  this.status = 'published';
  this.publishedAt = this.publishedAt || new Date();
  return this.save();
};

// Method to unpublish article
articleSchema.methods.unpublish = function() {
  this.isPublished = false;
  this.status = 'draft';
  return this.save();
};

// Method to archive article
articleSchema.methods.archive = function() {
  this.isPublished = false;
  this.status = 'archived';
  return this.save();
};

// Virtual for formatted published date
articleSchema.virtual('formattedPublishedDate').get(function() {
  if (!this.publishedAt) return null;
  return this.publishedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Ensure virtuals are included in JSON
articleSchema.set('toJSON', { virtuals: true });
articleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Article', articleSchema);