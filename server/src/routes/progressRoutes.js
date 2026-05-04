const express = require("express");
const router = express.Router();
const progressController = require("../controllers/progressController");
const validate = require("../middlewares/validate");
const {
  updateProgressSchema,
} = require("../middlewares/schemas/progressSchemas");
const { protect } = require("../middlewares/auth");

// All progress routes are protected
router.use(protect);

router.post("/", validate(updateProgressSchema), progressController.updateProgress);
router.get("/", progressController.getUserProgress);
router.get("/path/:pathId", progressController.getPathProgress);

module.exports = router;
