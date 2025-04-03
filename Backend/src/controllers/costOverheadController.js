const CostOverhead = require('../models/Costoverhead');
const Project = require('../models/Project')

// Get all overheads for a project
exports.getOverheads = async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log("projectId",projectId);
    
    const overheads = await CostOverhead.find({ projectId }).sort({ createdAt: -1 });
    res.status(200).json(overheads);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching overheads', error: error.message });
  }
};

// Create new overhead
// Create a new empty overhead
exports.createOverhead = async (req, res) => {
    try {
      
        // Validate request body
        if (!req.body.projectId) {
            return res.status(400).json({
                success: false,
                message: 'projectId is required'
            });
        }

        // Verify project exists (optional but recommended)
        const projectExists = await Project.exists({ projectId: req.body.projectId });
        if (!projectExists) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Create new overhead with empty values
        const newOverhead = new CostOverhead({
            projectId: req.body.projectId,
            overheadComponent: req.body.overheadComponent || 'a',
            description: req.body.description || '',
            subheads: req.body.subheads || []
        });

        // Validate before saving
        await newOverhead.validate();
        
        // Save to database
        const savedOverhead = await newOverhead.save();
        
        res.status(201).json({
            success: true,
            data: savedOverhead
        });
    } catch (error) {
        console.error('Error creating overhead:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating new overhead',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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

// Delete subhead from overhead
exports.deleteSubhead = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // First, verify the overhead exists
    const overhead = await CostOverhead.findById(id);
    if (!overhead) {
      return res.status(404).json({ message: 'Overhead not found' });
    }

    // Check if the subhead exists
    const subheadExists = overhead.subheads.some(subhead => subhead.name === name);
    if (!subheadExists) {
      return res.status(404).json({ message: 'Subhead not found' });
    }

    // Remove the subhead
    const updatedOverhead = await CostOverhead.findByIdAndUpdate(
      id,
      { 
        $pull: { subheads: { name } },
        updatedAt: Date.now() 
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Subhead deleted successfully',
      data: updatedOverhead
    });
  } catch (error) {
    console.error('Error deleting subhead:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting subhead',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};