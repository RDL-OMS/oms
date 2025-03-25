require("dotenv").config();
console.log("MongoDB URI:", process.env.MONGO_URI); 
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

// Sample users for seeding
const sampleUsers = [
  {
    username: "admin",
    email: "admin@example.com",
    password: "password123",
    role: "admin"
},
{
    username: "user1",
    email: "user1@example.com",
    password: "password123",
    role: "user"
},
{
  username: "admin1",
  email: "admin1@example.com",
  password: "password123",
  role: "admin"
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

  const seedUsers = async () => {
    try {
      // Clear existing users
      await User.deleteMany();
      console.log("Existing users cleared");
  
      // Seed sample users
      for (const user of sampleUsers) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        // Ensure all required fields are provided
        await User.create({ 
          username: user.username, 
          email: user.email, 
          password: hashedPassword, 
          role: user.role 
        });
      }
  
      console.log("Sample users seeded successfully");
      console.log("Seeded Users:");
      sampleUsers.forEach(user => {
        console.log(`Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
      });
  
      mongoose.connection.close();
    } catch (error) {
      console.error("Error seeding users:", error);
      mongoose.connection.close();
    }
  };
  

// Run the seed function
seedUsers();
