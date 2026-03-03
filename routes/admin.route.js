const express = require("express");
const router = express.Router();
const { isLoggedIn, isAdmin } = require("../middlewares/auth.middleware");
const adminController = require("../controllers/admin.controller");

router.get("/dashboard", isLoggedIn, isAdmin, adminController.renderDashboard);

router.get("/listings", isLoggedIn, isAdmin, adminController.renderAllListings);

router.patch("/listings/:id/status", isLoggedIn, isAdmin, adminController.updateRentalStatus
);

// View all rentals
router.get("/rentals", isLoggedIn, isAdmin, adminController.viewRentals);

// Complete rental
router.put("/rentals/:id/complete", isLoggedIn, isAdmin, adminController.completeRental);


module.exports = router;
