const Listing = require("../models/listing.model");
const User = require("../models/user.model");
const Rental = require("../models/rental.model")

// ADMIN DASHBOARD – system overview
module.exports.renderDashboard = async (req, res) => {
    const stats = {
        totalListings: await Listing.countDocuments({}),
        availableListings: await Listing.countDocuments({ rentalStatus: "available" }),
        rentedListings: await Listing.countDocuments({ rentalStatus: "rented" }),
        reservedListings: await Listing.countDocuments({ rentalStatus: "reserved" }),
        totalUsers: await User.countDocuments({}),
        adminCount: await User.countDocuments({ role: "admin" })
    };

    res.render("admin/dashboard", { stats });
};

// VIEW ALL LISTINGS (admin control surface)
module.exports.renderAllListings = async (req, res) => {
    const listings = await Listing.find({});
    res.render("admin/listings", { listings });
};

// UPDATE RENTAL STATUS (admin action)
module.exports.updateRentalStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["available", "reserved", "rented"];
    if (!validStatuses.includes(status)) {
        return res.redirect("/admin/listings");
    }

    await Listing.findByIdAndUpdate(id, {
        rentalStatus: status
    });

    res.redirect("/admin/listings");
};

module.exports.viewRentals = async (req, res) => {
    // Fetch all rentals with listing and user info
    const rentals = await Rental.find({})
        .populate("listing")
        .populate("user")
        .sort({ "rentalPeriod.start": -1 });

    res.render("admin/rentals", { rentals });
};

module.exports.completeRental = async (req, res) => {
    const { id } = req.params;
    const rental = await Rental.findById(id).populate("listing");

    if (!rental) {
        return res.redirect("/admin/rentals");
    }

    rental.status = "completed";
    await rental.save();

    // Set listing available again
    rental.listing.rentalStatus = "available";
    await rental.listing.save();

    res.redirect("/admin/rentals");
};
