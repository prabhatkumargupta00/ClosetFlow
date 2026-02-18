const Listing = require("../models/listing.model");
const uploadFile = require('../utils/storage.imageKit.js')

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.index = async (req, res) => {
    const { q } = req.query;

    let listings;

    if (q && q.trim() !== "") {
        listings = await Listing.find({
            $or: [
                { title: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } }
            ]
        });
    } else {
        listings = await Listing.find({});
    }

    res.render("listings/index", { listings, q });
};


module.exports.saveNewListing = async (req, res) => {

    const file = req.file;

    if (!req.body.listing.size?.length) {
        throw new ExpressError("At least one size must be selected", 400);
    }

    if (!req.file) {
        throw new ExpressError("Image is required", 400);
    }

    const result = await uploadFile(file.buffer.toString('base64'))

    const listing = await Listing.create({
        ...req.body.listing,
        image: result.url,
        imageFileId: result.fileId
    })

    res.redirect("/listings");
}

module.exports.showSingleListing =  async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError("Listing not found", 404);
    }
    res.render("listings/show.ejs", { listing });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError("Listing not found", 404);
    }
    res.render("listings/edit.ejs", { listing });
}

module.exports.applyEditedListing = async (req, res) => {
    const { id } = req.params;
    const file = req.file;

    const result = await uploadFile(file.buffer.toString('base64'))



    await Listing.findByIdAndUpdate(
        id,
        {
            ...req.body.listing,
            image: result.url,
            imageFileId: result.fileId
        },
        { runValidators: true }
    );
    res.redirect(`/listings/${id}`);
}

module.exports.rendListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError("Listing not found", 404);
    }

    // placeholder: rental logic will come later
    res.send("Rental flow initiated");
}

module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}


