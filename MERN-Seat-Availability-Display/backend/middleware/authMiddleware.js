// authMiddleware.js
const jwt = require('jsonwebtoken');

// Verify if the user is authenticated
const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }
    jwt.verify(token, "jwt-secret-key", (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Invalid token" });
        }
        req.user = decoded; // Attach the decoded user info to the request
        next();
    });
};

// Verify if the user is an admin
const verifyAdmin = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: "No token found" });
    }
    jwt.verify(token, "jwt-secret-key", (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Invalid token" });
        }
        if (decoded.role === "admin") {
            next(); // Proceed if the user is an admin
        } else {
            return res.status(403).json({ error: "Not authorized" });
        }
    });
};

module.exports = { verifyUser, verifyAdmin };
