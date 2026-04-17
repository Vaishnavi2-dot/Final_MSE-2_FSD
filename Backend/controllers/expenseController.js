const Expense = require('../models/Expense');

// @route   POST /api/expense
// @desc    Add new expense (Protected)
// @access  Private
const addExpense = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    const userId = req.user.id;
    
    // Validation
    if (!title || !amount || !category) {
      return res.status(400).json({ 
        message: 'Please provide title, amount and category',
        error: 'Missing required fields'
      });
    }
    
    // Create expense
    const expense = new Expense({
      user: userId,
      title,
      amount: parseFloat(amount),
      category,
      date: date || Date.now()
    });
    
    await expense.save();
    
    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      expense
    });
    
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ 
      message: 'Server error while adding expense',
      error: error.message 
    });
  }
};

// @route   GET /api/expenses
// @desc    Get all expenses of logged-in user
// @access  Private
const getUserExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, startDate, endDate } = req.query;
    
    // Build query
    let query = { user: userId };
    
    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    // Get expenses
    const expenses = await Expense.find(query)
      .sort({ date: -1 }) // Most recent first
      .select('-__v');
    
    // Calculate total amount
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Get category-wise summary
    const categorySummary = {};
    expenses.forEach(expense => {
      if (!categorySummary[expense.category]) {
        categorySummary[expense.category] = 0;
      }
      categorySummary[expense.category] += expense.amount;
    });
    
    res.status(200).json({
      success: true,
      count: expenses.length,
      totalAmount: totalAmount.toFixed(2),
      categorySummary,
      expenses
    });
    
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching expenses',
      error: error.message 
    });
  }
};

// @route   DELETE /api/expense/:id
// @desc    Delete an expense (Bonus)
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    const userId = req.user.id;
    
    const expense = await Expense.findOne({ _id: expenseId, user: userId });
    
    if (!expense) {
      return res.status(404).json({ 
        message: 'Expense not found or unauthorized',
        error: 'Expense not found'
      });
    }
    
    await expense.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ 
      message: 'Server error while deleting expense',
      error: error.message 
    });
  }
};

// @route   PUT /api/expense/:id
// @desc    Update an expense (Bonus)
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    const userId = req.user.id;
    const { title, amount, category, date } = req.body;
    
    const expense = await Expense.findOne({ _id: expenseId, user: userId });
    
    if (!expense) {
      return res.status(404).json({ 
        message: 'Expense not found or unauthorized',
        error: 'Expense not found'
      });
    }
    
    // Update fields
    if (title) expense.title = title;
    if (amount) expense.amount = parseFloat(amount);
    if (category) expense.category = category;
    if (date) expense.date = date;
    
    await expense.save();
    
    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      expense
    });
    
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ 
      message: 'Server error while updating expense',
      error: error.message 
    });
  }
};

module.exports = {
  addExpense,
  getUserExpenses,
  deleteExpense,
  updateExpense
};