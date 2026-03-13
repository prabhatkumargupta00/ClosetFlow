// dotenv configure
require('dotenv').config();

const express = require("express")
const app = express();
const mongoose = require("mongoose")
const path = require("path")
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');




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



// Rate Limiting
app.set("trust proxy", 1);
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests
});

// Setup middleware BEFORE routes

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")))
app.use(limiter);


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
            mongoUrl: process.env.MONGO_URI,
            touchAfter: 24 * 3600, // only update session once per day (seconds)
        }),
        cookie: {
            // keep session cookie for 1 day (ms)
            secure: process.env.NODE_ENV === "production",
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
// Root route
app.get("/", (req, res) => {
    res.render("home.ejs");
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
        console.error("Database connection error:", err.message);
        if (err.code === 'ECONNREFUSED' && err.syscall === 'querySrv') {
            console.error("TIP: This error often happens due to DNS SRV resolution issues or if your IP is not whitelisted in MongoDB Atlas.");
        }
    });

async function main() {
    const connectionOptions = {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    };
    await mongoose.connect(process.env.MONGO_URI, connectionOptions);
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