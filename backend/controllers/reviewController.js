const Review = require('../models/Review');
const Ride = require('../models/Ride');

// @desc    Submit a review after a completed ride
// @route   POST /api/rides/:id/review
// @access  Private
const createReview = async (req, res) => {
    try {
        const { rating, comment, revieweeId } = req.body;
        const ride = await Ride.findById(req.params.id).populate('passengers.user');

        if (!ride) {
            return res.status(404).json({ success: false, message: 'Ride not found.' });
        }

        if (ride.status !== 'completed') {
            return res.status(400).json({ success: false, message: 'You can only review completed rides.' });
        }

        // Check the reviewer was part of this ride (driver or accepted passenger)
        const isDriver = ride.driver.toString() === req.user._id.toString();
        const isPassenger = ride.passengers.some(
            (p) => p.user._id.toString() === req.user._id.toString() && p.status === 'accepted'
        );

        if (!isDriver && !isPassenger) {
            return res.status(403).json({ success: false, message: 'You were not part of this ride.' });
        }

        const existingReview = await Review.findOne({ ride: ride._id, reviewer: req.user._id });
        if (existingReview) {
            return res.status(400).json({ success: false, message: 'You have already submitted a review for this ride.' });
        }

        const review = await Review.create({
            ride: ride._id,
            reviewer: req.user._id,
            reviewee: revieweeId,
            rating,
            comment: comment || '',
        });

        await review.populate('reviewer', 'name profilePhoto');

        res.status(201).json({ success: true, review });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this ride.' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get all reviews for a ride
// @route   GET /api/rides/:id/reviews
// @access  Public
const getRideReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ ride: req.params.id })
            .populate('reviewer', 'name profilePhoto')
            .sort({ createdAt: -1 });

        res.json({ success: true, reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { createReview, getRideReviews };
