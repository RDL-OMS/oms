const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const authRoutes = require("./src/routes/authroutes");
const projectRoutes=require("./src/routes/projectroutes")
const CostOverheadroutes=require("./src/routes/Costoverheadroutes")
const adminRoutes=require('./src/routes/adminroutes')
const userRoutes = require('./src/routes/Userroutes')
const logroutes = require('./src/routes/logroutes')

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || "mongodb+srv://RDLOMS:#RDLoms@cluster0.1mpd2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/projects",projectRoutes)
app.use("/api/overheads",CostOverheadroutes)
app.use('/api/admin',adminRoutes)
app.use('/api/users',userRoutes)
app.use('/api/logs',logroutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
