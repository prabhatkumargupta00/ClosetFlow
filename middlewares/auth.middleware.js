

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.session.userId) {
        // Persist original URL for post-login redirect
        req.session.returnTo = req.originalUrl;
        return res.redirect("/login");
    }
    next();
};

module.exports.isAdmin = (req, res, next) => {
    if (req.session.role !== "admin") {
        return res.status(403).render("error/unauthorized403", {
            title: "Access Restricted"
        });
    }
    next();
};


// module.exports.isAdmin = (req, res, next) => {
//     if (req.session.role !== "admin") {
//         return res.status(403).send("Access denied");
//     }
//     next();
// };
