const Project = require('../models/Project');
const CostEntry = require('../models/Costentry');
const User = require('../models/user')
const AuditLog = require('../models/AuditLog');

// Get all projects (with role-based filtering)
exports.getProjects = async (req, res) => {

console.log("getprojects");

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
        members: project.members,
        createdAt:project.createdAt
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

// // Create a new project (only owner or teamlead)
// exports.createProject = async (req, res) => {
//   try {
//     console.log("data frontend",req);
    
//     // Check if user has permission
//     if (!['owner', 'teamlead'].includes(req.user.role)) {
//       return res.status(403).json({
//         success: false,
//         message: 'Only owners and team leads can create projects'
//       });
//     }

//     const { projectId, name, description, budget,teamLead } = req.body;

//     // Validation
//     if (!projectId || !name || !description) {
//       return res.status(400).json({
//         success: false,
//         message: 'Project ID, name, and description are required'
//       });
//     }

//     // Check for duplicate projectId
//     const exists = await Project.findOne({ projectId });
//     if (exists) {
//       return res.status(409).json({
//         success: false,
//         message: 'Project ID already exists'
//       });
//     }

//     // Create project with creator info
//     const project = await Project.create({
//       projectId,
//       name,
//       description,
//       budget,
//       createdBy: req.user.id,
//       teamLead
//     });

//     res.status(201).json({
//       success: true,
//       data: {
//         projectId: project.projectId,
//         name: project.name,
//         description: project.description,
//         budget: project.budget,
//         createdAt: project.createdAt
//       }
//     });

//   } catch (err) {
//     console.error('Error creating project:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//       error: err.message
//     });
//   }
// };

// Create a new project (only owner or teamlead)
exports.createProject = async (req, res) => {
  try {
    console.log("Request from frontend:", req.body);

    // Check if user has permission
    if (!['owner', 'teamlead'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only owners and team leads can create projects'
      });
    }

    const { projectId, name, description, budget, teamLead } = req.body;

    // Basic validation
    if (!projectId || !name || !description || !teamLead) {
      return res.status(400).json({
        success: false,
        message: 'Project ID, name, description, and team lead are required'
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

    // Validate teamLead exists
    const user = await User.findById(teamLead);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Assigned team lead does not exist'
      });
    }

    // Create the project
    const project = await Project.create({
      projectId,
      name,
      description,
      budget: Number(budget), // Ensure budget is stored as number
      createdBy: req.user.id,
      teamLead
    });
    res.locals.entityId = project._id;

    // Optionally populate teamLead if you want to return details
    const populatedProject = await Project.findById(project._id).populate('teamLead', 'name email role'); // customize fields as needed

    res.status(201).json({
      success: true,
      data: {
        projectId: populatedProject.projectId,
        name: populatedProject.name,
        description: populatedProject.description,
        budget: populatedProject.budget,
        createdAt: populatedProject.createdAt,
        teamLead: populatedProject.teamLead // returns object with name/email/role
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
    const deletedProject = await Project.findById(id);

    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    else{
      res.locals.entityId = id;
      await Project.findByIdAndDelete(id);
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
      _id:entry._id,
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

    // Save all entries
    const savedEntries = await CostEntry.insertMany(validatedEntries);
    console.log("saved",savedEntries[0]._id.toHexString());
    const nid= savedEntries[0]._id.toHexString();
    res.locals.entityId=nid;
    

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

exports.updateCostEntries = async (req, res) => {
  try {
    console.log("request",req.params);
    
    const {_id} = req.params;
    
    const id = _id;
    console.log("id",id);
    const projectId = id;
    const { entries } = req.body;
    console.log("Entries",entries);
    
    

    // Validate project exists
    const project = await Project.findOne({ projectId });
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

    // Process updates
    const updateResults = [];
    const bulkOps = [];
    
    for (const entry of entries) {
      // Validate required fields
      if (!entry.id) {
        return res.status(400).json({
          success: false,
          message: 'Each entry must have an id for updates'
        });
      }

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

      // Calculate variance
      const expected = parseFloat(entry.expectedCost);
      const actual = parseFloat(entry.actualCost);
      const variance = expected !== 0 ? ((actual - expected) / expected) * 100 : 0;

      // Prepare bulk operation
      bulkOps.push({
        updateOne: {
          filter: { 
            _id: entry.id,
            project: project._id // Ensure entry belongs to this project
          },
          update: {
            $set: {
              overheadComponent: entry.overheadComponent,
              subhead: entry.subhead,
              description: entry.description || '',
              expectedCost: expected,
              actualCost: actual,
              variance: variance,
              updatedAt: new Date()
            }
          }
        }
      });
    }

    // Execute bulk operations
    if (bulkOps.length > 0) {
      const result = await CostEntry.bulkWrite(bulkOps);
      updateResults.push(result);
    }

    // Get updated entries
    const updatedEntries = await CostEntry.find({
      _id: { $in: entries.map(e => e.id) },
      project: project._id
    });

    res.status(200).json({
      success: true,
      message: 'Cost entries updated successfully',
      data: {
        matchedCount: updateResults.reduce((sum, r) => sum + (r?.matchedCount || 0), 0),
        modifiedCount: updateResults.reduce((sum, r) => sum + (r?.modifiedCount || 0), 0),
        entries: updatedEntries
      }
    });

  } catch (error) {
    console.error('Error updating cost entries:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating cost entries',
      error: error.message
    });
  }
};


exports.deleteCostEntry = async (req, res) => { //logged endpoint
  try {
    const { id } = req.params;
    const { reason } = req.body; // Get reason from request body

    if (!reason) {
      return res.status(400).json({ message: 'Deletion reason is required' });
    }

    const entry = await CostEntry.findById(id);
    if (!entry) {
      return res.status(404).json({ message: 'Cost entry not found' });
    }

    const project = await Project.findOne({ projectId: entry.projectId });
    if (!project) {
      return res.status(404).json({ message: 'Associated project not found' });
    }

    const hasAccess = req.user.role === 'owner' ||
      project.teamLead.equals(req.user.id) ||
      project.members.includes(req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        message: 'Not authorized to delete this cost entry'
      });
    }

    // // Create audit log before deletion
    // await AuditLog.create({
    //   action: 'DELETE',
    //   entityType: 'CostEntry',
    //   entityId: id,
    //   performedBy: req.user.id,
    //   reason: reason,
    //   changes: entry.toObject() // Store the entire deleted entry
    // });
    res.locals.entityId = id;

    // Delete the entry
    await CostEntry.findByIdAndDelete(id);

    // Update project
    await Project.findByIdAndUpdate(
      project._id,
      { $pull: { costEntries: id } }
    );

    res.status(200).json({ message: 'Cost entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting cost entry:', error);
    res.status(500).json({
      message: 'Server error while deleting cost entry',
      error: error.message
    });
  }
};


exports.getOwnerDashboard = async (req, res) => {
  try {
    // Verify user is owner
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied - Only owners can view this dashboard'
      });
    }

    // Get all projects with basic info
    const projects = await Project.find({})
      .populate('teamLead', 'name email')
      .lean();

    // Get all cost entries grouped by project, filtering out null projects
    const costEntries = await CostEntry.aggregate([
      {
        $match: {
          project: { $ne: null } // Only include entries with non-null project reference
        }
      },
      {
        $group: {
          _id: '$project',
          totalExpectedCost: { $sum: '$expectedCost' },
          totalActualCost: { $sum: '$actualCost' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Create a map of project costs for easy lookup
    const projectCosts = {};
    costEntries.forEach(entry => {
      // Add additional null check just in case
      if (entry._id) {
        projectCosts[entry._id.toString()] = {
          expectedCost: entry.totalExpectedCost,
          actualCost: entry.totalActualCost
        };
      }
    });

    // Calculate totals
    const totalBudget = projects.reduce((sum, project) => sum + (project.budget || 0), 0);
    const totalCostAllocated = costEntries.reduce((sum, entry) => sum + (entry.totalExpectedCost || 0), 0);
    const totalActualCost = costEntries.reduce((sum, entry) => sum + (entry.totalActualCost || 0), 0);
    const totalProfitLoss = totalBudget - totalActualCost;

    // Prepare dashboard data
    const dashboardData = {
      summary: {
        totalProjects: projects.length,
        totalBudget,
        totalCostAllocated,
        totalActualCost,
        totalProfitLoss,
        profitPercentage: totalBudget > 0 ? ((totalProfitLoss / totalBudget) * 100).toFixed(2) : 0
      },
      projects: projects.map(project => {
        const costs = project._id && projectCosts[project._id.toString()] || {
          expectedCost: 0,
          actualCost: 0
        };
        // console.log("costs",project.projectId,project.budget,costs);
        
        const projectProfitLoss = (project.budget || 0) - costs.actualCost;
        
        return {
          id: project._id,
          projectId: project.projectId,
          name: project.name,
          budget: project.budget || 0,
          costAllocated: costs.expectedCost,
          actualCost: costs.actualCost,
          profitLoss: projectProfitLoss,
          profitPercentage: project.budget > 0 ? ((projectProfitLoss / project.budget) * 100).toFixed(2) : 0,
          teamLead: project.teamLead,
          createdAt: project.createdAt
        };
      }),
      costBreakdown: {
        byProject: projects
          .filter(project => project._id) // Filter out projects without IDs
          .map(project => ({
            name: project.name,
            expected: projectCosts[project._id.toString()]?.expectedCost || 0,
            actual: projectCosts[project._id.toString()]?.actualCost || 0
          })),
      },
      warnings: {
        projectsWithNullCosts: projects.length - Object.keys(projectCosts).length,
        totalNullCostEntries: await CostEntry.countDocuments({ project: null })
      }
    };

    res.status(200).json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: dashboardData
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};