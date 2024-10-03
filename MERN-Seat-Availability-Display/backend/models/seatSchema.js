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
        ref: 'User', 
        default: null 
    }
});

module.exports = mongoose.model('Seat', seatSchema);
