const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/private', require('./routes/privateRoutes'));
app.use('/api', require('./routes/organizationRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));



// Health check route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// TODO: Add routes here
// app.use('/api/auth', require('./routes/authRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
