

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.session.userId) {
        // Persist original URL for post-login redirect only on GET requests
        if (req.method === 'GET') {
            req.session.returnTo = req.originalUrl;
        }
        return res.redirect("/login");
    }
    next();
};

module.exports.isAdmin = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect("/login");
    }
    if (req.session.role !== "admin") {
        return res.status(403).render("error/unauthorized403", {
            title: "Access Restricted"
        });
    }
    next();
};
