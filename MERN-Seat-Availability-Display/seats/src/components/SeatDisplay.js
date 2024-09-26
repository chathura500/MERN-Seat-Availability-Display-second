import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SeatList.css'; // Make sure the CSS file contains the updated styles

const SeatDisplay = () => {
    const [seats, setSeats] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false); // For loading state

    // Fetch seats for the selected date
    const fetchSeats = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:4000/api/booking/seats', {
                params: { date },
                withCredentials: true,
            });
            setSeats(response.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch seat details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (date) {
            fetchSeats();
        }
    }, [date]);

    // Book selected seat
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

    // Unbook selected seat
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

    // Count available seats
    const availableSeatsCount = seats.filter(seat => seat.isSeatAvailable).length;

    // Group seats by sections (first letter of seat number)
    const seatsBySection = seats.reduce((acc, seat) => {
        const section = seat.seatNumber.charAt(0); // Assuming first character represents the section
        if (!acc[section]) {
            acc[section] = [];
        }
        acc[section].push(seat);
        return acc;
    }, {});

    // Sort sections alphabetically
    const sortedSections = Object.keys(seatsBySection).sort();

    // Sort seats within each section by numeric order
    sortedSections.forEach(section => {
        seatsBySection[section].sort((a, b) => {
            const numA = parseInt(a.seatNumber.slice(1)); // Get the numeric part
            const numB = parseInt(b.seatNumber.slice(1)); // Get the numeric part
            return numB - numA;
        });
    });

    return (
        <div className="seatmaincontainer container mt-4">
            <div className='smallcont'>
                <h1 className="mb-4">Seat Booking</h1>
            </div>
            {/* Select Date */}
            <div className="row mb-4 text-center">
                <div className="col-md-6">
                    <div className="form-group">
                        <label htmlFor="date">Select Date:</label>
                        <input
                            type="date"
                            id="date"
                            className="form-control"
                            value={date}
                            min={new Date().toISOString().split('T')[0]} // Disable past dates
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Show error or success messages */}
            {error && <p className="text-danger mt-2">{error}</p>}
            {successMessage && <p className="text-success mt-2">{successMessage}</p>}

            {/* Loading indicator */}
            {loading && <div className="text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>}

            {/* Seat List */}
            {!loading && seats.length > 0 && (
                <div className='seatset'>
                    <p className="text-center mb-4">Available Seats: <span className="badge">{availableSeatsCount}</span></p>
                    <div className="theater-container">
                        <div className="screen mb-4"></div>
                        {sortedSections.map(section => {
                            const leftSeats = seatsBySection[section].slice(0, 10); // First 10 seats (left side)
                            const rightSeats = seatsBySection[section].slice(10);   // Next 10 seats (right side)

                            return (
                                <div key={section} className="section mb-4">
                                    <h3 className="section-title">Section {section}</h3>
                                    <div className="seat-grid">
                                        {/* First row (Seats 1-10 on left) */}
                                        <div className="seat-group">
                                            {leftSeats.map(seat => (
                                                <div
                                                    key={seat._id}
                                                    className={`seat ${seat.isSeatAvailable ? 'available' : 'booked'}`}
                                                    onClick={() => seat.isSeatAvailable ? bookSeat(seat._id) : unbookSeat(seat._id)}
                                                >
                                                    {seat.seatNumber}
                                                    <div className="seat-tooltip">
                                                        {seat.isSeatAvailable ? 'Available' : 'Booked'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {/* Second row (Seats 11-20 on right) */}
                                        <div className="seat-group">
                                            {rightSeats.map(seat => (
                                                <div
                                                    key={seat._id}
                                                    className={`seat ${seat.isSeatAvailable ? 'available' : 'booked'}`}
                                                    onClick={() => seat.isSeatAvailable ? bookSeat(seat._id) : unbookSeat(seat._id)}
                                                >
                                                    {seat.seatNumber}
                                                    <div className="seat-tooltip">
                                                        {seat.isSeatAvailable ? 'Available' : 'Booked'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Show message if no seats are available */}
            {!loading && seats.length === 0 && <p>No seats available for the selected date.</p>}
        </div>
    );
};

export default SeatDisplay;
