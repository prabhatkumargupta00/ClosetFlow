// dotenv configure
require('dotenv').config();

const express = require("express")
const app = express();
const mongoose = require("mongoose")
const path = require("path")
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")
const helmet = require('helmet');



const ExpressError = require('./utils/expressError.js');
const listingRoutes = require("./routes/listings.route.js");
const adminRoutes = require('./routes/admin.route.js')
const rentalRoutes = require('./routes/rental.route.js')
const userRoutes = require("./routes/user.route.js");
const reviewRoutes = require("./routes/review.route.js");


const session = require("express-session");
const { MongoStore } = require("connect-mongo");


// Configure view engine
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate)



// Setup middleware BEFORE routes
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")))

// Security headers via Helmet
// try to fully understand it : how it workd
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "https://cdn.jsdelivr.net",
                    "https://cdnjs.cloudflare.com",
                    "https://fonts.googleapis.com",
                ],
                fontSrc: [
                    "'self'",
                    "https://fonts.gstatic.com",
                    "https://cdnjs.cloudflare.com",
                ],
                imgSrc: [
                    "'self'",
                    "data:",
                    "https://ik.imagekit.io",
                    "https://images.unsplash.com",
                ],
                connectSrc: ["'self'", "https://cdn.jsdelivr.net", "https://ik.imagekit.io"],
                scriptSrcAttr: ["'unsafe-inline'"],
                formAction: ["'self'"],
            },
        },
    })
);

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URL,
            touchAfter: 24 * 3600, // only update session once per day (seconds)
        }),
        cookie: {
            // keep session cookie for 1 day (ms)
            maxAge: 1000 * 60 * 60 * 24,
            httpOnly: true,
            sameSite: 'Lax',
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

// Routes
// Root route redirect
app.get("/", (req, res) => {
    res.redirect("/listings");
});

// user routes goes here
app.use("/", userRoutes);
app.use("/listings", listingRoutes);

// admin routes goes herw
app.use("/admin", adminRoutes);

// rental routes goes here
app.use('/rentals', rentalRoutes)

// review routes goes here (nested under listings)
app.use('/listings/:id/reviews', reviewRoutes)





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