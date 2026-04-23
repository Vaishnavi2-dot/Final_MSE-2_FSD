import React, { useState, useEffect } from 'react';
import { getAllGrievances, submitGrievance, updateGrievance, deleteGrievance, searchGrievances } from '../services/api';

const Dashboard = () => {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Other'
  });

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    try {
      setLoading(true);
      const response = await getAllGrievances();
      setGrievances(response.data.grievances);
    } catch (error) {
      showMessage('Failed to fetch grievances', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      fetchGrievances();
      return;
    }
    try {
      const response = await searchGrievances(searchTerm);
      setGrievances(response.data.grievances);
    } catch (error) {
      showMessage('Search failed', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitGrievance(formData);
      showMessage('Grievance submitted successfully!', 'success');
      setFormData({ title: '', description: '', category: 'Other' });
      fetchGrievances();
    } catch (error) {
      showMessage('Failed to submit grievance', 'error');
    }
  };

  const handleUpdate = async (id) => {
    try {
      await updateGrievance(id, formData);
      showMessage('Grievance updated successfully!', 'success');
      setEditingId(null);
      setFormData({ title: '', description: '', category: 'Other' });
      fetchGrievances();
    } catch (error) {
      showMessage('Failed to update grievance', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this grievance?')) {
      try {
        await deleteGrievance(id);
        showMessage('Grievance deleted successfully!', 'success');
        fetchGrievances();
      } catch (error) {
        showMessage('Failed to delete grievance', 'error');
      }
    }
  };

  const startEdit = (grievance) => {
    setEditingId(grievance._id);
    setFormData({
      title: grievance.title,
      description: grievance.description,
      category: grievance.category
    });
  };

  const showMessage = (msg, type) => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const getStatusColor = (status) => {
    return status === 'Resolved' ? '#10b981' : '#f59e0b';
  };

  if (loading) {
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

      {/* Submit Grievance Form */}
      <div style={{
        background: 'white',
        padding: '25px',
        borderRadius: '15px',
        marginBottom: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '20px', marginBottom: '20px' }}>
          {editingId ? '✏️ Edit Grievance' : '📝 Submit New Grievance'}
        </h3>
        
        <form onSubmit={editingId ? () => handleUpdate(editingId) : handleSubmit}>
          <div style={{ display: 'grid', gap: '15px', marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="Title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              style={{ padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
            />
            
            <textarea
              placeholder="Description *"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows="4"
              style={{ padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
            />
            
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{ padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
            >
              <option value="Academic">Academic</option>
              <option value="Hostel">Hostel</option>
              <option value="Transport">Transport</option>
              <option value="Other">Other</option>
            </select>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  background: editingId ? '#f59e0b' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {editingId ? 'Update Grievance' : 'Submit Grievance'}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ title: '', description: '', category: 'Other' });
                  }}
                  style={{
                    padding: '12px 24px',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Search Bar */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '15px',
        marginBottom: '20px',
        display: 'flex',
        gap: '10px'
      }}>
        <input
          type="text"
          placeholder="Search grievances by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '12px 24px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Search
        </button>
      </div>

      {/* Grievances List */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ padding: '20px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '18px' }}>📋 My Grievances</h3>
        </div>
        
        {grievances.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#999' }}>
            <span style={{ fontSize: '48px' }}>📭</span>
            <p>No grievances found</p>
          </div>
        ) : (
          <div>
            {grievances.map((grievance) => (
              <div key={grievance._id} style={{
                padding: '20px',
                borderBottom: '1px solid #e5e7eb',
                transition: 'background 0.3s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
                      <h4 style={{ fontSize: '18px', color: '#333' }}>{grievance.title}</h4>
                      <span style={{
                        background: '#e0e7ff',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#667eea'
                      }}>
                        {grievance.category}
                      </span>
                      <span style={{
                        background: '#fee',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: getStatusColor(grievance.status),
                        border: `1px solid ${getStatusColor(grievance.status)}`
                      }}>
                        {grievance.status}
                      </span>
                    </div>
                    <p style={{ color: '#666', marginBottom: '8px', fontSize: '14px' }}>{grievance.description}</p>
                    <p style={{ fontSize: '12px', color: '#999' }}>
                      Submitted: {new Date(grievance.date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => startEdit(grievance)}
                      style={{
                        padding: '6px 16px',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(grievance._id)}
                      style={{
                        padding: '6px 16px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;