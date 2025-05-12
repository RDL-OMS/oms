const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');

exports.getLogs = async (req, res) => {
  try {
    console.log("log request", req.body);

    const { action, entityType, startDate, endDate, search } = req.body;

    const query = {};

    if (action) query.action = action;
    if (entityType) query.entityType = entityType;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { reason: { $regex: search, $options: 'i' } },
        // Match exact entityId only if search looks like ObjectId
        ...(mongoose.Types.ObjectId.isValid(search)
          ? [{ entityId: new mongoose.Types.ObjectId(search) }]
          : [])
      ];
    }

    console.log('query', query);

    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .limit(100);

    res.status(200).json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
