const Rental = require("../models/rental.model");
const Listing = require("../models/listing.model");
const User = require("../models/user.model");
const ExpressError = require("../utils/expressError");

module.exports.rentForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
    res.render("rentals/rentForm", { listing })
}

module.exports.rentListing = async (req, res) => {
    const { id } = req.params;
    const { start, end } = req.body; // get rental period from form

    // Simple date validation
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (endDate <= startDate) {
        throw new ExpressError("End date must be after start date.", 400);
    }

    const listing = await Listing.findById(id);

    if (!listing || listing.rentalStatus !== "available") {
        throw new ExpressError("Listing not available for rent.", 400);
    }

    // Calculate rental days
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const price = days * listing.pricePerDay;

    // Create rental record
    const rental = new Rental({
        listing: listing._id,
        user: req.session.userId,
        rentalPeriod: { start: startDate, end: endDate },
        price,
    });

    await rental.save();

    // Mark listing as rented
    listing.rentalStatus = "rented";
    await listing.save();

    res.redirect("/listings");
};

module.exports.allRentals = async (req, res) => {
    const rentals = await Rental.find({})
        .populate("listing")
        .populate("user");
    res.render("admin/rentals", { rentals });
};

module.exports.completeRental = async (req, res) => {
    const { id } = req.params;

    const rental = await Rental.findById(id).populate("listing");

    rental.status = "completed";
    await rental.save();

    // Make listing available again
    rental.listing.rentalStatus = "available";
    await rental.listing.save();

    res.redirect("/rentals/admin");
};

module.exports.completeUserRental = async (req, res) => {
    const { id } = req.params;

    const rental = await Rental.findById(id).populate("listing");

    // Check if rental belongs to current user
    if (rental.user.toString() !== req.session.userId) {
        throw new ExpressError("Unauthorized", 403);
    }

    rental.status = "completed";
    await rental.save();

    // Make listing available again
    rental.listing.rentalStatus = "available";
    await rental.listing.save();

    // res.redirect("/users/my-rentals");
    res.redirect("/my-Rentals");
};
