// File: backend/src/controllers/projectController.js
const Project = require('../models/Project');

// Get all projects
exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// Get a single project by ID
exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// Create a new project
exports.createProject = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newProject = new Project({ name, description });
        await newProject.save();
        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// Update a project
exports.updateProject = async (req, res) => {
    try {
        const { name, description } = req.body;
        const updatedProject = await Project.findByIdAndUpdate(req.params.id, { name, description }, { new: true });
        if (!updatedProject) return res.status(404).json({ message: 'Project not found' });
        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// Delete a project
exports.deleteProject = async (req, res) => {
    try {
        const deletedProject = await Project.findByIdAndDelete(req.params.id);
        if (!deletedProject) return res.status(404).json({ message: 'Project not found' });
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
