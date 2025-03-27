require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Project = require("../models/Project");
const CostOverhead = require("../models/Costoverhead");
const CostEntry = require("../models/Costentry"); // Make sure you have this model

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

// Sample cost overheads for PROJ-001 (E-Commerce)
const sampleOverheadsPROJ001 = [
  {
    projectId: "PROJ-001",
    overheadComponent: "Development",
    description: "Website development costs",
    subheads: [
      { name: "Frontend Development", createdAt: new Date() },
      { name: "Backend Development", createdAt: new Date() },
      { name: "Payment Gateway Integration", createdAt: new Date() }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    projectId: "PROJ-001",
    overheadComponent: "Hosting",
    description: "Server and cloud services",
    subheads: [
      { name: "AWS Services", createdAt: new Date() },
      { name: "Database Hosting", createdAt: new Date() }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Sample cost overheads for PROJ-002 (Mobile Banking)
const sampleOverheadsPROJ002 = [
  {
    projectId: "PROJ-002",
    overheadComponent: "Security",
    description: "Banking security implementation",
    subheads: [
      { name: "Encryption", createdAt: new Date() },
      { name: "Two-Factor Authentication", createdAt: new Date() },
      { name: "Penetration Testing", createdAt: new Date() }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    projectId: "PROJ-002",
    overheadComponent: "Compliance",
    description: "Financial regulations",
    subheads: [
      { name: "PCI DSS Compliance", createdAt: new Date() },
      { name: "Audit Costs", createdAt: new Date() }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Sample cost entries for PROJ-001
const sampleCostEntriesPROJ001 = [
  {
    projectId: "PROJ-001",
    overheadComponent: "Development",
    subhead: "Frontend Development",
    description: "React components implementation",
    expectedCost: 15000,
    actualCost: 14500,
    variance: -3.33,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    projectId: "PROJ-001",
    overheadComponent: "Development",
    subhead: "Backend Development",
    description: "API development with Node.js",
    expectedCost: 20000,
    actualCost: 21000,
    variance: 5.00,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    projectId: "PROJ-001",
    overheadComponent: "Hosting",
    subhead: "AWS Services",
    description: "EC2 instances for production",
    expectedCost: 5000,
    actualCost: 5200,
    variance: 4.00,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Sample cost entries for PROJ-002
const sampleCostEntriesPROJ002 = [
  {
    projectId: "PROJ-002",
    overheadComponent: "Security",
    subhead: "Encryption",
    description: "Data encryption implementation",
    expectedCost: 8000,
    actualCost: 7500,
    variance: -6.25,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    projectId: "PROJ-002",
    overheadComponent: "Compliance",
    subhead: "PCI DSS Compliance",
    description: "Compliance certification costs",
    expectedCost: 12000,
    actualCost: 12500,
    variance: 4.17,
    createdAt: new Date(),
    updatedAt: new Date()
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
    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await CostOverhead.deleteMany();
    await CostEntry.deleteMany();
    console.log("Existing data cleared");

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
    console.log("Users seeded");

    // Seed sample projects
    const createdProjects = await Project.insertMany(sampleProjects);
    console.log("Projects seeded");

    // Seed overheads for PROJ-001
    await CostOverhead.insertMany(sampleOverheadsPROJ001);
    console.log("Overheads for PROJ-001 seeded");

    // Seed overheads for PROJ-002
    await CostOverhead.insertMany(sampleOverheadsPROJ002);
    console.log("Overheads for PROJ-002 seeded");

    // Seed cost entries for PROJ-001
    await CostEntry.insertMany(sampleCostEntriesPROJ001);
    console.log("Cost entries for PROJ-001 seeded");

    // Seed cost entries for PROJ-002
    await CostEntry.insertMany(sampleCostEntriesPROJ002);
    console.log("Cost entries for PROJ-002 seeded");

    mongoose.connection.close();
    console.log("Seeding complete");
  } catch (error) {
    console.error("Seeding error:", error);
    mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();