const express = require("express");
const router = express.Router();
const resourceController = require("../controllers/resourceController");
const validate = require("../middlewares/validate");
const {
  createResourceSchema,
  updateResourceSchema,
} = require("../middlewares/schemas/resourceSchemas");
const { protect } = require("../middlewares/auth");

// Public routes
router.get("/", resourceController.getAllResources);
router.get("/:id", resourceController.getResourceById);

// Protected routes
router.post(
  "/",
  protect,
  validate(createResourceSchema),
  resourceController.createResource
);
router.put(
  "/:id",
  protect,
  validate(updateResourceSchema),
  resourceController.updateResource
);
router.delete("/:id", protect, resourceController.deleteResource);

module.exports = router;
