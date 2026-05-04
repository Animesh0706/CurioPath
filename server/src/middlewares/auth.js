const { verifyAccessToken } = require("../utils/tokenUtils");
const AppError = require("../utils/AppError");
const prisma = require("../config/db");

/**
 * Protect middleware — verifies the JWT access token from the
 * Authorization header and attaches the user to req.user.
 */
const protect = async (req, res, next) => {
  try {
    // 1. Extract token from the Authorization header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("Not authorized. Please log in.", 401));
    }

    // 2. Verify the token
    const decoded = verifyAccessToken(token);

    // 3. Check if the user still exists in the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      return next(
        new AppError("The user belonging to this token no longer exists.", 401)
      );
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expired. Please refresh.", 401));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token.", 401));
    }
    return next(new AppError("Authentication failed.", 401));
  }
};

/**
 * Restrict access to specific roles.
 * Usage: restrictTo("ADMIN")
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }
    next();
  };
};

module.exports = { protect, restrictTo };
