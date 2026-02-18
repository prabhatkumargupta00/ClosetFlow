const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middlewares/auth.middleware");
const adminController = require("../controllers/admin.controller");

router.get("/dashboard", isAdmin, adminController.renderDashboard);

router.get("/listings", isAdmin, adminController.renderAllListings);

router.patch("/listings/:id/status", isAdmin, adminController.updateRentalStatus
);

// View all rentals
router.get("/rentals", isAdmin, adminController.viewRentals);

// Complete rental
router.put("/rentals/:id/complete", isAdmin, adminController.completeRental);


module.exports = router;
