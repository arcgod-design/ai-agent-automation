const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const {
  getDashboardStats,
  getExecutionTrend,
  getLiveWorkflowStatus,
} = require('../controllers/dashboard.controller');

router.use(auth);
router.get('/stats', getDashboardStats);
router.get('/execution-trend', getExecutionTrend);
router.get('/live-status', getLiveWorkflowStatus);

module.exports = router;
