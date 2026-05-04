const prisma = require("../config/db");
const AppError = require("../utils/AppError");

/**
 * Create a new tag.
 */
const createTag = async (name) => {
  // Check if tag already exists
  const existing = await prisma.tag.findUnique({ where: { name } });
  if (existing) {
    throw new AppError("A tag with this name already exists.", 409);
  }

  const tag = await prisma.tag.create({ data: { name } });
  return tag;
};

/**
 * Get all tags.
 */
const getAllTags = async () => {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { resources: true } },
    },
  });

  return tags;
};

/**
 * Delete a tag by ID.
 */
const deleteTag = async (id) => {
  const tag = await prisma.tag.findUnique({ where: { id } });
  if (!tag) {
    throw new AppError("Tag not found.", 404);
  }

  await prisma.tag.delete({ where: { id } });
  return { message: "Tag deleted successfully." };
};

/**
 * Attach tags to a resource.
 * Accepts an array of tag names. Creates tags that don't exist.
 */
const attachTagsToResource = async (resourceId, tagNames, userId) => {
  // Verify the resource exists and belongs to the user
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
  });
  if (!resource) throw new AppError("Resource not found.", 404);
  if (resource.authorId !== userId)
    throw new AppError("You can only tag your own resources.", 403);

  // Upsert each tag and create the junction records
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });

    // Create junction record if it doesn't exist
    await prisma.resourceTag.upsert({
      where: {
        resourceId_tagId: { resourceId, tagId: tag.id },
      },
      update: {},
      create: { resourceId, tagId: tag.id },
    });
  }

  // Return the resource with its updated tags
  const updated = await prisma.resource.findUnique({
    where: { id: resourceId },
    include: { tags: { include: { tag: true } } },
  });

  return updated;
};

/**
 * Detach a tag from a resource.
 */
const detachTagFromResource = async (resourceId, tagId, userId) => {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
  });
  if (!resource) throw new AppError("Resource not found.", 404);
  if (resource.authorId !== userId)
    throw new AppError("You can only modify tags on your own resources.", 403);

  const resourceTag = await prisma.resourceTag.findUnique({
    where: { resourceId_tagId: { resourceId, tagId } },
  });
  if (!resourceTag)
    throw new AppError("This tag is not attached to the resource.", 404);

  await prisma.resourceTag.delete({
    where: { resourceId_tagId: { resourceId, tagId } },
  });

  return { message: "Tag removed from resource." };
};

module.exports = {
  createTag,
  getAllTags,
  deleteTag,
  attachTagsToResource,
  detachTagFromResource,
};
