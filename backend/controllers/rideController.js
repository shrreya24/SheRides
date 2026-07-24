const Ride = require('../models/Ride');
const User = require('../models/User');

// @desc    Create / Offer a ride
// @route   POST /api/rides
// @access  Private
const createRide = async (req, res) => {
  try {
    const { from, to, date, time, seats, price, vehicle, notes, fromCoords, toCoords } = req.body;

    const ride = await Ride.create({
      driver: req.user._id,
      from,
      to,
      date,
      time,
      seats,
      price,
      vehicle,
      notes,
      fromCoords: fromCoords || {},
      toCoords: toCoords || {},
    });

    await ride.populate('driver', 'name profilePhoto rating ridesCount status isVerified');

    res.status(201).json({ success: true, ride });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all available rides (with optional filters + pagination)
// @route   GET /api/rides
// @access  Public
const getRides = async (req, res) => {
  try {
    const { from, to, date, page = 1, limit = 10 } = req.query;

    const query = { status: { $in: ['scheduled', 'active'] }, seatsLeft: { $gt: 0 } };

    if (from) query.from = { $regex: from, $options: 'i' };
    if (to) query.to = { $regex: to, $options: 'i' };
    if (date) query.date = date;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Ride.countDocuments(query);

    const rides = await Ride.find(query)
      .populate('driver', 'name profilePhoto rating ridesCount status isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: rides.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      rides,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single ride by ID
// @route   GET /api/rides/:id
// @access  Public
const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('driver', 'name profilePhoto rating ridesCount status isVerified phone')
      .populate('passengers.user', 'name profilePhoto rating');

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found.' });
    }

    res.json({ success: true, ride });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get my rides (offered + booked)
// @route   GET /api/rides/my-rides
// @access  Private
const getMyRides = async (req, res) => {
  try {
    const offeredRides = await Ride.find({ driver: req.user._id })
      .populate('passengers.user', 'name profilePhoto rating')
      .sort({ createdAt: -1 });

    const bookedRides = await Ride.find({
      'passengers.user': req.user._id,
      'passengers.status': 'accepted',
    })
      .populate('driver', 'name profilePhoto rating ridesCount status isVerified')
      .sort({ createdAt: -1 });

    res.json({ success: true, offeredRides, bookedRides });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Request to join a ride
// @route   POST /api/rides/:id/request
// @access  Private
const requestRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found.' });
    }

    if (ride.driver.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot request your own ride.' });
    }

    if (ride.seatsLeft <= 0) {
      return res.status(400).json({ success: false, message: 'No seats available.' });
    }

    const alreadyRequested = ride.passengers.find(
      (p) => p.user.toString() === req.user._id.toString()
    );
    if (alreadyRequested) {
      return res.status(400).json({ success: false, message: 'You have already requested this ride.' });
    }

    ride.passengers.push({ user: req.user._id, message: req.body.message || '' });
    await ride.save();

    await ride.populate('driver', 'name profilePhoto');
    await ride.populate('passengers.user', 'name profilePhoto rating');

    res.json({ success: true, message: 'Request sent successfully!', ride });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Accept or reject a passenger request
// @route   PUT /api/rides/:id/request/:passengerId
// @access  Private (driver only)
const handleRequest = async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found.' });
    }

    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the driver can manage requests.' });
    }

    const passenger = ride.passengers.find(
      (p) => p.user.toString() === req.params.passengerId
    );
    if (!passenger) {
      return res.status(404).json({ success: false, message: 'Passenger request not found.' });
    }

    if (action === 'accept') {
      if (ride.seatsLeft <= 0) {
        return res.status(400).json({ success: false, message: 'No seats available.' });
      }
      passenger.status = 'accepted';
      ride.seatsLeft -= 1;
    } else if (action === 'reject') {
      passenger.status = 'rejected';
    } else {
      return res.status(400).json({ success: false, message: 'Action must be accept or reject.' });
    }

    await ride.save();
    await ride.populate('passengers.user', 'name profilePhoto rating');

    // Emit socket notification to the passenger
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${req.params.passengerId}`).emit('request-update', {
        rideId: ride._id,
        from: ride.from,
        to: ride.to,
        status: action === 'accept' ? 'accepted' : 'rejected',
      });
    }

    res.json({ success: true, message: `Request ${action}ed.`, ride });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Cancel my own ride request (passenger)
// @route   DELETE /api/rides/:id/request
// @access  Private
const cancelRequest = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found.' });
    }

    const passengerIndex = ride.passengers.findIndex(
      (p) => p.user.toString() === req.user._id.toString()
    );

    if (passengerIndex === -1) {
      return res.status(404).json({ success: false, message: 'No request found for this ride.' });
    }

    const wasAccepted = ride.passengers[passengerIndex].status === 'accepted';

    ride.passengers.splice(passengerIndex, 1);

    // Free up the seat if they were already accepted
    if (wasAccepted) {
      ride.seatsLeft = Math.min(ride.seatsLeft + 1, ride.seats);
    }

    await ride.save();

    res.json({ success: true, message: 'Request cancelled.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Start a ride (driver starts ride, activates live tracking)
// @route   PUT /api/rides/:id/start
// @access  Private (driver only)
const startRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found.' });
    }

    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the driver can start the ride.' });
    }

    ride.status = 'active';
    await ride.save();

    res.json({ success: true, message: 'Ride started! Live tracking is now active.', ride });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Complete a ride
// @route   PUT /api/rides/:id/complete
// @access  Private (driver only)
const completeRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate('passengers.user');

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found.' });
    }

    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the driver can complete the ride.' });
    }

    ride.status = 'completed';
    await ride.save();

    // Increment driver's rides count and update status badge
    const driverUser = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { ridesCount: 1 } },
      { new: true }
    );
    driverUser.updateStatus();
    await driverUser.save();

    // Increment ridesCount for each accepted passenger and update their status badge
    const acceptedPassengerIds = ride.passengers
      .filter((p) => p.status === 'accepted')
      .map((p) => p.user._id || p.user);

    for (const passengerId of acceptedPassengerIds) {
      const passengerUser = await User.findByIdAndUpdate(
        passengerId,
        { $inc: { ridesCount: 1 } },
        { new: true }
      );
      passengerUser.updateStatus();
      await passengerUser.save();
    }

    res.json({ success: true, message: 'Ride completed!', ride });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Cancel a ride
// @route   PUT /api/rides/:id/cancel
// @access  Private (driver only)
const cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found.' });
    }

    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the driver can cancel the ride.' });
    }

    ride.status = 'cancelled';
    await ride.save();

    res.json({ success: true, message: 'Ride cancelled.', ride });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get incoming requests for driver
// @route   GET /api/rides/requests/incoming
// @access  Private
const getIncomingRequests = async (req, res) => {
  try {
    const rides = await Ride.find({
      driver: req.user._id,
      'passengers.status': 'pending',
    }).populate('passengers.user', 'name profilePhoto rating ridesCount status isVerified');

    // Flatten into a list of request objects
    const requests = [];
    rides.forEach((ride) => {
      ride.passengers.forEach((p) => {
        if (p.status === 'pending') {
          requests.push({
            rideId: ride._id,
            from: ride.from,
            to: ride.to,
            date: ride.date,
            time: ride.time,
            passenger: p.user,
            message: p.message,
            requestedAt: p.requestedAt,
            passengerId: p.user._id,
          });
        }
      });
    });

    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get my outgoing requests
// @route   GET /api/rides/requests/mine
// @access  Private
const getMyRequests = async (req, res) => {
  try {
    const rides = await Ride.find({ 'passengers.user': req.user._id })
      .populate('driver', 'name profilePhoto rating ridesCount status isVerified')
      .sort({ createdAt: -1 });

    const requests = rides.map((ride) => {
      const myPassenger = ride.passengers.find(
        (p) => p.user.toString() === req.user._id.toString()
      );
      return {
        rideId: ride._id,
        from: ride.from,
        to: ride.to,
        date: ride.date,
        time: ride.time,
        driver: ride.driver,
        status: myPassenger ? myPassenger.status : 'pending',
        requestedAt: myPassenger ? myPassenger.requestedAt : null,
        rideStatus: ride.status,
      };
    });

    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
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
};
