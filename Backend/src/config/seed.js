require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Project = require("../models/Project"); // Import the Project model

console.log("MongoDB URI:", process.env.MONGO_URI);

// Sample users for seeding
const sampleUsers = [
  {
    username: "admin",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
  },
  {
    username: "user1",
    email: "user1@example.com",
    password: "password123",
    role: "user",
  },
  {
    username: "admin1",
    email: "admin1@example.com",
    password: "password123",
    role: "admin",
  },
];

// Sample projects for seeding
const sampleProjects = [
  {
    projectId: 'PROJ-001',
    name: "E-Commerce Platform",
    description: "Development of a full-stack e-commerce website with React and Node.js"
  },
  {
    projectId: 'PROJ-002',
    name: "Mobile Banking App",
    description: "iOS and Android application for online banking services"
  },
  {
    projectId: 'PROJ-003',
    name: "Inventory Management System",
    description: "Enterprise solution for tracking inventory across multiple warehouses"
  },
  {
    projectId: 'PROJ-004',
    name: "Healthcare Portal",
    description: "Patient management system for clinics and hospitals"
  },
  {
    projectId: 'PROJ-005',
    name: "Smart Home Automation",
    description: "IoT platform for controlling home devices remotely"
  }
];

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const seedDatabase = async () => {
  try {
    // Clear existing users and projects
    await User.deleteMany();
    await Project.deleteMany();
    console.log("Existing users and projects cleared");

    // Seed sample users
    for (const user of sampleUsers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);

      await User.create({
        username: user.username,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      });
    }
    console.log("Sample users seeded successfully");

    // Seed sample projects
    await Project.insertMany(sampleProjects);
    console.log("Sample projects seeded successfully");

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database:", error);
    mongoose.connection.close();
  }
};

// Run the seed function
seedDatabase();
