const catchAsync = require("../utils/catchAsync");
const learningPathService = require("../services/learningPathService");

/**
 * @route   POST /api/paths
 * @desc    Create a new learning path
 * @access  Private
 */
const createPath = catchAsync(async (req, res) => {
  const { title, description } = req.body;
  const path = await learningPathService.createPath({
    title,
    description,
    creatorId: req.user.id,
  });

  res.status(201).json({ status: "success", data: { path } });
});

/**
 * @route   GET /api/paths
 * @desc    Get all learning paths (with pagination, search)
 * @access  Public
 */
const getAllPaths = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || undefined;

  const result = await learningPathService.getAllPaths({ page, limit, search });
  res.status(200).json({ status: "success", data: result });
});

/**
 * @route   GET /api/paths/:id
 * @desc    Get a single learning path with its resources
 * @access  Public
 */
const getPathById = catchAsync(async (req, res) => {
  const path = await learningPathService.getPathById(req.params.id);
  res.status(200).json({ status: "success", data: { path } });
});

/**
 * @route   PUT /api/paths/:id
 * @desc    Update a learning path
 * @access  Private (creator only)
 */
const updatePath = catchAsync(async (req, res) => {
  const path = await learningPathService.updatePath(
    req.params.id,
    req.user.id,
    req.body
  );
  res.status(200).json({ status: "success", data: { path } });
});

/**
 * @route   DELETE /api/paths/:id
 * @desc    Delete a learning path
 * @access  Private (creator only)
 */
const deletePath = catchAsync(async (req, res) => {
  const result = await learningPathService.deletePath(
    req.params.id,
    req.user.id
  );
  res.status(200).json({ status: "success", data: result });
});

/**
 * @route   POST /api/paths/:id/resources
 * @desc    Add a resource to a learning path
 * @access  Private (creator only)
 */
const addResource = catchAsync(async (req, res) => {
  const { resourceId } = req.body;
  const pathResource = await learningPathService.addResourceToPath(
    req.params.id,
    resourceId,
    req.user.id
  );
  res.status(201).json({ status: "success", data: { pathResource } });
});

/**
 * @route   DELETE /api/paths/:id/resources/:resourceId
 * @desc    Remove a resource from a learning path
 * @access  Private (creator only)
 */
const removeResource = catchAsync(async (req, res) => {
  const result = await learningPathService.removeResourceFromPath(
    req.params.id,
    req.params.resourceId,
    req.user.id
  );
  res.status(200).json({ status: "success", data: result });
});

/**
 * @route   PUT /api/paths/:id/reorder
 * @desc    Reorder resources in a learning path
 * @access  Private (creator only)
 */
const reorderResources = catchAsync(async (req, res) => {
  const { orderedItems } = req.body;
  const path = await learningPathService.reorderResources(
    req.params.id,
    req.user.id,
    orderedItems
  );
  res.status(200).json({ status: "success", data: { path } });
});

module.exports = {
  createPath,
  getAllPaths,
  getPathById,
  updatePath,
  deletePath,
  addResource,
  removeResource,
  reorderResources,
};
