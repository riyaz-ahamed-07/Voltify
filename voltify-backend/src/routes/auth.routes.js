const express = require('express');
const router = express.Router();
const { signup, login, me, verifyOTP, resendOTP, forgotPassword, oauthCallback } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

// Public routes (no token needed)
router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);

// OAuth callback route — frontend posts { name, email } after Google OAuth
router.post('/oauth/google', oauthCallback);

// Protected routes (token required)
router.get('/me', requireAuth, me);

module.exports = router;
