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
const { protect } = require('../middleware/auth');

// Specific routes before :id
router.get('/my-rides', protect, getMyRides);
router.get('/requests/incoming', protect, getIncomingRequests);
router.get('/requests/mine', protect, getMyRequests);

// General routes
router.get('/', getRides);
router.post('/', protect, createRide);

// Ride-specific routes
router.get('/:id', getRideById);
router.post('/:id/request', protect, requestRide);
router.delete('/:id/request', protect, cancelRequest);
router.put('/:id/request/:passengerId', protect, handleRequest);
router.put('/:id/start', protect, startRide);
router.put('/:id/complete', protect, completeRide);
router.put('/:id/cancel', protect, cancelRide);

module.exports = router;
