const express = require('express');
const { verifyUser, verifyAdmin } = require('../middleware/authMiddleware'); // Ensure this path is correct
const Seat = require('../models/seatSchema'); // Adjust the path to match your project structure
const UserModel = require('../models/User');
const router = express.Router();

// Get booking history for the logged-in user for a specific date
router.get('/my-bookings', verifyUser, async (req, res) => {
    const { date } = req.query;
    if (!date) {
        return res.status(400).json({ error: 'Date is required' });
    }

    try {
        const bookings = await Seat.find({
            bookedBy: req.user._id,
            date: new Date(date)
        });

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Get user profile along with booked seats for a specific date
router.get('/profile', verifyUser, async (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ error: 'Date is required' });
    }

    try {
        // Fetch user profile excluding password
        const user = await UserModel.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch user's booked seats for the specified date
        const bookings = await Seat.find({
            bookedBy: req.user._id,
            date: new Date(date)
        });

        res.status(200).json({
            id: user._id, // Include user ID
            user,
            bookings
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user profile and bookings' });
    }
});

// Get user profile by email and bookings for a specific date
router.get('/profile-by-email', verifyUser, async (req, res) => {
    const { email, date } = req.query;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    if (!date) {
        return res.status(400).json({ error: 'Date is required' });
    }

    try {
        // Fetch user profile by email excluding password
        const user = await UserModel.findOne({ email }).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch user's booked seats for the specified date
        const bookings = await Seat.find({
            bookedBy: user._id,
            date: new Date(date)
        });

        // Handle case where no bookings are found
        if (bookings.length === 0) {
            return res.status(404).json({ error: 'No bookings found for this user on the specified date' });
        }

        res.status(200).json({
            id: user._id, // Include user ID
            user,
            bookings
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user profile and bookings' });
    }
});

// Get all registered users
router.get('/all-users', verifyAdmin, async (req, res) => {
    try {
        const users = await UserModel.find().select('-password'); // Exclude password from response
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get all registered users with their seat bookings for a specific date
router.get('/users-with-bookings', verifyAdmin, async (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ error: 'Date is required' });
    }

    try {
        const users = await UserModel.find().select('-password'); // Fetch all users, excluding passwords

        // Fetch seat bookings for each user on the specified date
        const usersWithBookings = await Promise.all(
            users.map(async (user) => {
                const bookings = await Seat.find({
                    bookedBy: user._id,
                    date: new Date(date)
                });

                // Return users who have bookings for the specified date
                if (bookings.length > 0) {
                    return {
                        ...user.toObject(),
                        bookings
                    };
                }
                return null;
            })
        );

        // Filter out users with no bookings
        const filteredUsers = usersWithBookings.filter(user => user !== null);

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error('Error fetching users with bookings:', error);
        res.status(500).json({ error: 'Failed to fetch users with bookings' });
    }
});

module.exports = router;
