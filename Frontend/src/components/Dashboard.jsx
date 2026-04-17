import React, { useState, useEffect } from 'react';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import { getExpenses, addExpense, deleteExpense } from '../services/api';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [categorySummary, setCategorySummary] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, [selectedCategory]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await getExpenses(selectedCategory);
      setExpenses(response.data.expenses);
      setTotalAmount(response.data.totalAmount);
      setCategorySummary(response.data.categorySummary);
    } catch (error) {
      showMessage('Failed to fetch expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (expenseData) => {
    try {
      await addExpense(expenseData);
      showMessage('Expense added successfully!', 'success');
      fetchExpenses();
    } catch (error) {
      showMessage('Failed to add expense', 'error');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
        showMessage('Expense deleted successfully!', 'success');
        fetchExpenses();
      } catch (error) {
        showMessage('Failed to delete expense', 'error');
      }
    }
  };

  const showMessage = (msg, type) => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading && expenses.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      {message && (
        <div className={`toast-${message.type}`}>
          {message.text}
        </div>
      )}
      
      <ExpenseForm onAddExpense={handleAddExpense} />
      <ExpenseList
        expenses={expenses}
        totalAmount={totalAmount}
        categorySummary={categorySummary}
        onDeleteExpense={handleDeleteExpense}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
    </div>
  );
};

export default Dashboard;