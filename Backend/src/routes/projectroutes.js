// const express = require('express');
// const router = express.Router();
// const projectController = require('../controllers/projectcontroller');
// const { authMiddleware } = require('../middleware/authMiddleware');

// // Apply auth middleware to all project routes
// router.use(authMiddleware);

// // Get all projects
// router.get('/getprojects', projectController.getProjects);

// // Create a new project (only owner/teamlead)
// router.post('/createproject', projectController.createProject);

// // Get single project
// router.get('/getproject/:id', projectController.getProjectById);

// // Update a project (owner/assigned teamlead)
// router.put('/updateproject/:id', projectController.updateProject);

// // Delete a project (only owner)
// router.delete('/deleteproject/:id', projectController.deleteProject);

// // Get cost entries by id
// router.get('/cost-entries/:id', projectController.getCostentriesID);

// module.exports = router;


const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectcontroller');
const { authMiddleware } = require('../middleware/authMiddleware');
const auditlog = require('../middleware/auditLog')

// Apply auth middleware to all project routes
router.use(authMiddleware);

// Get all projects (updated according to our conversation)
router.get('/getprojects/:role', projectController.getProjects); // Changed from '/getprojects'

// Create a new project (only owner/teamlead)
router.post('/', auditlog('CREATE','Project'),projectController.createProject); // Consider renaming to match REST conventions

// Get single project
router.get('/:id', projectController.getProjectById); // More RESTful URL

// Update a project (owner/assigned teamlead)
router.put('/:id',auditlog('UPDATE','Project'), projectController.updateProject); // More RESTful URL

// Delete a project (only owner)
router.delete('/:id',auditlog('DELETE','Project'), projectController.deleteProject); // More RESTful URL

// Get cost entries by id
router.get('/cost-entries/:id', projectController.getCostentriesID); // Better REST structure

router.get('/getProjects/:id/:role',projectController.getProjectsUM)


router.post('/createproject', auditlog('CREATE','Project'),projectController.createProject);

router.post('/:id/cost-entries',auditlog('CREATE','CostEntry'),projectController.saveCostEntries);

router.delete('/cost-entries/:id',auditlog('DELETE','CostEntry'),projectController.deleteCostEntry)

//owner dashboard
router.get('/owner/dashboard',projectController.getOwnerDashboard)

module.exports = router;