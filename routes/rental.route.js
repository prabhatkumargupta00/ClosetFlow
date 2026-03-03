const express = require("express");
const router = express.Router();
const rentals = require("../controllers/rental.controller");
const { isLoggedIn, isAdmin } = require("../middlewares/auth.middleware");
const { rentalSchema, validate } = require("../validators/schemas");

// User rental routes
router.get("/:id", isLoggedIn, rentals.rentForm)
router.post("/:id/rent", isLoggedIn, validate(rentalSchema), rentals.rentListing);
router.put("/:id/complete", isLoggedIn, rentals.completeUserRental);



module.exports = router;
