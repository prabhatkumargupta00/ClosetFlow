const mongoose = require("mongoose");
const { Schema } = mongoose;

const rentalSchema = new Schema(
    {
        listing: {
            type: Schema.Types.ObjectId,
            ref: "Listing",
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        rentalPeriod: {
            start: {
                type: Date,
                required: true,
            },
            end: {
                type: Date,
                required: true,
            },
        },
        status: {
            type: String,
            enum: ["rented", "completed"],
            default: "rented",
        },
        price: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Rental", rentalSchema);
