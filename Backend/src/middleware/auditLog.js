const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');
const User = require('../models/user'); // Import your User model

const auditLog = (action, entityType) => async (req, res, next) => {
  try {
    let originalDoc = null;
    let user = null;

    // Fetch user details if available
    if (req.user?.id) {
      user = await User.findById(req.user.id).select('name').lean();
    }
console.log('user',user);

    // For update and delete, fetch the original document beforehand
    if (['UPDATE', 'DELETE'].includes(action)) {
      originalDoc = await mongoose.model(entityType).findById(req.params.id);
    }

    // Setup post-response logging
    res.on('finish', async () => {
      try {
        if (res.statusCode < 400) {
          const baseLog = {
            action,
            entityType,
            performedBy: req.user?.id,
            performedByUsername: user?.name, // Add username to the log
          };

          if (action === 'CREATE') {
            await AuditLog.create({
              ...baseLog,
              entityId: res.locals.entityId || req.body._id,
              changes: req.body,
            });
          }

          else if (action === 'UPDATE') {
            await AuditLog.create({
              ...baseLog,
              entityId: req.params.id,
              changes: {
                from: originalDoc?.toObject() || {},
                to: req.body,
              },
            });
          }

          else if (action === 'DELETE') {
            await AuditLog.create({
              ...baseLog,
              entityId: req.params.id,
              reason: req.body.reason || 'No reason provided',
              changes: originalDoc?.toObject() || {},
            });
          }
        }
      } catch (logErr) {
        console.error('Error saving audit log:', logErr);
      } finally {
        delete res.locals.entityId;
      }
    });

    next();
  } catch (error) {
    console.error('Audit log middleware error:', error);
    delete res.locals.entityId;
    next(); // Pass error to error handler if needed
  }
};

module.exports = auditLog;