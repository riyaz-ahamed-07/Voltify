const express = require('express');
const router = express.Router();
const { saveProfile, saveBill, saveAppliances, validate } = require('../controllers/onboardingController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.post('/profile',    saveProfile);
router.post('/bill',       saveBill);
router.post('/appliances', saveAppliances);
router.post('/validate',   validate);

module.exports = router;
