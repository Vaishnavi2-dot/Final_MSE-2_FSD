const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('✅ MongoDB Atlas Connected Successfully');
  console.log(`📊 Database: ${mongoose.connection.name}`);
})
.catch((err) => {
  console.error('❌ MongoDB Atlas Connection Error:', err.message);
  console.error('💡 Please check your MONGO_URI in .env file');
});

// Routes
app.use('/api', authRoutes);
app.use('/api', expenseRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Expense Manager API is running!',
    status: 'active',
    endpoints: {
      register: 'POST /api/register',
      login: 'POST /api/login',
      addExpense: 'POST /api/expense (Protected)',
      getExpenses: 'GET /api/expenses (Protected)'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║     🚀 Expense Manager Server Started Successfully     ║
╚═══════════════════════════════════════════════════════╝

📡 Local Server:     http://localhost:${PORT}
🔗 API Base URL:     http://localhost:${PORT}/api
🏠 Home:             http://localhost:${PORT}/

📋 Available Endpoints:
  • POST   /api/register     - Register new user
  • POST   /api/login        - Login user
  • POST   /api/expense      - Add new expense (JWT required)
  • GET    /api/expenses     - Get all expenses (JWT required)

💡 Press Ctrl+C to stop the server
  `);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️  Server shutting down...');
  mongoose.connection.close(() => {
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
});