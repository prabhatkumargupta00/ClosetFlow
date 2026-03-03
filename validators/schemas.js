const Joi = require("joi");
const ExpressError = require("../utils/expressError");

// ─── Listing Schema ──────────────────────────────────────────────
const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().trim().min(3).max(100).required()
            .messages({ "string.min": "Title must be at least 3 characters" }),

        description: Joi.string().trim().min(10).max(200).required()
            .messages({
                "string.min": "Description must be at least 10 characters",
                "string.max": "Description cannot exceed 200 characters",
            }),

        pricePerDay: Joi.number().min(0).required()
            .messages({ "number.min": "Price cannot be negative" }),

        location: Joi.string().trim().required(),

        brand: Joi.string().trim().max(60).allow("", null),

        color: Joi.string().trim().max(30).allow("", null),

        category: Joi.string()
            .valid("Lehenga", "Kurta Pajama", "Sherwani", "Anarkali", "Suit", "Bandhgala")
            .required(),

        occasion: Joi.string()
            .valid("Wedding", "Reception", "Festive", "Corporate", "Formal")
            .required(),

        size: Joi.array()
            .items(Joi.string().valid("S", "M", "L", "XL"))
            .min(1)
            .required()
            .messages({ "array.min": "At least one size must be selected" }),

        fitType: Joi.string()
            .valid("Slim", "Regular", "Relaxed")
            .default("Regular"),

        rentalStatus: Joi.string()
            .valid("available", "rented")
            .default("available"),

        rating: Joi.number().min(0).max(5),
    }).required(),
});

// ─── User Register Schema ────────────────────────────────────────
const registerSchema = Joi.object({
    username: Joi.string().trim().min(3).max(30).required()
        .messages({
            "string.min": "Username must be at least 3 characters",
            "string.max": "Username cannot exceed 30 characters",
        }),

    email: Joi.string().trim().lowercase().email().required()
        .messages({ "string.email": "Please enter a valid email address" }),

    password: Joi.string().min(8).max(50).required()
        .messages({
            "string.min": "Password must be at least 8 characters",
            "string.max": "Password cannot exceed 50 characters",
        }),
});

// ─── User Login Schema ──────────────────────────────────────────
const loginSchema = Joi.object({
    email: Joi.string().trim().required()
        .messages({ "any.required": "Email is required" }),

    password: Joi.string().required()
        .messages({ "any.required": "Password is required" }),
});

// ─── Rental Schema ───────────────────────────────────────────────
const rentalSchema = Joi.object({
    start: Joi.date().required()
        .messages({
            "any.required": "Start date is required",
            "date.base": "Start date must be a valid date"
        }),

    end: Joi.date().required().greater(Joi.ref("start"))
        .messages({
            "date.greater": "End date must be after start date",
            "any.required": "End date is required",
            "date.base": "End date must be a valid date"
        }),
});

// ─── Reusable validate middleware factory ─────────────────────────
/**
 * Returns an Express middleware that validates req.body against
 * the given Joi schema. On failure it throws an ExpressError
 * with a 400 status and the first error message.
 */
const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const msg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(msg, 400);
    }
    next();
};

module.exports = {
    listingSchema,
    registerSchema,
    loginSchema,
    rentalSchema,
    validate,
};
