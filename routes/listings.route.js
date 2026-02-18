const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.model.js");
const ExpressError = require("../utils/expressError.js");
const { isLoggedIn, isAdmin } = require("../middlewares/auth.middleware.js");
const {index, renderNewForm, saveNewListing, showSingleListing, renderEditForm, applyEditedListing, deleteListing} = require("../controllers/listings.controller.js")
const { rentListing } = require("../controllers/rental.controller.js");



const uploadFile = require('../utils/storage.imageKit.js')
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage()
})




// INDEX – show all listings
router.get("/", index);

// NEW – form to create listing
router.get("/new", isLoggedIn, isAdmin, renderNewForm);

// CREATE – save new listing
// router.post("/", isLoggedIn, isAdmin, async (req, res) => {
//     const newListing = new Listing(req.body.listing);

//     if (!newListing.size || newListing.size.length === 0) {
//         throw new ExpressError("At least one size must be selected", 400);
//     }

//     await newListing.save();
//     res.redirect("/listings");
// });

router.post("/", isLoggedIn, isAdmin, upload.single("image"), saveNewListing)

// SHOW – show single listing
router.get("/:id", showSingleListing);

// EDIT – edit form
router.get("/:id/edit", isLoggedIn, isAdmin, renderEditForm );

// UPDATE – apply edits
router.put("/:id", isLoggedIn, isAdmin, upload.single("image"), applyEditedListing);

// RENT – user must be logged in
router.post("/:id/rent", isLoggedIn, rentListing);

// DELETE – remove listing
router.delete("/:id", isLoggedIn, isAdmin, deleteListing );

module.exports = router;
