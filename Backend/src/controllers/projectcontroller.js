const Project = require('../models/Project');
const CostEntry = require('../models/Costentry');
const User = require('../models/user')

// Get all projects (with role-based filtering)
exports.getProjects = async (req, res) => {


  try {
    // Verify authentication
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Missing user information'
      });
    }

    const requestedRole = req.params.role; // From URL parameter
    const { role: userRole, id: userId } = req.user; // From JWT token

    // Verify the requested role matches the user's actual role
    if (requestedRole !== userRole) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden - Role mismatch'
      });
    }

    // Query construction
    let query = {};

    // Role-based filtering
    switch (userRole) {
      case 'owner':
        // Owners can see all projects
        break;

      case 'teamlead':
        query.$or = [
          { teamLead: userId },
          { members: userId }
        ];
        break;

      case 'member':
        query.members = userId;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified'
        });
    }

    // Execute query
    const projects = await Project.find(query)
      .sort({ updatedAt: -1 })
      .populate('teamLead', 'name email')
      .populate('members', 'name email');

    // Transform response
    const responseData = {
      success: true,
      data: projects.map(project => ({
        _id: project._id,
        projectId: project.projectId,
        name: project.name,
        description: project.description,
        updatedAt: project.updatedAt,
        teamLead: project.teamLead,
        budget: project.budget,
        members: project.members
      }))
    };

    res.status(200).json(responseData);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      data: [] // Ensure data is always an array
    });
  }
};

// Create a new project (only owner or teamlead)
exports.createProject = async (req, res) => {
  try {
    // Check if user has permission
    if (!['owner', 'teamlead'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only owners and team leads can create projects'
      });
    }

    const { projectId, name, description, budget } = req.body;

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

    // Create project with creator info
    const project = await Project.create({
      projectId,
      name,
      description,
      budget,
      createdBy: req.user.id,
      teamLead: req.user.role === 'teamlead' ? req.user.id : null
    });

    res.status(201).json({
      success: true,
      data: {
        projectId: project.projectId,
        name: project.name,
        description: project.description,
        budget: project.budget,
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

// Update a project (owner or assigned teamlead)
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // First get the project to check permissions
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check permissions
    const canEdit = req.user.role === 'owner' ||
      (req.user.role === 'teamlead' && project.teamLead.equals(req.user.id));

    if (!canEdit) {
      return res.status(403).json({
        message: 'Not authorized to update this project'
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { name, description, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({
      message: 'Error updating project',
      error: error.message
    });
  }
};

// Delete a project (only owner)
exports.deleteProject = async (req, res) => {
  try {
    // Only owners can delete projects
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        message: 'Only owners can delete projects'
      });
    }

    const { id } = req.params;
    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting project',
      error: error.message
    });
  }
};

// Get single project (with permission check)
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user has access
    const hasAccess = req.user.role === 'owner' ||
      project.teamLead.equals(req.user.id) ||
      project.members.includes(req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        message: 'Not authorized to view this project'
      });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching project',
      error: error.message
    });
  }
};

// Get cost entries with permission check
exports.getCostentriesID = async (req, res) => {
  try {
    const { id } = req.params;

    // First check project access
    const project = await Project.findOne({ projectId: id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const hasAccess = req.user.role === 'owner' ||
      project.teamLead.equals(req.user.id) ||
      project.members.includes(req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        message: 'Not authorized to view this project\'s cost entries'
      });
    }

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


exports.getProjectsUM = async (req, res) => {
  try {

    const userId = req.params.id;
    const role = req.params.role;



    if (!userId || !role) {
      return res.status(400).json({ message: "User ID and role are required" });
    }

    let user = await User.findOne({ username: userId }).populate(role === 'teamlead' ? 'managedProjects' : 'projects');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const projects = role === 'teamlead' ? user.managedProjects : user.projects;

    res.json({ success: true, data: projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Server error" });
  }
};


//save cost entry
exports.saveCostEntries = async (req, res) => {
  try {

    const { id } = req.params;
    const projectId = id;
    const { entries } = req.body;


    // Validate project exists
    const project = await Project.findOne({ projectId });
    console.log("project", project._id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Validate request body
    if (!Array.isArray(entries)) {
      return res.status(400).json({
        success: false,
        message: 'Entries must be an array'
      });
    }

    // Validate each entry
    const validatedEntries = [];
    for (const entry of entries) {
      if (!entry.overheadComponent || !entry.subhead) {
        return res.status(400).json({
          success: false,
          message: 'Each entry must have overheadComponent and subhead'
        });
      }

      if (isNaN(entry.expectedCost)) {
        return res.status(400).json({
          success: false,
          message: 'Expected cost must be a number'
        });
      }

      if (isNaN(entry.actualCost)) {
        return res.status(400).json({
          success: false,
          message: 'Actual cost must be a number'
        });
      }

      validatedEntries.push({
        project:project._id,
        projectId:projectId,
        overheadComponent: entry.overheadComponent,
        subhead: entry.subhead,
        description: entry.description || '',
        expectedCost: parseFloat(entry.expectedCost),
        actualCost: parseFloat(entry.actualCost),
        variance: parseFloat(entry.variance) || 0
      });
    }
    console.log("new overhead", validatedEntries);

    // Save all entries
    const savedEntries = await CostEntry.insertMany(validatedEntries);
    console.log("saved", savedEntries);

    // Update project's cost entries reference
    await Project.findOneAndUpdate(
      project._id,  // Query by string _id
      { $push: { costEntries: { $each: savedEntries  } } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Cost entries saved successfully',
      data: savedEntries
    });

  } catch (error) {
    console.error('Error saving cost entries:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving cost entries',
      error: error.message
    });
  }
};