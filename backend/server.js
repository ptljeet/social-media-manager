// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// ---- load env & connect DB ----
dotenv.config();
connectDB();

// ---- init app ----
const app = express();

// ---- core middleware ----
app.use(cors({ origin: ['http://localhost:3000'], credentials: false }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---- static: uploaded media ----
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---- import routes ONCE ----
const authRoutes = require('./routes/authRoutes');
const privateRoutes = require('./routes/privateRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const postRoutes = require('./routes/postRoutes');
const adminRoutes = require('./routes/adminRoutes');
const teamRoutes = require('./routes/teamRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/userRoutes');
const invitationRoutes = require('./routes/invitationRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const publicRoutes = require('./routes/publicRoutes');

// ---- mount routes ONCE ----
app.use('/api/auth', authRoutes);
app.use('/api/private', privateRoutes);
app.use('/api', organizationRoutes);           // e.g. /api/organizations/...
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/public', publicRoutes);

// ---- health check ----
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ---- 404 fallback (optional) ----
app.use((req, res) => res.status(404).json({ message: 'Not Found' }));

// ---- start server ----
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
