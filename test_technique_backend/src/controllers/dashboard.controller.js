const asyncHandler = require('../utils/asyncHandler');
const service = require('../services/dashboard.service');

// GET /api/dashboard/stats
exports.stats = asyncHandler(async (req, res) => {
  res.json(await service.getStats());
});