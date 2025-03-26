const CostOverhead = require('../models/Costoverhead');

// Get all overheads for a project
exports.getOverheads = async (req, res) => {
  try {
    const { projectId } = req.params;
    const overheads = await CostOverhead.find({ projectId }).sort({ createdAt: -1 });
    res.status(200).json(overheads);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching overheads', error: error.message });
  }
};

// Create new overhead
exports.createOverhead = async (req, res) => {
  try {
    const { projectId, overheadComponent, description } = req.body;
    
    const newOverhead = new CostOverhead({
      projectId,
      overheadComponent,
      description
    });

    await newOverhead.save();
    res.status(201).json(newOverhead);
  } catch (error) {
    res.status(500).json({ message: 'Error creating overhead', error: error.message });
  }
};

// Update overhead
exports.updateOverhead = async (req, res) => {
  try {
    const { id } = req.params;
    const { overheadComponent, description } = req.body;

    const updatedOverhead = await CostOverhead.findByIdAndUpdate(
      id,
      { overheadComponent, description, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedOverhead) {
      return res.status(404).json({ message: 'Overhead not found' });
    }

    res.status(200).json(updatedOverhead);
  } catch (error) {
    res.status(500).json({ message: 'Error updating overhead', error: error.message });
  }
};

// Delete overhead
exports.deleteOverhead = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOverhead = await CostOverhead.findByIdAndDelete(id);

    if (!deletedOverhead) {
      return res.status(404).json({ message: 'Overhead not found' });
    }

    res.status(200).json({ message: 'Overhead deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting overhead', error: error.message });
  }
};

// Add subhead to overhead
exports.addSubhead = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedOverhead = await CostOverhead.findByIdAndUpdate(
      id,
      { $push: { subheads: { name } }, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedOverhead) {
      return res.status(404).json({ message: 'Overhead not found' });
    }

    res.status(200).json(updatedOverhead);
  } catch (error) {
    res.status(500).json({ message: 'Error adding subhead', error: error.message });
  }
};