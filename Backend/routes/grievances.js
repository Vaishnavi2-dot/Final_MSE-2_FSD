const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  submitGrievance,
  getAllGrievances,
  getGrievanceById,
  updateGrievance,
  deleteGrievance,
  searchGrievances
} = require('../controllers/grievanceController');

// All grievance routes are protected
router.use(authMiddleware);

// Routes
router.post('/grievances', submitGrievance);
router.get('/grievances', getAllGrievances);
router.get('/grievances/search', searchGrievances);
router.get('/grievances/:id', getGrievanceById);
router.put('/grievances/:id', updateGrievance);
router.delete('/grievances/:id', deleteGrievance);

module.exports = router;