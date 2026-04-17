const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  addExpense,
  getUserExpenses,
  deleteExpense,
  updateExpense
} = require('../controllers/expenseController');

// All expense routes are protected
router.use(authMiddleware);

// @route   POST /api/expense
router.post('/expense', addExpense);

// @route   GET /api/expenses
router.get('/expenses', getUserExpenses);

// @route   DELETE /api/expense/:id (Bonus)
router.delete('/expense/:id', deleteExpense);

// @route   PUT /api/expense/:id (Bonus)
router.put('/expense/:id', updateExpense);

module.exports = router;