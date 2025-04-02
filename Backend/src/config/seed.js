require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Project = require("../models/Project");
const CostOverhead = require("../models/Costoverhead");

console.log("MongoDB URI:", process.env.MONGO_URI);

// Sample users for seeding - updated to match your User model
const generateEmployeeId = (index) => {
  return `RDL-EMP-${(10000 + index).toString().padStart(5, '0')}`;
};

const sampleUsers = [
  {
    username: "owner1",
    name: "manoj",
    email: "owner1@example.com",
    password: "password123",
    role: "owner",
    employeeId: generateEmployeeId(1)
  },
  {
    username: "teamlead1",
    name: "sanjana",
    email: "teamlead1@example.com",
    password: "password123",
    role: "teamlead",
    employeeId: generateEmployeeId(2)
  },
  {
    username: "member1",
    name: "abhijina",
    email: "member1@example.com",
    password: "password123",
    role: "member",
    employeeId: generateEmployeeId(3)
  },
  {
    username: "member2",
    name: "megha",
    email: "member2@example.com",
    password: "password123",
    role: "member",
    employeeId: generateEmployeeId(4)
  },
  {
    username: "teamlead2",
    name: "shreya",
    email: "teamlead2@example.com",
    password: "password123",
    role: "teamlead",
    employeeId: generateEmployeeId(5)
  },
];


// Sample projects for seeding - will be updated after users are created
const sampleProjects = [
  {
    projectId: 'PROJ-001',
    name: "E-Commerce Platform",
    description: "Development of a full-stack e-commerce website with React and Node.js",
    budget:45000
  },
  {
    projectId: 'PROJ-002',
    name: "Mobile Banking App",
    description: "iOS and Android application for online banking services",
    budget:45000
  },
  {
    projectId: 'PROJ-003',
    name: "Inventory Management System",
    description: "Enterprise solution for tracking inventory across multiple warehouses",
    budget:45000
  }
];

// Sample cost overheads data
const sampleCostOverheads = [
  // Overheads for PROJ-001 (E-Commerce Platform)
  {
    projectId: "PROJ-001",
    overheadComponent: "Development",
    description: "Website development costs",
    subheads: [
      { name: "Frontend Development" },
      { name: "Backend Development" },
      { name: "Payment Gateway Integration" },
      { name: "fghfvgfbyugj" }
    ]
  },
  {
    projectId: "PROJ-001",
    overheadComponent: "Hosting",
    description: "Server and cloud services",
    subheads: [
      { name: "AWS Services" },
      { name: "Database Hosting" },
      { name: "CDN Services" }
    ]
  },
  {
    projectId: "PROJ-001",
    overheadComponent: "Design",
    description: "UI/UX design costs",
    subheads: [
      { name: "Wireframing" },
      { name: "Visual Design" },
      { name: "Prototyping" }
    ]
  },
  
  {
    projectId: "PROJ-001",
    overheadComponent: "Dgbjgf",
    description: "UI/UX design costs",
    subheads: [
      { name: "Wireframingjhj jh" },
      { name: "yjgbygun" },
      { name: "Projvybg" }
    ]
  },


  // Overheads for PROJ-002 (Mobile Banking App)
  {
    projectId: "PROJ-002",
    overheadComponent: "Development",
    description: "App development costs",
    subheads: [
      { name: "iOS Development" },
      { name: "Android Development" },
      { name: "Backend API Development" }
    ]
  },
  {
    projectId: "PROJ-002",
    overheadComponent: "Security",
    description: "Security implementation costs",
    subheads: [
      { name: "Encryption" },
      { name: "Two-Factor Authentication" },
      { name: "Penetration Testing" }
    ]
  },
  {
    projectId: "PROJ-002",
    overheadComponent: "Compliance",
    description: "Regulatory compliance costs",
    subheads: [
      { name: "PCI DSS Compliance" },
      { name: "Financial Audit" },
      { name: "Legal Consultation" }
    ]
  },

  // Overheads for PROJ-003 (Inventory Management System)
  {
    projectId: "PROJ-003",
    overheadComponent: "Development",
    description: "System development costs",
    subheads: [
      { name: "Core System Development" },
      { name: "Reporting Module" },
      { name: "Integration APIs" }
    ]
  },
  {
    projectId: "PROJ-003",
    overheadComponent: "Hardware",
    description: "Required hardware costs",
    subheads: [
      { name: "Barcode Scanners" },
      { name: "Inventory Terminals" },
      { name: "Network Equipment" }
    ]
  },
  {
    projectId: "PROJ-003",
    overheadComponent: "Training",
    description: "Staff training costs",
    subheads: [
      { name: "Admin Training" },
      { name: "User Training" },
      { name: "Technical Support Training" }
    ]
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
    console.log("Existing data cleared");

    // Seed sample users with hashed passwords
    const createdUsers = [];
    for (const user of sampleUsers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      const newUser = await User.create({
        username: user.username,
        employeeId:user.employeeId,
        name:user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      });
      createdUsers.push(newUser);
    }
    console.log("Users seeded");

    // Find specific users by their role for project assignment
    const owner = createdUsers.find(u => u.role === 'owner');
    const teamlead1 = createdUsers.find(u => u.username === 'teamlead1');
    const teamlead2 = createdUsers.find(u => u.username === 'teamlead2');
    const member1 = createdUsers.find(u => u.username === 'member1');
    const member2 = createdUsers.find(u => u.username === 'member2');

    // Update projects with user references
    const projectsToSeed = [
      {
        ...sampleProjects[0],
        createdBy: owner._id,
        teamLead: teamlead1._id,
        members: [member1._id, member2._id]
      },
      {
        ...sampleProjects[1],
        createdBy: owner._id,
        teamLead: teamlead2._id,
        members: [member1._id]
      },
      {
        ...sampleProjects[2],
        createdBy: owner._id,
        teamLead: teamlead1._id,
        members: [member2._id]
      }
    ];

    // Seed projects
    const createdProjects = await Project.insertMany(projectsToSeed);
    console.log("Projects seeded");

    // Update users with their project assignments
    await User.updateMany(
      { _id: owner._id },
      { $addToSet: { projects: { $each: createdProjects.map(p => p._id) } } }
    );

    await User.updateMany(
      { _id: teamlead1._id },
      { 
        $addToSet: { 
          projects: [createdProjects[0]._id, createdProjects[2]._id],
          managedProjects: [createdProjects[0]._id, createdProjects[2]._id]
        } 
      }
    );

    await User.updateMany(
      { _id: teamlead2._id },
      { 
        $addToSet: { 
          projects: createdProjects[1]._id,
          managedProjects: createdProjects[1]._id
        } 
      }
    );

    await User.updateMany(
      { _id: member1._id },
      { $addToSet: { projects: [createdProjects[0]._id, createdProjects[1]._id] } }
    );

    await User.updateMany(
      { _id: member2._id },
      { $addToSet: { projects: [createdProjects[0]._id, createdProjects[2]._id] } }
    );

    console.log("User project assignments updated");

    // Seed cost overheads
    await CostOverhead.insertMany(sampleCostOverheads);
    console.log("Cost overheads seeded");

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