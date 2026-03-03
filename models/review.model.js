const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema(
    {
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        listing: {
            type: Schema.Types.ObjectId,
            ref: "Listing",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// One review per user per listing
reviewSchema.index({ user: 1, listing: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
