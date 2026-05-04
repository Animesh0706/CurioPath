const express = require("express");
const router = express.Router();
const tagController = require("../controllers/tagController");
const validate = require("../middlewares/validate");
const { createTagSchema } = require("../middlewares/schemas/tagSchemas");
const { protect } = require("../middlewares/auth");

// Public routes
router.get("/", tagController.getAllTags);

// Protected routes
router.post("/", protect, validate(createTagSchema), tagController.createTag);
router.delete("/:id", protect, tagController.deleteTag);

module.exports = router;
