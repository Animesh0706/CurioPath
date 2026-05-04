const { z } = require("zod");

const createTagSchema = z.object({
  name: z
    .string()
    .min(1, "Tag name is required")
    .max(50, "Tag name must be at most 50 characters")
    .trim()
    .toLowerCase(),
});

const attachTagsSchema = z.object({
  tags: z
    .array(
      z
        .string()
        .min(1, "Tag name is required")
        .max(50, "Tag name must be at most 50 characters")
        .trim()
        .toLowerCase()
    )
    .min(1, "Must provide at least one tag")
    .max(10, "Cannot attach more than 10 tags at once"),
});

module.exports = { createTagSchema, attachTagsSchema };
