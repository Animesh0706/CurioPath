const catchAsync = require("../utils/catchAsync");
const authService = require("../services/authService");
const { verifyRefreshToken } = require("../utils/tokenUtils");
const { generateAccessToken } = require("../utils/tokenUtils");
const AppError = require("../utils/AppError");
const env = require("../config/env");

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.register({
    name,
    email,
    password,
  });

  // Set refresh token as HttpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json({
    status: "success",
    data: { user, accessToken },
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Login an existing user
 * @access  Public
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login({
    email,
    password,
  });

  // Set refresh token as HttpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: "success",
    data: { user, accessToken },
  });
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh the access token using the refresh token cookie
 * @access  Public (requires valid refresh token cookie)
 */
const refresh = catchAsync(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new AppError("No refresh token provided.", 401);
  }

  try {
    const decoded = verifyRefreshToken(token);
    const newAccessToken = generateAccessToken({ userId: decoded.userId });

    res.status(200).json({
      status: "success",
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    throw new AppError("Invalid or expired refresh token.", 401);
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Clear the refresh token cookie
 * @access  Public
 */
const logout = catchAsync(async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
const getMe = catchAsync(async (req, res) => {
  const user = await authService.getProfile(req.user.id);

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

module.exports = { register, login, refresh, logout, getMe };
