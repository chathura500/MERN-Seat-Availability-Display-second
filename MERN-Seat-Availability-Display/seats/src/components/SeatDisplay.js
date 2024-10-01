import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SeatList.css';

const SeatDisplay = () => {
    const [seats, setSeats] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

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
            fetchSeats();
            setError('');
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
            fetchSeats();
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to unbook seat');
        }
    };

    // Count available seats
    const availableSeatsCount = seats.filter(seat => seat.isSeatAvailable).length;

    // Group and sort seats
    const seatsBySection = seats.reduce((acc, seat) => {
        const section = seat.seatNumber.charAt(0);
        if (!acc[section]) {
            acc[section] = [];
        }
        acc[section].push(seat);
        return acc;
    }, {});

    const sortedSections = Object.keys(seatsBySection).sort();

    sortedSections.forEach(section => {
        seatsBySection[section].sort((a, b) => {
            const numA = parseInt(a.seatNumber.slice(1));
            const numB = parseInt(b.seatNumber.slice(1));
            return numA - numB; // Changed to ascending order
        });
    });

    return (
        <div className="seat-main-container">
            <h1 className="booking-title">Seat Booking</h1>
            
            <div className="date-selector">
                <label htmlFor="date">Select Date:</label>
                <input
                    type="date"
                    id="date"
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                />
            </div>

            {error && <p className="error-message">{error}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}

            {loading && <div className="loading-spinner"></div>}

            {!loading && seats.length > 0 && (
                <div className="seat-display">
                    <p className="available-seats">Available Seats: <span className="seat-count">{availableSeatsCount}</span></p>
                    <div className="theater-container">
                        <div className="screen"></div>
                        {sortedSections.map(section => (
                            <div key={section} className="section">
                                <h3 className="section-title">Section {section}</h3>
                                <div className="seat-grid">
                                    <div className="seat-group left">
                                        {seatsBySection[section].slice(0, 10).map(seat => (
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
                                    <div className="seat-group right">
                                        {seatsBySection[section].slice(10).map(seat => (
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
                        ))}
                    </div>
                </div>
            )}

            {!loading && seats.length === 0 && <p className="no-seats-message">No seats available for the selected date.</p>}
        </div>
    );
};

export default SeatDisplay;