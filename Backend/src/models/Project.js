const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true },
  projectName: { type: String, required: true },
  projectDescription: { type: String, required: true },
});

module.exports = mongoose.model("Project", ProjectSchema);
