const prisma = require("../config/db");
const AppError = require("../utils/AppError");

/**
 * Create a new resource.
 */
const createResource = async ({ title, url, type, description, authorId }) => {
  const resource = await prisma.resource.create({
    data: { title, url, type, description, authorId },
    include: { author: { select: { id: true, name: true, email: true } } },
  });

  return resource;
};

/**
 * Get all resources with optional pagination.
 */
const getAllResources = async ({ page = 1, limit = 10, type, search }) => {
  const skip = (page - 1) * limit;

  const where = {};

  // Filter by type if provided
  if (type) {
    where.type = type;
  }

  // Search by title if provided
  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  const [resources, total] = await Promise.all([
    prisma.resource.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
      },
    }),
    prisma.resource.count({ where }),
  ]);

  return {
    resources,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single resource by ID.
 */
const getResourceById = async (id) => {
  const resource = await prisma.resource.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, email: true } },
      tags: { include: { tag: true } },
    },
  });

  if (!resource) {
    throw new AppError("Resource not found.", 404);
  }

  return resource;
};

/**
 * Update a resource. Only the author can update.
 */
const updateResource = async (id, userId, data) => {
  const resource = await prisma.resource.findUnique({ where: { id } });

  if (!resource) {
    throw new AppError("Resource not found.", 404);
  }

  if (resource.authorId !== userId) {
    throw new AppError("You can only update your own resources.", 403);
  }

  const updated = await prisma.resource.update({
    where: { id },
    data,
    include: {
      author: { select: { id: true, name: true } },
      tags: { include: { tag: true } },
    },
  });

  return updated;
};

/**
 * Delete a resource. Only the author can delete.
 */
const deleteResource = async (id, userId) => {
  const resource = await prisma.resource.findUnique({ where: { id } });

  if (!resource) {
    throw new AppError("Resource not found.", 404);
  }

  if (resource.authorId !== userId) {
    throw new AppError("You can only delete your own resources.", 403);
  }

  await prisma.resource.delete({ where: { id } });

  return { message: "Resource deleted successfully." };
};

module.exports = {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource,
};
