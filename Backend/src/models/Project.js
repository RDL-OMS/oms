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
  createdBy: {  
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamLead: {  
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  members: [{  
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  budget: {  // NEW: Budget field (Number)
    type: Number,
    required: true,
    default: 0 // Default value set to 0 if not provided
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
projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes for better performance
projectSchema.index({ createdBy: 1 });
projectSchema.index({ teamLead: 1 });
projectSchema.index({ members: 1 });

module.exports = mongoose.model('Project', projectSchema);
