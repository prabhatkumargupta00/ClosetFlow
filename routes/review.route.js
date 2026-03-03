const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams to access :id from parent
const reviews = require("../controllers/review.controller");
const { isLoggedIn } = require("../middlewares/auth.middleware");

// POST /listings/:id/reviews
router.post("/", isLoggedIn, reviews.createReview);

// DELETE /listings/:id/reviews/:reviewId
router.delete("/:reviewId", isLoggedIn, reviews.deleteReview);

module.exports = router;
