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

// Apply auth middleware to all project routes
router.use(authMiddleware);

// Get all projects (updated according to our conversation)
router.get('/getprojects/:role', projectController.getProjects); // Changed from '/getprojects'

// Create a new project (only owner/teamlead)
router.post('/', projectController.createProject); // Consider renaming to match REST conventions

// Get single project
router.get('/:id', projectController.getProjectById); // More RESTful URL

// Update a project (owner/assigned teamlead)
router.put('/:id', projectController.updateProject); // More RESTful URL

// Delete a project (only owner)
router.delete('/:id', projectController.deleteProject); // More RESTful URL

// Get cost entries by id
router.get('/cost-entries/:id', projectController.getCostentriesID); // Better REST structure

router.get('/getProjects/:id/:role',projectController.getProjectsUM)


router.post('/createproject', projectController.createProject);

router.post('/:id/cost-entries',projectController.saveCostEntries)

module.exports = router;