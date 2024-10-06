const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
    seatNumber: {
        type: String,
        required: true
    },
    isSeatAvailable: {
        type: Boolean,
        default: true,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    bookedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        default: null // Default to null when seat is not booked
    },
    attendanceMarked: {
        type: Boolean,
        default: false // Default false, will be marked true when user marks attendance
    }
});

module.exports = mongoose.model('Seat', seatSchema);
