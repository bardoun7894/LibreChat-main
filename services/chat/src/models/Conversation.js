const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Object,
    default: {}
  }
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [messageSchema],
  language: {
    type: String,
    enum: ['ar', 'en'],
    default: 'en'
  },
  aiProvider: {
    type: String,
    enum: ['openai', 'anthropic', 'google'],
    default: 'openai'
  },
  aiModel: {
    type: String,
    default: 'gpt-4'
  },
  settings: {
    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 2
    },
    maxTokens: {
      type: Number,
      default: 2048
    },
    systemPrompt: {
      type: String,
      default: ''
    }
  },
  metadata: {
    isRTL: {
      type: Boolean,
      default: false
    },
    voiceEnabled: {
      type: Boolean,
      default: false
    }
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
conversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add indexes for better query performance
conversationSchema.index({ userId: 1, createdAt: -1 });
conversationSchema.index({ language: 1 });
conversationSchema.index({ aiProvider: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);