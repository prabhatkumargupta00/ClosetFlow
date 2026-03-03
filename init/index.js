require('dotenv').config();
const mongoose = require("mongoose")
const initData = require("./data.js")
const Listing = require("../models/listing.model.js")

const MONGO_URL = process.env.MONGO_URL

main()
    .then(() => {
        console.log("Connected to database")
    })
    .catch((err) => {
        console.log(err)
    });


async function main() {
    await mongoose.connect(MONGO_URL)
}

const initDB = async () => {
    await Listing.deleteMany({})
    await Listing.insertMany(initData.data);
    console.log("data is initialized")
}

initDB();







