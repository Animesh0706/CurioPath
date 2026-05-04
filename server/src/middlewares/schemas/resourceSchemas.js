const { z } = require("zod");

const RESOURCE_TYPES = ["VIDEO", "ARTICLE", "COURSE"];

const createResourceSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be at most 200 characters")
    .trim(),
  url: z.string().url("Must be a valid URL"),
  type: z.enum(RESOURCE_TYPES, {
    errorMap: () => ({
      message: `Type must be one of: ${RESOURCE_TYPES.join(", ")}`,
    }),
  }),
  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters")
    .optional(),
});

const updateResourceSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be at most 200 characters")
    .trim()
    .optional(),
  url: z.string().url("Must be a valid URL").optional(),
  type: z
    .enum(RESOURCE_TYPES, {
      errorMap: () => ({
        message: `Type must be one of: ${RESOURCE_TYPES.join(", ")}`,
      }),
    })
    .optional(),
  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters")
    .optional(),
});

module.exports = { createResourceSchema, updateResourceSchema };
