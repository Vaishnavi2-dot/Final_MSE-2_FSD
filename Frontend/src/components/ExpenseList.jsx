import React from 'react';

const ExpenseList = ({ expenses, totalAmount, categorySummary, onDeleteExpense, selectedCategory, setSelectedCategory }) => {
  const categories = ['All', 'Food', 'Travel', 'Bills', 'Shopping', 'Entertainment', 'Healthcare', 'Education', 'Other'];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      {/* Filter Section */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '15px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '500', fontSize: '14px' }}>Filter by category:</span>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === 'All' ? '' : cat)}
                style={{
                  padding: '6px 15px',
                  background: selectedCategory === (cat === 'All' ? '' : cat) ? '#667eea' : '#f3f4f6',
                  color: selectedCategory === (cat === 'All' ? '' : cat) ? 'white' : '#333',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          borderRadius: '15px',
          color: 'white'
        }}>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>Total Expenses</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '5px' }}>
            ₹{totalAmount}
          </p>
          <p style={{ fontSize: '12px', opacity: 0.8 }}>{expenses.length} transactions</p>
        </div>
        
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Category Breakdown</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(categorySummary).slice(0, 4).map(([cat, amount]) => (
              <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>{cat}</span>
                <span style={{ fontWeight: '600' }}>₹{amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          padding: '20px',
          background: '#f9fafb',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '18px', color: '#333' }}>📋 Expense History</h3>
        </div>
        
        {expenses.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#999' }}>
            <span style={{ fontSize: '48px' }}>📭</span>
            <p style={{ marginTop: '10px', fontSize: '14px' }}>No expenses found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '15px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Title</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Category</th>
                  <th style={{ padding: '15px', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>Amount</th>
                  <th style={{ padding: '15px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Date</th>
                  <th style={{ padding: '15px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '15px', fontSize: '14px' }}>{expense.title}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        background: '#e0e7ff',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#667eea'
                      }}>
                        {expense.category}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#10b981' }}>
                      ₹{expense.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '15px', fontSize: '13px', color: '#666' }}>{formatDate(expense.date)}</td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button
                        onClick={() => onDeleteExpense(expense._id)}
                        style={{
                          background: '#fee',
                          color: '#ef4444',
                          border: 'none',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;