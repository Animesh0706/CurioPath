const { z } = require("zod");

const createPathSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be at most 200 characters")
    .trim(),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(2000, "Description must be at most 2000 characters")
    .trim(),
});

const updatePathSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be at most 200 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(2000, "Description must be at most 2000 characters")
    .trim()
    .optional(),
});

const addResourceToPathSchema = z.object({
  resourceId: z.string().uuid("Invalid resource ID"),
});

const reorderResourcesSchema = z.object({
  orderedItems: z
    .array(
      z.object({
        resourceId: z.string().uuid("Invalid resource ID"),
        orderIndex: z.number().int().min(0, "Order index must be >= 0"),
      })
    )
    .min(1, "Must provide at least one item to reorder"),
});

module.exports = {
  createPathSchema,
  updatePathSchema,
  addResourceToPathSchema,
  reorderResourcesSchema,
};
