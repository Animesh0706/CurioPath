const catchAsync = require("../utils/catchAsync");
const progressService = require("../services/progressService");

/**
 * @route   POST /api/progress
 * @desc    Update progress for a resource (creates or updates)
 * @access  Private
 */
const updateProgress = catchAsync(async (req, res) => {
  const { resourceId, status } = req.body;
  const progress = await progressService.updateProgress(
    req.user.id,
    resourceId,
    status
  );

  res.status(200).json({ status: "success", data: { progress } });
});

/**
 * @route   GET /api/progress
 * @desc    Get all progress records for the logged-in user
 * @access  Private
 */
const getUserProgress = catchAsync(async (req, res) => {
  const progress = await progressService.getUserProgress(req.user.id);
  res.status(200).json({ status: "success", data: { progress } });
});

/**
 * @route   GET /api/progress/path/:pathId
 * @desc    Get progress for a specific learning path
 * @access  Private
 */
const getPathProgress = catchAsync(async (req, res) => {
  const result = await progressService.getPathProgress(
    req.user.id,
    req.params.pathId
  );
  res.status(200).json({ status: "success", data: result });
});

module.exports = { updateProgress, getUserProgress, getPathProgress };
