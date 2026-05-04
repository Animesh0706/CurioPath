const { z } = require("zod");

const updateProgressSchema = z.object({
  resourceId: z.string().uuid("Invalid resource ID"),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"], {
    errorMap: () => ({
      message: "Status must be one of: TODO, IN_PROGRESS, COMPLETED",
    }),
  }),
});

module.exports = { updateProgressSchema };
