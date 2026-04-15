const Listing = require("../models/listing.model");
const User = require("../models/user.model");
const Rental = require("../models/rental.model");
const ExpressError = require("../utils/expressError");

// ADMIN DASHBOARD – system overview
module.exports.renderDashboard = async (req, res, next) => {
    try {
        const stats = {
            totalListings: await Listing.countDocuments({}),
            availableListings: await Listing.countDocuments({ rentalStatus: "available" }),
            rentedListings: await Listing.countDocuments({ rentalStatus: "rented" }),
            totalUsers: await User.countDocuments({}),
            adminCount: await User.countDocuments({ role: "admin" })
        };

        res.render("admin/dashboard", { stats });
    } catch (err) {
        next(err);
    }
};

// VIEW ALL LISTINGS (admin control surface)
module.exports.renderAllListings = async (req, res, next) => {
    try {
        const listings = await Listing.find({});
        res.render("admin/listings", { listings });
    } catch (err) {
        next(err);
    }
};

// UPDATE RENTAL STATUS (admin action)
module.exports.updateRentalStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["available", "rented"];
    if (!validStatuses.includes(status)) {
        throw new ExpressError("Invalid rental status provided.", 400);
    }

    await Listing.findByIdAndUpdate(id, {
        rentalStatus: status
    });

    res.redirect("/admin/listings");
};

module.exports.viewRentals = async (req, res, next) => {
    try {
        // Fetch all rentals with listing and user info
        const rentals = await Rental.find({})
            .populate("listing")
            .populate("user")
            .sort({ "rentalPeriod.start": -1 });

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

        // Set listing available again (only if it still exists)
        if (rental.listing) {
            rental.listing.rentalStatus = "available";
            await rental.listing.save();
        }

        res.redirect("/admin/rentals");
    } catch (err) {
        next(err);
    }
};
