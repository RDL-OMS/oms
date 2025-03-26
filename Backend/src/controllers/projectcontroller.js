const Project = require('../models/Project');

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