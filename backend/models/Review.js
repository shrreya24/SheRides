const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        ride: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ride',
            required: true,
        },
        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        reviewee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            default: '',
            maxlength: [300, 'Comment cannot exceed 300 characters'],
        },
    },
    { timestamps: true }
);

// Prevent duplicate reviews for the same ride+reviewer combination
reviewSchema.index({ ride: 1, reviewer: 1 }, { unique: true });

// After saving a review, recalculate the reviewee's average rating
reviewSchema.post('save', async function () {
    const User = mongoose.model('User');
    const Review = mongoose.model('Review');

    const reviews = await Review.find({ reviewee: this.reviewee });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await User.findByIdAndUpdate(this.reviewee, {
        rating: Math.round(avg * 10) / 10,
    });
});

module.exports = mongoose.model('Review', reviewSchema);
