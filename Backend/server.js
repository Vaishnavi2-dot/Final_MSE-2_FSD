const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const grievanceRoutes = require('./routes/grievances');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api', authRoutes);
app.use('/api', grievanceRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: '🎓 Student Grievance Management System API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      auth: {
        register: 'POST /api/register',
        login: 'POST /api/login'
      },
      grievances: {
        submit: 'POST /api/grievances',
        getAll: 'GET /api/grievances',
        getById: 'GET /api/grievances/:id',
        update: 'PUT /api/grievances/:id',
        delete: 'DELETE /api/grievances/:id',
        search: 'GET /api/grievances/search?title=xyz'
      }
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Grievance Management Server running on port ${PORT}`);
});