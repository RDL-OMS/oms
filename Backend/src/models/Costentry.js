// models/CostEntry.js
const mongoose = require('mongoose');

const costEntrySchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,  // Reference the _id
    ref: 'Project',
    required: true
  },
  projectId: {
    type: String,
    required: true
  },
  overheadComponent: {
    type: String,
    required: true
  },
  subhead: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  expectedCost: {
    type: Number,
    required: true,
    min: 0
  },
  actualCost: {
    type: Number,
    required: true,
    min: 0
  },
  variance: {
    type: Number,
    required: true
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

// Update the updatedAt field before saving
costEntrySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CostEntry', costEntrySchema);