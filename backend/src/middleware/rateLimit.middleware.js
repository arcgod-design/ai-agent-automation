const rateLimit = require("express-rate-limit");

// Standard rate limit exceeded JSON handler
const limitHandler = (req, res, next, options) => {
  res.status(options.statusCode).json({
    error: "rate_limit_exceeded",
    message: options.message,
  });
};

// 1. Global Limiter (applied globally to all /api routes)
const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 mins default
  max: Number(process.env.RATE_LIMIT_GLOBAL_MAX) || 100,
  message: "Too many requests. Please try again later.",
  handler: limitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. Auth Limiter (applied to registration & login endpoints)
const authLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 mins default
  max: Number(process.env.RATE_LIMIT_AUTH_MAX) || 5,
  message: "Too many authentication attempts. Please try again after 15 minutes.",
  handler: limitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. Expensive Resource Limiter (applied to AI generation, workflow runs, uploads)
const expensiveLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: Number(process.env.RATE_LIMIT_EXPENSIVE_MAX) || 10,
  message: "Rate limit exceeded for expensive operations. Please slow down.",
  handler: limitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  globalLimiter,
  authLimiter,
  expensiveLimiter,
};
