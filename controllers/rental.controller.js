const Rental = require("../models/rental.model");
const Listing = require("../models/listing.model");
const User = require("../models/user.model");
const ExpressError = require("../utils/expressError");
const mongoose = require("mongoose");

module.exports.rentForm = async (req, res, next) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            throw new ExpressError("Listing not found", 404);
        }
        // pass sizes to template so renter can choose
        res.render("rentals/rentForm", { listing });
    } catch (err) {
        next(err);
    }
}

module.exports.rentListing = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { start, end, size } = req.body; // get rental period and size from form

        // Simple date validation
        const startDate = new Date(start);
        const endDate = new Date(end);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate < today) {
            throw new ExpressError("Start date cannot be in the past.", 400);
        }

        if (endDate <= startDate) {
            throw new ExpressError("End date must be after start date.", 400);
        }

        const listing = await Listing.findById(id);

        if (!listing || listing.rentalStatus !== "available") {
            throw new ExpressError("Listing not available for rent.", 400);
        }

        if (listing.owner && listing.owner.toString() === req.session.userId.toString()) {
            throw new ExpressError("You cannot rent your own listing.", 400);
        }

        // Ensure size was selected and valid
        if (!size) {
            throw new ExpressError("Size must be selected.", 400);
        }
        if (!listing.size.includes(size)) {
            throw new ExpressError("Selected size not available for this listing.", 400);
        }

        // Calculate rental days
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

        const price = days * listing.pricePerDay;

        // Create rental record
        const rental = new Rental({
            listing: listing._id,
            user: req.session.userId,
            rentalPeriod: { start: startDate, end: endDate },
            price,
            size
        });

        await rental.save();

        // Mark listing as rented
        listing.rentalStatus = "rented";
        await listing.save();

        res.redirect("/listings");
    } catch (err) {
        next(err);
    }
};

module.exports.allRentals = async (req, res, next) => {
    try {
        const rentals = await Rental.find({})
            .populate("listing")
            .populate("user");
        res.render("admin/rentals", { rentals });
    } catch (err) {
        next(err);
    }
};

module.exports.completeRental = async (req, res, next) => {
    try {
        const { id } = req.params;

        const rental = await Rental.findById(id).populate("listing");

        if (!rental) {
            throw new ExpressError("Rental not found", 404);
        }

        rental.status = "completed";
        await rental.save();

        // Make listing available again
        rental.listing.rentalStatus = "available";
        await rental.listing.save();

        res.redirect("/admin/rentals");
    } catch (err) {
        next(err);
    }
};

module.exports.completeUserRental = async (req, res, next) => {
    try {
        const { id } = req.params;

        const rental = await Rental.findById(id).populate("listing");

        if (!rental) {
            throw new ExpressError("Rental not found", 404);
        }

        // Check if rental belongs to current user
        if (rental.user.toString() !== req.session.userId.toString()) {
            throw new ExpressError("Unauthorized", 403);
        }

        rental.status = "completed";
        await rental.save();

        // Make listing available again
        rental.listing.rentalStatus = "available";
        await rental.listing.save();

        res.redirect("/my-rentals");
    } catch (err) {
        next(err);
    }
};
