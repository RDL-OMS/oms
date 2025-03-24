const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const projectRoutes = require('./routes/projectRoutes');
app.use('/api/projects', projectRoutes);

module.exports = app;