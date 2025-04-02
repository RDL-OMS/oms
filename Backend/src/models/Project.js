const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {  // NEW: Track who created the project
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamLead: {  // NEW: Track assigned team lead
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  members: [{  // NEW: Track team members
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
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
projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes for better performance
projectSchema.index({ createdBy: 1 });
projectSchema.index({ teamLead: 1 });
projectSchema.index({ members: 1 });

module.exports = mongoose.model('Project', projectSchema);