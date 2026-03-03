const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const ExpressError = require("../utils/expressError");
const rentalModel = require("../models/rental.model");

module.exports.renderRegister = (req, res) => {
    res.render("users/register");
};

module.exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const user = new User({
            username,
            email,
            password
        });

        await user.save();

        req.session.userId = user._id;
        req.session.role = user.role;
        req.session.username = user.username;

        res.redirect("/listings");
    } catch (err) {
        if (err.code === 11000) {
            // Duplicate email or username error
            next(new ExpressError("Email or Username already in use. Please try another.", 400));
        } else {
            next(err);
        }
    }
};

module.exports.renderLogin = (req, res) => {
    res.render("users/login");
};

module.exports.login = async (req, res) => {
    const { email, password } = req.body;

    const DUMMY_HASH = "$2b$12$invalidhashfortimingprotection00000000000000000000";
    const user = await User.findOne({ email });
    const hashToCheck = user ? user.password : DUMMY_HASH;
    const validPassword = await bcrypt.compare(password, hashToCheck);

    if (!user || !validPassword) {
        return res.render("users/login", { error: "Invalid email or password" });
    }

    // Session hydration
    req.session.userId = user._id;
    req.session.role = user.role;
    req.session.username = user.username;

    /*
    Redirect strategy:
    1. If user was intercepted mid-flow → honor returnTo
    2. Else apply role-based default landing
    */
    const redirectUrl = req.session.returnTo || (
        user.role === "admin"
            ? "/admin/dashboard"
            : "/listings"
    );

    // Session hygiene
    delete req.session.returnTo;

    res.redirect(redirectUrl);
};


module.exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect("/listings");
        }
        res.clearCookie("connect.sid");
        res.redirect("/");
    });
};

module.exports.myRentals = async (req, res, next) => {
    try {
        const rentals = await rentalModel.find({ user: req.session.userId })
            .populate("listing")
            .sort({ "rentalPeriod.start": -1 });

        res.render("users/myRentals", { rentals });
    } catch (err) {
        next(err);
    }
};

module.exports.renderProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.session.userId).select("-password");
        if (!user) {
            throw new ExpressError("User not found", 404);
        }

        const totalRentals = await rentalModel.countDocuments({ user: user._id });
        const activeRentals = await rentalModel.countDocuments({ user: user._id, status: "rented" });
        const completedRentals = await rentalModel.countDocuments({ user: user._id, status: "completed" });

        // Calculate total amount spent
        const spentResult = await rentalModel.aggregate([
            { $match: { user: user._id } },
            { $group: { _id: null, total: { $sum: "$price" } } }
        ]);
        const totalSpent = spentResult.length > 0 ? spentResult[0].total : 0;

        // Get recent rentals (last 5)
        const recentRentals = await rentalModel.find({ user: user._id })
            .populate("listing")
            .sort({ createdAt: -1 })
            .limit(5);

        res.render("users/profile", {
            user,
            stats: { totalRentals, activeRentals, completedRentals, totalSpent },
            recentRentals
        });
    } catch (err) {
        next(err);
    }
};

