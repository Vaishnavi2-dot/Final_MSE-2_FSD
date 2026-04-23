const Grievance = require('../models/Grievance');

// @route   POST /api/grievances
// @desc    Submit new grievance
// @access  Private
const submitGrievance = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const userId = req.user.id;
    
    if (!title || !description) {
      return res.status(400).json({ 
        message: 'Title and description are required'
      });
    }
    
    const grievance = new Grievance({
      user: userId,
      title,
      description,
      category: category || 'Other'
    });
    
    await grievance.save();
    
    res.status(201).json({
      success: true,
      message: 'Grievance submitted successfully',
      grievance
    });
    
  } catch (error) {
    console.error('Submit grievance error:', error);
    res.status(500).json({ 
      message: 'Server error while submitting grievance',
      error: error.message 
    });
  }
};

// @route   GET /api/grievances
// @desc    Get all grievances of logged-in user
// @access  Private
const getAllGrievances = async (req, res) => {
  try {
    const userId = req.user.id;
    const grievances = await Grievance.find({ user: userId })
      .sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: grievances.length,
      grievances
    });
    
  } catch (error) {
    console.error('Get grievances error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching grievances',
      error: error.message 
    });
  }
};

// @route   GET /api/grievances/:id
// @desc    Get grievance by ID
// @access  Private
const getGrievanceById = async (req, res) => {
  try {
    const grievanceId = req.params.id;
    const userId = req.user.id;
    
    const grievance = await Grievance.findOne({ _id: grievanceId, user: userId });
    
    if (!grievance) {
      return res.status(404).json({ 
        message: 'Grievance not found or unauthorized'
      });
    }
    
    res.status(200).json({
      success: true,
      grievance
    });
    
  } catch (error) {
    console.error('Get grievance by ID error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching grievance',
      error: error.message 
    });
  }
};

// @route   PUT /api/grievances/:id
// @desc    Update grievance
// @access  Private
const updateGrievance = async (req, res) => {
  try {
    const grievanceId = req.params.id;
    const userId = req.user.id;
    const { title, description, category, status } = req.body;
    
    const grievance = await Grievance.findOne({ _id: grievanceId, user: userId });
    
    if (!grievance) {
      return res.status(404).json({ 
        message: 'Grievance not found or unauthorized'
      });
    }
    
    if (title) grievance.title = title;
    if (description) grievance.description = description;
    if (category) grievance.category = category;
    if (status) grievance.status = status;
    
    await grievance.save();
    
    res.status(200).json({
      success: true,
      message: 'Grievance updated successfully',
      grievance
    });
    
  } catch (error) {
    console.error('Update grievance error:', error);
    res.status(500).json({ 
      message: 'Server error while updating grievance',
      error: error.message 
    });
  }
};

// @route   DELETE /api/grievances/:id
// @desc    Delete grievance
// @access  Private
const deleteGrievance = async (req, res) => {
  try {
    const grievanceId = req.params.id;
    const userId = req.user.id;
    
    const grievance = await Grievance.findOne({ _id: grievanceId, user: userId });
    
    if (!grievance) {
      return res.status(404).json({ 
        message: 'Grievance not found or unauthorized'
      });
    }
    
    await grievance.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Grievance deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete grievance error:', error);
    res.status(500).json({ 
      message: 'Server error while deleting grievance',
      error: error.message 
    });
  }
};

// @route   GET /api/grievances/search?title=xyz
// @desc    Search grievances by title
// @access  Private
const searchGrievances = async (req, res) => {
  try {
    const { title } = req.query;
    const userId = req.user.id;
    
    if (!title) {
      return res.status(400).json({ 
        message: 'Search title is required'
      });
    }
    
    const grievances = await Grievance.find({
      user: userId,
      title: { $regex: title, $options: 'i' } // Case-insensitive search
    }).sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      count: grievances.length,
      grievances
    });
    
  } catch (error) {
    console.error('Search grievances error:', error);
    res.status(500).json({ 
      message: 'Server error while searching grievances',
      error: error.message 
    });
  }
};

module.exports = {
  submitGrievance,
  getAllGrievances,
  getGrievanceById,
  updateGrievance,
  deleteGrievance,
  searchGrievances
};