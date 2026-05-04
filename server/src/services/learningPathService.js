const prisma = require("../config/db");
const AppError = require("../utils/AppError");

/**
 * Create a new learning path.
 */
const createPath = async ({ title, description, creatorId }) => {
  const path = await prisma.learningPath.create({
    data: { title, description, creatorId },
    include: {
      creator: { select: { id: true, name: true } },
      resources: {
        include: { resource: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  return path;
};

/**
 * Get all learning paths with pagination.
 */
const getAllPaths = async ({ page = 1, limit = 10, search }) => {
  const skip = (page - 1) * limit;

  const where = {};
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  const [paths, total] = await Promise.all([
    prisma.learningPath.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        creator: { select: { id: true, name: true } },
        resources: {
          include: {
            resource: {
              select: { id: true, title: true, type: true, url: true },
            },
          },
          orderBy: { orderIndex: "asc" },
        },
      },
    }),
    prisma.learningPath.count({ where }),
  ]);

  return {
    paths,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single learning path by ID.
 */
const getPathById = async (id) => {
  const path = await prisma.learningPath.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      resources: {
        include: {
          resource: {
            include: {
              tags: { include: { tag: true } },
            },
          },
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!path) {
    throw new AppError("Learning path not found.", 404);
  }

  return path;
};

/**
 * Update a learning path. Only the creator can update.
 */
const updatePath = async (id, userId, data) => {
  const path = await prisma.learningPath.findUnique({ where: { id } });

  if (!path) {
    throw new AppError("Learning path not found.", 404);
  }

  if (path.creatorId !== userId) {
    throw new AppError("You can only update your own learning paths.", 403);
  }

  const updated = await prisma.learningPath.update({
    where: { id },
    data,
    include: {
      creator: { select: { id: true, name: true } },
      resources: {
        include: { resource: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  return updated;
};

/**
 * Delete a learning path. Only the creator can delete.
 */
const deletePath = async (id, userId) => {
  const path = await prisma.learningPath.findUnique({ where: { id } });

  if (!path) {
    throw new AppError("Learning path not found.", 404);
  }

  if (path.creatorId !== userId) {
    throw new AppError("You can only delete your own learning paths.", 403);
  }

  await prisma.learningPath.delete({ where: { id } });

  return { message: "Learning path deleted successfully." };
};

/**
 * Add a resource to a learning path.
 * Automatically assigns the next order index.
 */
const addResourceToPath = async (pathId, resourceId, userId) => {
  // Verify path ownership
  const path = await prisma.learningPath.findUnique({ where: { id: pathId } });
  if (!path) throw new AppError("Learning path not found.", 404);
  if (path.creatorId !== userId)
    throw new AppError("You can only modify your own learning paths.", 403);

  // Verify resource exists
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
  });
  if (!resource) throw new AppError("Resource not found.", 404);

  // Check if resource is already in this path
  const existing = await prisma.pathResource.findUnique({
    where: { pathId_resourceId: { pathId, resourceId } },
  });
  if (existing)
    throw new AppError("Resource is already in this learning path.", 409);

  // Get the current highest order index
  const lastItem = await prisma.pathResource.findFirst({
    where: { pathId },
    orderBy: { orderIndex: "desc" },
  });
  const nextOrder = lastItem ? lastItem.orderIndex + 1 : 0;

  const pathResource = await prisma.pathResource.create({
    data: { pathId, resourceId, orderIndex: nextOrder },
    include: { resource: true },
  });

  return pathResource;
};

/**
 * Remove a resource from a learning path.
 */
const removeResourceFromPath = async (pathId, resourceId, userId) => {
  const path = await prisma.learningPath.findUnique({ where: { id: pathId } });
  if (!path) throw new AppError("Learning path not found.", 404);
  if (path.creatorId !== userId)
    throw new AppError("You can only modify your own learning paths.", 403);

  const pathResource = await prisma.pathResource.findUnique({
    where: { pathId_resourceId: { pathId, resourceId } },
  });
  if (!pathResource)
    throw new AppError("Resource is not in this learning path.", 404);

  await prisma.pathResource.delete({
    where: { id: pathResource.id },
  });

  return { message: "Resource removed from learning path." };
};

/**
 * Reorder resources in a learning path.
 * Expects an array of { resourceId, orderIndex } pairs.
 */
const reorderResources = async (pathId, userId, orderedItems) => {
  const path = await prisma.learningPath.findUnique({ where: { id: pathId } });
  if (!path) throw new AppError("Learning path not found.", 404);
  if (path.creatorId !== userId)
    throw new AppError("You can only modify your own learning paths.", 403);

  // Use a transaction to update all order indexes atomically
  const updates = orderedItems.map((item) =>
    prisma.pathResource.update({
      where: {
        pathId_resourceId: { pathId, resourceId: item.resourceId },
      },
      data: { orderIndex: item.orderIndex },
    })
  );

  await prisma.$transaction(updates);

  // Return the updated path
  return getPathById(pathId);
};

module.exports = {
  createPath,
  getAllPaths,
  getPathById,
  updatePath,
  deletePath,
  addResourceToPath,
  removeResourceFromPath,
  reorderResources,
};
