const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, uploadId } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: { success: false, message: 'Too many requests. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('profilePhoto'), updateProfile);
router.put('/upload-id', protect, upload.single('governmentId'), uploadId);

module.exports = router;

