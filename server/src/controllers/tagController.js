const catchAsync = require("../utils/catchAsync");
const tagService = require("../services/tagService");

/**
 * @route   POST /api/tags
 * @desc    Create a new tag
 * @access  Private
 */
const createTag = catchAsync(async (req, res) => {
  const tag = await tagService.createTag(req.body.name);
  res.status(201).json({ status: "success", data: { tag } });
});

/**
 * @route   GET /api/tags
 * @desc    Get all tags with resource count
 * @access  Public
 */
const getAllTags = catchAsync(async (req, res) => {
  const tags = await tagService.getAllTags();
  res.status(200).json({ status: "success", data: { tags } });
});

/**
 * @route   DELETE /api/tags/:id
 * @desc    Delete a tag
 * @access  Private (admin)
 */
const deleteTag = catchAsync(async (req, res) => {
  const result = await tagService.deleteTag(req.params.id);
  res.status(200).json({ status: "success", data: result });
});

/**
 * @route   POST /api/resources/:resourceId/tags
 * @desc    Attach tags to a resource
 * @access  Private (resource owner)
 */
const attachTags = catchAsync(async (req, res) => {
  const resource = await tagService.attachTagsToResource(
    req.params.resourceId,
    req.body.tags,
    req.user.id
  );
  res.status(200).json({ status: "success", data: { resource } });
});

/**
 * @route   DELETE /api/resources/:resourceId/tags/:tagId
 * @desc    Detach a tag from a resource
 * @access  Private (resource owner)
 */
const detachTag = catchAsync(async (req, res) => {
  const result = await tagService.detachTagFromResource(
    req.params.resourceId,
    req.params.tagId,
    req.user.id
  );
  res.status(200).json({ status: "success", data: result });
});

module.exports = { createTag, getAllTags, deleteTag, attachTags, detachTag };
