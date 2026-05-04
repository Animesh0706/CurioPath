const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const env = require("./config/env");
const errorHandler = require("./middlewares/errorHandler");
const AppError = require("./utils/AppError");

// Import routes
const authRoutes = require("./routes/authRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const learningPathRoutes = require("./routes/learningPathRoutes");
const tagRoutes = require("./routes/tagRoutes");
const progressRoutes = require("./routes/progressRoutes");

// Import tag controller for resource-tag sub-routes
const tagController = require("./controllers/tagController");
const validate = require("./middlewares/validate");
const { attachTagsSchema } = require("./middlewares/schemas/tagSchemas");
const { protect } = require("./middlewares/auth");

const app = express();

// ─── Security Middleware ──────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true, // Allow cookies (refresh tokens)
  })
);

// ─── Rate Limiting ────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: {
    status: "fail",
    message: "Too many requests, please try again later.",
  },
});
app.use("/api", limiter);

// ─── Body Parsing ─────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Health Check ─────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "CurioPath API is running",
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/paths", learningPathRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/progress", progressRoutes);

// ─── Resource Tag Sub-Routes ──────────────────────────────
app.post("/api/resources/:resourceId/tags", protect, validate(attachTagsSchema), tagController.attachTags);
app.delete("/api/resources/:resourceId/tags/:tagId", protect, tagController.detachTag);

// ─── 404 Handler ──────────────────────────────────────────
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server.`, 404));
});

// ─── Centralized Error Handler ────────────────────────────
app.use(errorHandler);

module.exports = app;
