import rateLimit from 'express-rate-limit'

// General API limiter — 100 requests / 15 min per IP
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: "Too many requests. Please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
})

// Strict limiter for auth (login/register) — 5 attempts / 15 min
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: "Too many login attempts. Please try again after 15 minutes."
    },
    skipSuccessfulRequests: true,
})

// Payment limiter — 10 attempts / 15 min
export const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: "Too many payment attempts. Please try again later."
    },
})