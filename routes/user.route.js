const express = require("express");
const router = express.Router();
const users = require("../controllers/user.controller");
const { isLoggedIn } = require("../middlewares/auth.middleware");
const { registerSchema, loginSchema, validate } = require("../validators/schemas");

router.get("/register", users.renderRegister);
router.post("/register", validate(registerSchema), users.register);

router.get("/login", users.renderLogin);
router.post("/login", validate(loginSchema), users.login);

router.post("/logout", users.logout);

router.get("/profile", isLoggedIn, users.renderProfile);
router.get("/my-rentals", isLoggedIn, users.myRentals);


module.exports = router;
