const mongoose = require('mongoose');

const subheadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const overheadSchema = new mongoose.Schema({
  projectId: {
    type: String,  // Matches your projectId format (e.g., "PROJ-001")
    required: true,
    index: true  // Improves query performance
  },
  overheadComponent: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  subheads: [subheadSchema],  // Array of subhead objects
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps
overheadSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

overheadSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model('CostOverhead', overheadSchema);