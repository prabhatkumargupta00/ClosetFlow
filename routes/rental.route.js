const express = require("express");
const router = express.Router();
const rentals = require("../controllers/rental.controller");
const { isLoggedIn, isAdmin } = require("../middlewares/auth.middleware");

// User rental routes
router.get("/:id",  rentals.rentForm)
router.post("/:id/rent", isLoggedIn, rentals.rentListing);

// Admin rental management
router.get("/admin", isLoggedIn, isAdmin, rentals.allRentals);
router.put("/admin/:id/complete", isLoggedIn, isAdmin, rentals.completeRental);

module.exports = router;
