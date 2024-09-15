// src/components/AdminPanel.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css'; // Custom CSS to style the admin panel

const AdminPanel = () => {
    const [seats, setSeats] = useState([]);
    //const [seatNumber, setSeatNumber] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    //const [selectedSeats, setSelectedSeats] = useState([]);
    const [selectedLetter, setSelectedLetter] = useState('');
    const [selectedNumber, setSelectedNumber] = useState('');
    const [quickCreateInput, setQuickCreateInput] = useState('');

    // Letters and Numbers array
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].sort();
    const numbers = Array.from({ length: 20 }, (_, i) => i + 1).sort((a, b) => a - b);

    // Fetch seats for the selected date
    const fetchSeats = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/booking/seats', {
                params: { date },
                withCredentials: true,
            });
            setSeats(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch seat details');
        }
    };

    useEffect(() => {
        if (date) {
            fetchSeats();
        }
    }, [date]);

    // Handle seat creation (individual seat)
    const createSeat = async (seatNumber) => {
        if (seats.some(seat => seat.seatNumber === seatNumber)) {
            setError('Seat already exists.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:4000/api/booking/seats', {
                seatNumber,
                date,
            }, { withCredentials: true });
            setSuccessMessage(response.data.message || 'Seat created successfully!');
            fetchSeats(); // Refresh the seat list
            setError(''); // Clear the error
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create seat');
        }
    };

    // Handle quick create (multiple seats)
    const handleQuickCreate = async (e) => {
        e.preventDefault();
        const seatNumbers = quickCreateInput.split(',').map(s => s.trim().toUpperCase());

        // Validate seat format
        const invalidSeats = seatNumbers.filter(seat => !/^[A-H][1-9]$|^[A-H]1[0-9]$|^[A-H]20$/.test(seat));
        if (invalidSeats.length > 0) {
            setError(`Invalid seat numbers: ${invalidSeats.join(', ')}. Use format A1-H20.`);
            return;
        }

        // Check for existing seats
        const existingSeats = seatNumbers.filter(seatNumber =>
            seats.some(seat => seat.seatNumber === seatNumber)
        );
        if (existingSeats.length > 0) {
            setError(`These seats already exist: ${existingSeats.join(', ')}`);
            return;
        }

        try {
            await Promise.all(seatNumbers.map(seatNumber => createSeat(seatNumber)));
            setQuickCreateInput('');
            setSuccessMessage('Seats created successfully!');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create some seats');
        }
    };

    // Book selected seats
    const bookSeat = async (seatId) => {
        try {
            const response = await axios.patch(`http://localhost:4000/api/booking/seats/book/${seatId}`, {
                date
            }, { withCredentials: true });
            setSuccessMessage(response.data.message || 'Seat booked successfully!');
            fetchSeats(); // Refresh seat list
            setError(''); // Clear the error
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to book seat');
        }
    };

    // Unbook selected seats
    const unbookSeat = async (seatId) => {
        try {
            const response = await axios.patch(`http://localhost:4000/api/booking/seats/unbook/${seatId}`, {
                date
            }, { withCredentials: true });
            setSuccessMessage(response.data.message || 'Seat unbooked successfully!');
            fetchSeats(); // Refresh seat list
            setError(''); // Clear the error
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to unbook seat');
        }
    };

    // Delete a seat
    const deleteSeat = async (seatId) => {
        try {
            const response = await axios.delete(`http://localhost:4000/api/booking/seats/${seatId}`, { withCredentials: true });
            setSuccessMessage(response.data.message || 'Seat deleted successfully!');
            fetchSeats(); // Refresh the seat list
            setError(''); // Clear the error
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete seat');
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Admin Panel</h2>
            {/* Select Date */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="form-group">
                        <label htmlFor="date">Select Date:</label>
                        <input
                            type="date"
                            id="date"
                            className="form-control"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Individual Seat Creation */}
            <form onSubmit={(e) => { e.preventDefault(); createSeat(`${selectedLetter}${selectedNumber}`); }} className="mb-4">
                <h4>Create Individual Seat</h4>
                <div className="row">
                    <div className="col-md-4">
                        <select
                            className="form-control mb-2"
                            value={selectedLetter}
                            onChange={(e) => setSelectedLetter(e.target.value)}
                        >
                            <option value="">Select Letter</option>
                            {letters.map(letter => (
                                <option key={letter} value={letter}>{letter}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-4">
                        <select
                            className="form-control mb-2"
                            value={selectedNumber}
                            onChange={(e) => setSelectedNumber(e.target.value)}
                        >
                            <option value="">Select Number</option>
                            {numbers.map(number => (
                                <option key={number} value={number}>{number}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-4">
                        <button type="submit" className="btn btn-primary w-100">Create Seat</button>
                    </div>
                </div>
            </form>

            {/* Quick Create Multiple Seats */}
            <form onSubmit={handleQuickCreate} className="mb-4">
                <h4>Quick Create Multiple Seats</h4>
                <div className="row">
                    <div className="col-md-8">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter seat numbers (e.g., A1, B2, C3)"
                            value={quickCreateInput}
                            onChange={(e) => setQuickCreateInput(e.target.value)}
                        />
                    </div>
                    <div className="col-md-4">
                        <button type="submit" className="btn btn-primary w-100">Quick Create Seats</button>
                    </div>
                </div>
            </form>

            {/* Show error or success messages */}
            {error && <p className="text-danger mt-2">{error}</p>}
            {successMessage && <p className="text-success mt-2">{successMessage}</p>}

            {/* Seat List */}
            <div className="seat-list">
                <h3 className="mb-3">Seats for {date}</h3>
                <div className="row">
                    {seats.map(seat => (
                        <div key={seat._id} className="col-md-4 mb-3">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">{seat.seatNumber}</h5>
                                    <p className="card-text">{seat.isSeatAvailable ? 'Available' : 'Booked'}</p>
                                    <button
                                        className="btn btn-danger mr-2"
                                        onClick={() => deleteSeat(seat._id)}
                                    >
                                        Delete
                                    </button>
                                    {seat.isSeatAvailable ? (
                                        <button
                                            className="btn btn-success"
                                            onClick={() => bookSeat(seat._id)}
                                        >
                                            Book
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-warning"
                                            onClick={() => unbookSeat(seat._id)}
                                        >
                                            Unbook
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
