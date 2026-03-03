const Review = require("../models/review.model");
const Listing = require("../models/listing.model");
const Rental = require("../models/rental.model");
const ExpressError = require("../utils/expressError");

// Helper: recalculate and save average rating on the listing
async function updateListingRating(listingId) {
    const reviews = await Review.find({ listing: listingId });
    if (reviews.length === 0) {
        await Listing.findByIdAndUpdate(listingId, { rating: 0 });
    } else {
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await Listing.findByIdAndUpdate(listingId, { rating: Math.round(avg * 10) / 10 });
    }
}

module.exports.createReview = async (req, res, next) => {
    try {
        const { id } = req.params; // listing id
        const { rating, comment } = req.body;
        const userId = req.session.userId;

        // Check the user actually completed a rental for this listing
        const validRental = await Rental.findOne({
            listing: id,
            user: userId,
            status: "completed",
        });

        if (!validRental) {
            throw new ExpressError("You can only review outfits you have rented and returned.", 403);
        }

        // Check if already reviewed
        const existingReview = await Review.findOne({ listing: id, user: userId });
        if (existingReview) {
            throw new ExpressError("You have already reviewed this listing.", 400);
        }

        await Review.create({
            rating: Number(rating),
            comment,
            user: userId,
            listing: id,
        });

        await updateListingRating(id);

        res.redirect(`/listings/${id}`);
    } catch (err) {
        // Handle duplicate key error from unique index
        if (err.code === 11000) {
            err.message = "You have already reviewed this listing.";
            err.statusCode = 400;
        }
        next(err);
    }
};

module.exports.deleteReview = async (req, res, next) => {
    try {
        const { id, reviewId } = req.params;
        const userId = req.session.userId;
        const userRole = req.session.role;

        const review = await Review.findById(reviewId);
        if (!review) throw new ExpressError("Review not found.", 404);

        // Only review author or admin can delete
        if (review.user.toString() !== userId.toString() && userRole !== "admin") {
            throw new ExpressError("You are not authorized to delete this review.", 403);
        }

        await Review.findByIdAndDelete(reviewId);
        await updateListingRating(id);

        res.redirect(`/listings/${id}`);
    } catch (err) {
        next(err);
    }
};
