const Project = require('../models/Project');
const CostEntry=require('../models/Costentry')

// Get all projects
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
};

// Create a new project

exports.createProject = async (req, res) => {
    try {
      const { projectId, name, description } = req.body;
  
      // Validation
      if (!projectId || !name || !description) {
        return res.status(400).json({ 
          success: false,
          message: 'Project ID, name, and description are required' 
        });
      }
  
      // Check for duplicate projectId
      const exists = await Project.findOne({ projectId });
      if (exists) {
        return res.status(409).json({
          success: false,
          message: 'Project ID already exists'
        });
      }
  
      // Create project
      const project = await Project.create({
        projectId,
        name,
        description
      });
  
      res.status(201).json({
        success: true,
        data: {
          projectId: project.projectId,
          name: project.name,
          description: project.description,
          createdAt: project.createdAt
        }
      });
  
    } catch (err) {
      console.error('Error creating project:', err);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: err.message
      });
    }
  };

// Update a project
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { name, description, 
        updatedAt:Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error updating project', error: error.message });
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
};

// Get single project
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project', error: error.message });
  }
};


// Properly export the function
exports.getCostentriesID= async (req, res) => {
  try {
    const { id } = req.params;
    
    const costEntries = await CostEntry.find({ projectId: id })
      .select('overheadComponent subhead description expectedCost actualCost variance')
      .lean();

    if (!costEntries || costEntries.length === 0) {
      return res.status(200).json([]);
    }

    const formattedEntries = costEntries.map((entry, index) => ({
      id: index + 1,
      overhead: entry.overheadComponent || "",
      subhead: entry.subhead || "",
      description: entry.description || "",
      expectedCost: entry.expectedCost?.toString() || "0",
      actualCost: entry.actualCost?.toString() || "0",
      variance: entry.variance?.toString() || "0"
    }));

    res.status(200).json(formattedEntries);
  } catch (error) {
    console.error("Error fetching cost entries:", error.message);
    res.status(500).json({ 
      message: 'Error fetching cost entries', 
      error: error.message 
    });
  }
};