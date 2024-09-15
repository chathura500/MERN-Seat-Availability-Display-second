require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const seatbooking = require('./routes/booking_routes'); // Importing your seat booking routes
const UserModel = require('./models/User'); // Assuming you have the User model
const userRoutes = require('./routes/user_routes');
const app = express();

// Middleware to log request path and method
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

// Middleware setup
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser()); // Enable cookie parsing for handling JWT tokens

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

// Authentication Middleware

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

// Authentication Routes

// Login route
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    UserModel.findOne({ email: email })
        .then((user) => {
            if (user) {
                bcrypt.compare(password, user.password, (err, response) => {
                    if (response) {
                        const token = jwt.sign({ _id: user._id, email: user.email, role: user.role }, "jwt-secret-key", { expiresIn: "1d" });
                        res.cookie("token", token, { httpOnly: true }); // Store the token in a cookie
                        if (user.role === "admin") {
                            return res.json({ data: "Admin Success" });
                        } else {
                            return res.json({ data: "User Success" });
                        }
                    } else {
                        res.status(400).json({ error: "The password is incorrect" });
                    }
                });
            } else {
                res.status(404).json({ error: "No record found" });
            }
        });
});

// Logout route
app.post("/logout", (req, res) => {
    res.clearCookie("token");
    return res.json({ message: "Logged out successfully" });
});

// Register route
app.post("/register", (req, res) => {
    const { name, email, password, role } = req.body;
    bcrypt.hash(password, 10)
        .then((hash) => {
            UserModel.create({ name, email, password: hash, role })
                .then((user) => res.status(201).json(user))
                .catch((err) => res.status(500).json({ error: err.message }));
        })
        .catch((err) => res.status(500).json({ error: err.message }));
});

// Seat Booking Routes
//console.log(seatbooking);
app.use('/api/booking', verifyUser, seatbooking); // Apply verifyUser middleware
//console.log(userRoutes);
app.use('/api/user', userRoutes);

// Protected Routes
app.get('/home', verifyUser, (req, res) => {
    return res.json({ data: "User access granted", user: req.user });
});

app.get('/admin', verifyAdmin, (req, res) => {
    return res.json({ data: "Admin access granted" });
});

// Server listening on the port
app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
});
