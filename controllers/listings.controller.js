const Listing = require("../models/listing.model");
const Rental = require("../models/rental.model");
const { uploadFile, deleteFile } = require('../utils/storage.imageKit.js');
const ExpressError = require("../utils/expressError.js");

module.exports.renderNewForm = (req, res, next) => {
    try {
        res.render("listings/new.ejs");
    } catch (err) {
        next(err);
    }
}

module.exports.index = async (req, res, next) => {
    try {
        const { q } = req.query;

        let listings;

        if (q && q.trim() !== "") {
            listings = await Listing.find({
                $text: { $search: q }
            });
        } else {
            listings = await Listing.find({});
        }

        res.render("listings/index", { listings, q });
    } catch (err) {
        next(err);
    }
};


module.exports.saveNewListing = async (req, res, next) => {
    try {
        const file = req.file;

        if (!req.body.listing.size?.length) {
            throw new ExpressError("At least one size must be selected", 400);
        }

        if (!req.file) {
            throw new ExpressError("Image is required", 400);
        }

        const result = await uploadFile(file.buffer.toString('base64'))

        const listing = await Listing.create({
            ...req.body.listing,
            image: result.url,
            imageFileId: result.fileId,
            owner: req.session.userId,
            rentalStatus: "available"
        })

        res.redirect("/listings");
    } catch (err) {
        next(err);
    }
}

module.exports.showSingleListing = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            throw new ExpressError("Listing not found", 404);
        }

        const Review = require("../models/review.model");

        // Fetch all reviews for this listing, populated with user info
        const reviews = await Review.find({ listing: id })
            .populate("user", "username")
            .sort({ createdAt: -1 });

        let hasRented = false;
        let hasReviewed = false;

        if (req.session.userId) {
            const completedRental = await Rental.findOne({
                listing: id,
                user: req.session.userId,
                status: "completed",
            });
            hasRented = !!completedRental;
            hasReviewed = reviews.some(r => r.user._id.toString() === req.session.userId.toString());
        }

        res.render("listings/show.ejs", { listing, reviews, hasRented, hasReviewed });
    } catch (err) {
        next(err);
    }
}

module.exports.renderEditForm = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            throw new ExpressError("Listing not found", 404);
        }
        // Verify ownership - only owner or admin can edit
        if (!listing.owner || (listing.owner.toString() !== req.session.userId.toString() && req.session.role !== "admin")) {
            throw new ExpressError("Unauthorized - You do not own this listing", 403);
        }
        res.render("listings/edit.ejs", { listing });
    } catch (err) {
        next(err);
    }
}

module.exports.applyEditedListing = async (req, res, next) => {
    try {
        const { id } = req.params;
        const file = req.file;

        const listing = await Listing.findById(id);
        if (!listing) {
            throw new ExpressError("Listing not found", 404);
        }

        // Verify ownership - only owner or admin can edit
        if (!listing.owner || (listing.owner.toString() !== req.session.userId.toString() && req.session.role !== "admin")) {
            throw new ExpressError("Unauthorized - You do not own this listing", 403);
        }

        const updateData = { ...req.body.listing };

        if (file) {
            if (listing.imageFileId) {
                try {
                    await deleteFile(listing.imageFileId);
                } catch (error) {
                    console.error('Failed to delete old image from ImageKit:', error);
                }
            }
            const result = await uploadFile(file.buffer.toString('base64'));
            updateData.image = result.url;
            updateData.imageFileId = result.fileId;
        }

        await Listing.findByIdAndUpdate(
            id,
            updateData,
            { runValidators: true }
        );
        res.redirect(`/listings/${id}`);
    } catch (err) {
        next(err);
    }
}



module.exports.deleteListing = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Find the listing to get the image file ID
        const listing = await Listing.findById(id);
        if (!listing) {
            throw new ExpressError("Listing not found", 404);
        }

        // Verify ownership - only owner or admin can delete
        if (!listing.owner || (listing.owner.toString() !== req.session.userId.toString() && req.session.role !== "admin")) {
            throw new ExpressError("Unauthorized - You do not own this listing", 403);
        }

        // Check for active rentals - use atomic operation to prevent race condition
        const activeRentals = await Rental.find({
            listing: id,
            status: 'rented'
        });

        if (activeRentals.length > 0) {
            throw new ExpressError("Cannot delete listing with active rentals", 400);
        }

        // Delete the image from ImageKit if it exists
        if (listing.imageFileId) {
            try {
                await deleteFile(listing.imageFileId);
            } catch (error) {
                console.error('Failed to delete image from ImageKit:', error);
                // Continue with listing deletion even if image deletion fails
            }
        }

        // Delete the listing from database
        await Listing.findByIdAndDelete(id);
        res.redirect("/listings");
    } catch (err) {
        next(err);
    }
};


