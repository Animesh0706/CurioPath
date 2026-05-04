const catchAsync = require("../utils/catchAsync");
const resourceService = require("../services/resourceService");

/**
 * @route   POST /api/resources
 * @desc    Create a new resource
 * @access  Private
 */
const createResource = catchAsync(async (req, res) => {
  const { title, url, type, description } = req.body;

  const resource = await resourceService.createResource({
    title,
    url,
    type,
    description,
    authorId: req.user.id,
  });

  res.status(201).json({
    status: "success",
    data: { resource },
  });
});

/**
 * @route   GET /api/resources
 * @desc    Get all resources (with pagination, search, filter)
 * @access  Public
 */
const getAllResources = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const type = req.query.type || undefined;
  const search = req.query.search || undefined;
  const tags = req.query.tags
    ? req.query.tags.split(",").map((t) => t.trim().toLowerCase())
    : undefined;

  const result = await resourceService.getAllResources({
    page,
    limit,
    type,
    search,
    tags,
  });

  res.status(200).json({
    status: "success",
    data: result,
  });
});

/**
 * @route   GET /api/resources/:id
 * @desc    Get a single resource
 * @access  Public
 */
const getResourceById = catchAsync(async (req, res) => {
  const resource = await resourceService.getResourceById(req.params.id);

  res.status(200).json({
    status: "success",
    data: { resource },
  });
});

/**
 * @route   PUT /api/resources/:id
 * @desc    Update a resource
 * @access  Private (owner only)
 */
const updateResource = catchAsync(async (req, res) => {
  const resource = await resourceService.updateResource(
    req.params.id,
    req.user.id,
    req.body
  );

  res.status(200).json({
    status: "success",
    data: { resource },
  });
});

/**
 * @route   DELETE /api/resources/:id
 * @desc    Delete a resource
 * @access  Private (owner only)
 */
const deleteResource = catchAsync(async (req, res) => {
  const result = await resourceService.deleteResource(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    status: "success",
    data: result,
  });
});

module.exports = {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource,
};
