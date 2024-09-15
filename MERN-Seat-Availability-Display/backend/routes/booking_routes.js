const express = require('express');
const { verifyUser, verifyAdmin } = require('../middleware/authMiddleware'); // Adjust path if necessary
const Seat = require('../models/seatSchema');
const router = express.Router();

// Get seats for a specific date
router.get('/seats', async (req, res) => {
    const { date } = req.query;
    if (!date) {
        return res.status(400).json({ error: 'Date is required' });
    }

    try {
        const seats = await Seat.find({ date: new Date(date) });
        res.status(200).json(seats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch seats' });
    }
});

// Create a new seat
router.post('/seats', verifyAdmin, async (req, res) => { // Admin-only access
    const { seatNumber, date } = req.body;

    if (!seatNumber || !date) {
        return res.status(400).json({ error: 'Seat number and date are required' });
    }

    try {
        const newSeat = new Seat({ seatNumber, date: new Date(date) });
        await newSeat.save();
        res.status(201).json(newSeat);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create seat' });
    }
});

// Book a seat
router.patch('/seats/book/:id', verifyUser, async (req, res) => { // User-only access
    const userId = req.user._id; // Assuming `req.user` contains user information after authentication

    try {
        const seat = await Seat.findById(req.params.id);
        if (!seat) {
            return res.status(404).json({ error: 'Seat not found' });
        }
        if (!seat.isSeatAvailable) {
            return res.status(400).json({ error: 'Seat already booked' });
        }

        // Check if the user has already booked 6 seats for the day
        const bookedSeatsCount = await Seat.countDocuments({
            bookedBy: userId,
            date: seat.date
        });

        if (bookedSeatsCount >= 6) {
            return res.status(400).json({ error: 'User has reached the limit of 6 seats per day' });
        }

        seat.isSeatAvailable = false;
        seat.bookedBy = userId; // Assign the booking user
        await seat.save();
        res.status(200).json(seat);
    } catch (error) {
        res.status(500).json({ error: 'Failed to book seat' });
    }
});

// Unbook a seat
router.patch('/seats/unbook/:id', verifyUser, async (req, res) => { // User-only access
    try {
        const seat = await Seat.findById(req.params.id);
        if (!seat) {
            return res.status(404).json({ error: 'Seat not found' });
        }
        if (seat.isSeatAvailable) {
            return res.status(400).json({ error: 'Seat is already available' });
        }

        seat.isSeatAvailable = true;
        seat.bookedBy = null; // Remove the booking user
        await seat.save();
        res.status(200).json(seat);
    } catch (error) {
        res.status(500).json({ error: 'Failed to unbook seat' });
    }
});

// Delete a seat - Only Admins
router.delete('/seats/:id', verifyAdmin, async (req, res) => {
    try {
        const seat = await Seat.findByIdAndDelete(req.params.id);
        if (!seat) {
            return res.status(404).json({ error: 'Seat not found' });
        }
        res.status(200).json({ message: 'Seat deleted successfully', seat });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete seat' });
    }
});

module.exports = router;
