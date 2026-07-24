const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams so :id from parent is available
const { createReview, getRideReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/', getRideReviews);

module.exports = router;
