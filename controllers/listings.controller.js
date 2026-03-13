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
        const { q, sort, category } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = 6; // Listings per page
        const skip = (page - 1) * limit;

        let query = {};
        if (q && q.trim() !== "") {
            query = { $text: { $search: q } };
        }
        
        if (category && category !== "all") {
            query.category = category;
        }

        let sortCriteria = { createdAt: -1 }; // Default: Newest
        if (sort === "price_low") {
            sortCriteria = { pricePerDay: 1 };
        } else if (sort === "price_high") {
            sortCriteria = { pricePerDay: -1 };
        } else if (sort === "oldest") {
            sortCriteria = { createdAt: 1 };
        }

        const listings = await Listing.find(query)
            .sort(sortCriteria)
            .skip(skip)
            .limit(limit);

        const totalListings = await Listing.countDocuments(query);
        const totalPages = Math.ceil(totalListings / limit);

        res.render("listings/index", { 
            listings, 
            q: q || "", 
            sort: sort || "newest",
            category: category || "all",
            currentPage: page, 
            totalPages 
        });
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

        const { title, description, pricePerDay, location, brand, color, category, occasion, size, fitType } = req.body.listing;

        const listing = await Listing.create({
            title, description, pricePerDay, location, brand, color, category, occasion, size, fitType,
            image: result.url,
            imageFileId: result.fileId,
            owner: req.session.userId,
            rentalStatus: "available"
        })

        // console.log(listing);

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
        const isAdmin = req.session.role === "admin";
        const isOwner = listing.owner && listing.owner.toString() === req.session.userId.toString();
        if (!isAdmin && !isOwner) {
            throw new ExpressError("Unauthorized - You do not own this listing", 403);
        }

        const { title, description, pricePerDay, location, brand, color, category, occasion, size, fitType } = req.body.listing;
        const updateData = { title, description, pricePerDay, location, brand, color, category, occasion, size, fitType };

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
        const isAdmin = req.session.role === "admin";
        const isOwner = listing.owner && listing.owner.toString() === req.session.userId.toString();
        if (!isAdmin && !isOwner) {
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


