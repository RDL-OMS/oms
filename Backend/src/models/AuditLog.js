const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE']
  },
  entityType: {
    type: String,
    required: true,
    enum: ['CostEntry', 'Project', 'User', 'Overhead']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  performedByUsername: {
    type: String,
    required: false // Optional since we'll populate it when available
  },
  reason: {
    type: String,
    required: function() {
      return this.action === 'DELETE'; // Reason mandatory only for deletions
    }
  },
  changes: {
    type: Object // Stores previous state for updates
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Add index for frequently queried fields
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ entityType: 1 });
AuditLogSchema.index({ entityId: 1 });
AuditLogSchema.index({ performedBy: 1 });
AuditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);