// const express = require("express")
// const app = express();
// const mongoose = require("mongoose")
// const Listing = require("./models/listing.js")
// const path = require("path")
// const methodOverride = require("method-override")
// const ejsMate = require("ejs-mate")
// const ExpressError = require('./utils/expressError.js');


// const session = require("express-session");
// const userRoutes = require("./routes/users");

// app.use(
//     session({
//         secret: "closetflowsecret",
//         resave: false,
//         saveUninitialized: false,
//     })
// );

// app.use("/", userRoutes);




// app.set("view engine", "ejs")
// app.set("views", path.join(__dirname, "views"));
// app.use(express.urlencoded({ extended: true }));
// app.use(methodOverride("_method"));
// app.engine("ejs", ejsMate)
// app.use(express.static(path.join(__dirname, "/public")))



// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderLust"

// main()
//     .then(() => {
//         console.log("Connected to database")
//     })
//     .catch((err) => {
//         console.log(err)
//     });


// async function main() {
//     await mongoose.connect(MONGO_URL)
// }

// app.get("/", (req, res) => {
//     // res.send("Hi, i am root.")
//     res.redirect("/listings")
// })

// // INDEX ROUTE TO SHOW ALL THE LISTINGS
// app.get("/listings", async (req, res) => {
//     // Listing.find({}).then((res)=>{
//     //     console.log(res)
//     // })

//     let allListings = await Listing.find({});
//     // res.send("Home directory")
//     res.render("listings/index.ejs", { allListings })

// })

// // New route to create a totally new listing
// // listing/new should be before listing/:id otherwise the code will take new as id and search for it and hence throw an error.
// app.get("/listings/new", (req, res) => {
//     res.render("listings/new.ejs")
// })

// // Show route to show the listings in detail
// app.get("/listings/:id", async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id);
//     res.render("listings/show.ejs", { listing });
// })

// // Create route to create a new listing and then save in the database
// app.post("/listings", async (req, res) => {
//     // let {title, description , image , price , location , country} = req.body;  there is also another way to get this, when naming the field in new.ejs we can store them all in an object and here we can simply get that object, see below code.

//     // let listing  = req.body.listing;
//     // let newListing = new Listing(listing);   

//     // #######   OR    ####
//     let newListing = new Listing(req.body.listing);
//     if (!newListing.size || newListing.size.length === 0) {
//         // console.log(newListing.size, "size validation failed");
//         throw new ExpressError("At least one size must be selected", 400);
//     }

//     // console.log(!newListing.size, 'this is first')
//     // console.log(newListing.size)
//     // console.log(' nest ', newListing)

//     await newListing.save();
//     // console.log(newListing)
//     res.redirect("/listings")
// })

// // Edit route- this route will be used to edit the route
// app.get("/listings/:id/edit", async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id);
//     res.render("listings/edit.ejs", { listing })
// })

// // Update route : to update and save chages from edit route
// app.put("/listings/:id", async (req, res) => {
//     let { id } = req.params;
//     await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { runValidators: true });
//     // res.redirect("/listings")    this line will redirect to the home page
//     // the below line will redirect to the show route
//     res.redirect(`/listings/${id}`)
// })


// // Delete route : this route will be used to delete the listing
// app.delete("/listings/:id", async (req, res) => {
//     let { id } = req.params;
//     let deletedListing = await Listing.findByIdAndDelete(id);
//     // console.log(`The listing for ${deletedListing.title} is deleted`)
//     res.redirect("/listings")
// })









// // app.get("/testListing", async (req,res) =>{
// //     let sampleListing = new Listing({
// //         title : "Beauty villa",
// //         description : "A beautiful place to stay..",
// //         price : 1200,
// //         location : "Bihar siwan ",
// //         country : "INDIA",
// //     });

// //     // await sampleListing.save();
// //         // .then((res) =>{
// //         //     console.log(res)
// //         // })
// //         // .catch((err) =>{
// //         //     console.log(err)
// //         // })
// //     console.log(sampleListing)
// //     res.send("Successfull")

// // })











// app.all("*", (req, res, next) => {
//     next(new ExpressError("Page Not Found", 404));
// });

// app.use((err, req, res, next) => {
//     const { statusCode = 500, message = "Something went wrong" } = err;
//     res.status(statusCode).render("error.ejs", { err });
// });








// app.listen(8080, () => {
//     console.log("server is listening to port 8080")
// })