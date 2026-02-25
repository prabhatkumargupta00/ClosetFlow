// dotenv configure
require('dotenv').config();

const express = require("express")
const app = express();
const mongoose = require("mongoose")
const path = require("path")
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")
// const helmet = require('helmet');



const ExpressError = require('./utils/expressError.js');
const listingRoutes = require("./routes/listings.route.js");
const adminRoutes = require('./routes/admin.route.js')
const rentalRoutes = require('./routes/rental.route.js')
const userRoutes = require("./routes/user.route.js");


const session = require("express-session");


// Configure view engine
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate)



// Setup middleware BEFORE routes
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")))
// app.use(helmet());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            // keep session cookie for 1 day (ms)
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
        },
    })
);
app.use((req, res, next) => {
    res.locals.currentUser = req.session.userId;
    res.locals.currentUsername = req.session.username;
    res.locals.currentUserRole = req.session.role;

    next();
});


// app.use((req, res, next) => {
//     res.locals.currentUser = req.session.userId;
//     next();
// });

// user routes goes here
app.use("/", userRoutes);
app.use("/listings", listingRoutes);

// admin routes goes herw
app.use("/admin", adminRoutes);

// rental routes goes here
app.use('/rentals', rentalRoutes)



// Routes
// Root route redirect
app.get("/", (req, res) => {
    res.redirect("/listings");
});


main()
    .then(() => {
        console.log("Connected to database")
    })
    .catch((err) => {
        console.log(err)
    });

async function main() {
    await mongoose.connect(process.env.MONGO_URL)
}

// 404 handler - must be after all other routes
app.all(/.*/, (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Something went wrong";
    res.status(err.statusCode).render("error/error.ejs", { err });
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});