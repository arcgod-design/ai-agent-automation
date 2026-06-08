// backend/src/controllers/insights.controller.js
const { getWorkflowInsights, getGlobalInsights } = require("../services/insightsService");

/**
 * GET /api/insights/workflows/:workflowId
 * Returns computed insights for a single workflow.
 */
async function getWorkflowInsightsHandler(req, res) {
  try {
    const { workflowId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 200;

    const insights = await getWorkflowInsights(workflowId, limit);
    return res.json(insights);
  } catch (err) {
    console.error("[InsightsController] getWorkflowInsights error:", err);
    return res.status(500).json({ error: "Failed to compute workflow insights." });
  }
}

/**
 * GET /api/insights/summary
 * Returns aggregated insights across all workflows for the authenticated user.
 */
async function getGlobalInsightsHandler(req, res) {
  try {
    const userId = req.user._id || req.user.id;
    const limit = parseInt(req.query.limit, 10) || 200;

    const insights = await getGlobalInsights(userId.toString(), limit);
    return res.json(insights);
  } catch (err) {
    console.error("[InsightsController] getGlobalInsights error:", err);
    return res.status(500).json({ error: "Failed to compute global insights." });
  }
}

module.exports = {
  getWorkflowInsightsHandler,
  getGlobalInsightsHandler,
};
