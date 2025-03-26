const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const authRoutes = require("./src/routes/authroutes");
const projectRoutes=require("./src/routes/projectroutes")

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || "mongodb+srv://RDLOMS:#RDLoms@cluster0.1mpd2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/projects",projectRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
