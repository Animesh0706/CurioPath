const prisma = require("../config/db");
const AppError = require("../utils/AppError");

const VALID_STATUSES = ["TODO", "IN_PROGRESS", "COMPLETED"];

/**
 * Update progress status for a resource.
 * Creates the record if it doesn't exist, otherwise updates it.
 */
const updateProgress = async (userId, resourceId, status) => {
  // Verify the resource exists
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
  });
  if (!resource) throw new AppError("Resource not found.", 404);

  const progress = await prisma.userProgress.upsert({
    where: {
      userId_resourceId: { userId, resourceId },
    },
    update: { status },
    create: { userId, resourceId, status },
  });

  return progress;
};

/**
 * Get all progress records for a user.
 */
const getUserProgress = async (userId) => {
  const progress = await prisma.userProgress.findMany({
    where: { userId },
    include: {
      user: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return progress;
};

/**
 * Get progress for all resources in a specific learning path.
 * Calculates overall completion percentage.
 */
const getPathProgress = async (userId, pathId) => {
  // Verify the path exists
  const path = await prisma.learningPath.findUnique({
    where: { id: pathId },
    include: {
      resources: {
        include: { resource: { select: { id: true, title: true, type: true } } },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!path) throw new AppError("Learning path not found.", 404);

  const totalResources = path.resources.length;
  if (totalResources === 0) {
    return {
      pathId,
      pathTitle: path.title,
      totalResources: 0,
      completed: 0,
      percentage: 0,
      resources: [],
    };
  }

  // Get progress for each resource in the path
  const resourceIds = path.resources.map((pr) => pr.resourceId);
  const progressRecords = await prisma.userProgress.findMany({
    where: {
      userId,
      resourceId: { in: resourceIds },
    },
  });

  // Build a map for quick lookup
  const progressMap = {};
  progressRecords.forEach((p) => {
    progressMap[p.resourceId] = p.status;
  });

  // Assemble the result
  const resources = path.resources.map((pr) => ({
    resourceId: pr.resourceId,
    title: pr.resource.title,
    type: pr.resource.type,
    orderIndex: pr.orderIndex,
    status: progressMap[pr.resourceId] || "TODO",
  }));

  const completed = resources.filter((r) => r.status === "COMPLETED").length;
  const percentage = Math.round((completed / totalResources) * 100);

  return {
    pathId,
    pathTitle: path.title,
    totalResources,
    completed,
    percentage,
    resources,
  };
};

module.exports = { updateProgress, getUserProgress, getPathProgress };
