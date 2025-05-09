const AuditLog = require('../models/AuditLog');

const auditLog = (action, entityType) => async (req, res, next) => {
  try {
    if (action === 'CREATE') {
      // Log after successful creation
      res.on('finish', async () => {
        if (res.statusCode < 400) {
          await AuditLog.create({
            action,
            entityType,
            entityId: res.locals.entityId || req.body._id,
            performedBy: req.user.id,
            changes: req.body
          });
        }
      });
    } else if (action === 'UPDATE') {
      // Get original document before update
      const originalDoc = await mongoose.model(entityType).findById(req.params.id);
      res.on('finish', async () => {
        if (res.statusCode < 400) {
          await AuditLog.create({
            action,
            entityType,
            entityId: req.params.id,
            performedBy: req.user.id,
            changes: {
              from: originalDoc.toObject(),
              to: req.body
            }
          });
        }
      });
    }
    next();
  } catch (error) {
    console.error('Audit log error:', error);
    next();
  }
};

module.exports = auditLog;