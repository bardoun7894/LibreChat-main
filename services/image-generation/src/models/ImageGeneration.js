const mongoose = require('mongoose');

const imageGenerationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prompt: {
    type: String,
    required: true,
    trim: true,
    maxlength: 4000
  },
  negativePrompt: {
    type: String,
    trim: true,
    maxlength: 4000
  },
  provider: {
    type: String,
    enum: ['dall-e-3', 'midjourney', 'stable-diffusion'],
    required: true
  },
  model: {
    type: String,
    required: true
  },
  settings: {
    width: {
      type: Number,
      default: 1024,
      min: 256,
      max: 2048
    },
    height: {
      type: Number,
      default: 1024,
      min: 256,
      max: 2048
    },
    quality: {
      type: String,
      enum: ['standard', 'hd'],
      default: 'standard'
    },
    style: {
      type: String,
      enum: ['vivid', 'natural'],
      default: 'vivid'
    },
    steps: {
      type: Number,
      default: 20,
      min: 1,
      max: 150
    },
    cfgScale: {
      type: Number,
      default: 7.5,
      min: 1,
      max: 20
    },
    seed: {
      type: Number,
      default: null
    },
    samples: {
      type: Number,
      default: 1,
      min: 1,
      max: 4
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    revisedPrompt: {
      type: String
    },
    size: {
      type: String,
      required: true
    },
    providerId: {
      type: String
    },
    metadata: {
      type: Object,
      default: {}
    }
  }],
  error: {
    message: {
      type: String
    },
    code: {
      type: String
    },
    details: {
      type: Object
    }
  },
  cost: {
    type: Number,
    default: 0
  },
  processingTime: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    trim: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
imageGenerationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add indexes for better query performance
imageGenerationSchema.index({ userId: 1, createdAt: -1 });
imageGenerationSchema.index({ provider: 1 });
imageGenerationSchema.index({ status: 1 });
imageGenerationSchema.index({ tags: 1 });
imageGenerationSchema.index({ category: 1 });
imageGenerationSchema.index({ isPublic: 1, createdAt: -1 });

// Virtual for getting the primary image
imageGenerationSchema.virtual('primaryImage').get(function() {
  return this.images.length > 0 ? this.images[0] : null;
});

// Method to add an image to the generation
imageGenerationSchema.methods.addImage = function(imageData) {
  this.images.push(imageData);
  return this.save();
};

// Method to update status
imageGenerationSchema.methods.updateStatus = function(status, error = null) {
  this.status = status;
  if (error) {
    this.error = error;
  }
  if (status === 'completed') {
    this.processingTime = Date.now() - this.createdAt;
  }
  return this.save();
};

// Static method to find by user and status
imageGenerationSchema.statics.findByUserAndStatus = function(userId, status) {
  return this.find({ userId, status }).sort({ createdAt: -1 });
};

// Static method to find public images
imageGenerationSchema.statics.findPublic = function(limit = 20, skip = 0) {
  return this.find({ isPublic: true, status: 'completed' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to search by tags and category
imageGenerationSchema.statics.searchByTagsAndCategory = function(query, limit = 20, skip = 0) {
  const searchQuery = {
    status: 'completed',
    isPublic: true,
    $or: [
      { tags: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } },
      { prompt: { $regex: query, $options: 'i' } }
    ]
  };
  
  return this.find(searchQuery)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

module.exports = mongoose.model('ImageGeneration', imageGenerationSchema);