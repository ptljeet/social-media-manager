const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');
const teamRoutes = require('./routes/teamRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/userRoutes');
const path = require('path'); 



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
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/teams', require('./routes/teamRoutes')); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);





// Health check route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// TODO: Add routes here
// app.use('/api/auth', require('./routes/authRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
