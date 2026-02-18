const express = require("express");
const router = express.Router();
const users = require("../controllers/user.controller");
const { isLoggedIn } = require("../middlewares/auth.middleware");

router.get("/register", users.renderRegister);
router.post("/register", users.register);

router.get("/login", users.renderLogin);
router.post("/login", users.login);

router.post("/logout", users.logout);

router.get("/my-rentals", isLoggedIn, users.myRentals);


module.exports = router;
