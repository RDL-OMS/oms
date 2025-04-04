const mongoose = require('mongoose');

// Function to generate employee ID with prefix
const generateEmployeeId = async () => {
  const lastUser = await mongoose.model('User').findOne().sort({ createdAt: -1 }); // Fetch last user
  const lastEmployeeId = lastUser ? lastUser.employeeId : null; // If no user, return null

  const nextNumber = lastEmployeeId ? parseInt(lastEmployeeId.split('-')[2]) + 1 : 10000; // Increment number part
  return `RDL-EMP-${nextNumber.toString().padStart(5, '0')}`; // Format it with leading zeros
};

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['owner', 'teamlead', 'member'], // Changed to our three roles
    default: 'member' // Default role for new users
  },
  projects: [{ // For tracking which projects user is part of
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  managedProjects: [{ // For team leads to track which projects they manage
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  employeeId: { 
    type: String, 
    unique: true 
    // required: true 
  }
});

// Pre-save hook to generate employeeId
UserSchema.pre('save', async function(next) {
  if (!this.employeeId) {
    this.employeeId = await generateEmployeeId();
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);
