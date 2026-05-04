const express = require("express");
const router = express.Router();
const pathController = require("../controllers/learningPathController");
const validate = require("../middlewares/validate");
const {
  createPathSchema,
  updatePathSchema,
  addResourceToPathSchema,
  reorderResourcesSchema,
} = require("../middlewares/schemas/learningPathSchemas");
const { protect } = require("../middlewares/auth");

// Public routes
router.get("/", pathController.getAllPaths);
router.get("/:id", pathController.getPathById);

// Protected routes
router.post("/", protect, validate(createPathSchema), pathController.createPath);
router.put("/:id", protect, validate(updatePathSchema), pathController.updatePath);
router.delete("/:id", protect, pathController.deletePath);

// Resource association routes (protected)
router.post(
  "/:id/resources",
  protect,
  validate(addResourceToPathSchema),
  pathController.addResource
);
router.delete("/:id/resources/:resourceId", protect, pathController.removeResource);
router.put(
  "/:id/reorder",
  protect,
  validate(reorderResourcesSchema),
  pathController.reorderResources
);

module.exports = router;
