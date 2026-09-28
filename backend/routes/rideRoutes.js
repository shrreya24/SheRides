const express = require('express');
const router = express.Router();
const {
  createRide,
  getRides,
  getRideById,
  getMyRides,
  requestRide,
  handleRequest,
  cancelRequest,
  startRide,
  completeRide,
  cancelRide,
  getIncomingRequests,
  getMyRequests,
} = require('../controllers/rideController');
const { protect, authorizeRoles } = require('../middleware/auth');

// Specific routes before :id
router.get('/my-rides', protect, getMyRides);
router.get('/requests/incoming', protect, authorizeRoles('driver'), getIncomingRequests);
router.get('/requests/mine', protect, authorizeRoles('passenger'), getMyRequests);

// General routes
router.get('/', getRides);
router.post('/', protect, authorizeRoles('driver'), createRide);

// Ride-specific routes
router.get('/:id', getRideById);
router.post('/:id/request', protect, authorizeRoles('passenger'), requestRide);
router.delete('/:id/request', protect, authorizeRoles('passenger'), cancelRequest);
router.put('/:id/request/:passengerId', protect, authorizeRoles('driver'), handleRequest);
router.put('/:id/start', protect, authorizeRoles('driver'), startRide);
router.put('/:id/complete', protect, authorizeRoles('driver'), completeRide);
router.put('/:id/cancel', protect, authorizeRoles('driver'), cancelRide);

module.exports = router;
