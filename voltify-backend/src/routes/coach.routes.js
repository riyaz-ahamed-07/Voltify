const express = require('express');
const router = express.Router();
const {
  getPredictions,
  getActualVsPredicted,
  getAlerts,
  getCSSRecommendations,
  applyCSSRecommendation,
  whatIf,
} = require('../controllers/coachController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/predictions',         getPredictions);
router.get('/actual-vs-predicted', getActualVsPredicted);
router.get('/alerts',              getAlerts);
router.get('/css-recommendations', getCSSRecommendations);
router.post('/css-apply',          applyCSSRecommendation);
router.get('/whatif',              whatIf);

module.exports = router;
