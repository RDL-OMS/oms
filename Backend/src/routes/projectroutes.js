const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// Get all projects
router.get('/getprojects', projectController.getProjects);

// Create a new project
router.post('/createproject', projectController.createProject);

// Get single project
router.get('/getproject/:id', projectController.getProjectById);

// Update a project
router.put('/updateproject/:id', projectController.updateProject);

// Delete a project
router.delete('/deleteproject/:id', projectController.deleteProject);
//get cost entries by id
router.get('/cost-entries/:id',projectController.getCostentriesID)

module.exports = router;