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
            // Duplicate email error
            next(new ExpressError("Email already in use. Please try another email.", 400));
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

    const user = await User.findOne({ email });
    if (!user) {
        return res.redirect("/login");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.redirect("/login");
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

module.exports.myRentals = async (req, res) => {
    const rentals = await rentalModel.find({ user: req.session.userId })
        .populate("listing")
        .sort({ "rentalPeriod.start": -1 });

    res.render("users/myRentals", { rentals });
};

