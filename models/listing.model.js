const mongoose = require("mongoose");
const { Schema } = mongoose;

const listingSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            minlength: 10,
            maxlength: 200,
        },
        image: {
            type: String,
            required: true, // ImageKit URL
        },
        imageFileId: {
            type: String, // chahiye because delete/replace image from ImageKit
            required: true,
        },
        // image: {
        //     type: String,
        //     default:
        //         "https://www.shutterstock.com/image-vector/house-logo-template-design-vector-600nw-741515455.jpg",
        //     set: (v) =>
        //         v === ""
        //             ? "https://www.shutterstock.com/image-vector/house-logo-template-design-vector-600nw-741515455.jpg"
        //             : v,
        // },
        pricePerDay: {
            type: Number,
            required: true,
            min: 0,
        },
        location: {
            type: String,
            required: true,
            trim: true,
        },
        brand: {
            type: String,
            trim: true,
            maxlength: 60,
        },
        color: {
            type: String,
            trim: true,
            maxlength: 30,
        },
        category: {
            type: String,
            required: true,
            enum: [
                "Lehenga",
                "Kurta Pajama",
                "Sherwani",
                "Anarkali",
                "Suit",
                "Bandhgala",
            ],
        },
        occasion: {
            type: String,
            required: true,
            enum: ["Wedding", "Reception", "Festive", "Corporate", "Formal"],
        },
        size: {
            type: [String],
            required: true,
            enum: ["S", "M", "L", "XL"],
        },
        fitType: {
            type: String,
            enum: ["Slim", "Regular", "Relaxed"],
            default: "Regular",
        },
        rentalStatus: {
            type: String,
            enum: ["available", "rented"],
            default: "available",
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Improves search performance for queries on title/description.
// Note: if you later switch to MongoDB $text search, this index is required.
listingSchema.index({ title: "text", description: "text" });

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
