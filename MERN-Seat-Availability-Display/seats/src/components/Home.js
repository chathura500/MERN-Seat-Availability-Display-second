import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HomePage.css'; // Use your existing CSS file for styling


const Home = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today's date
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchSeats = async (selectedDate) => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:4000/api/booking/seats', {
                params: { date: selectedDate },
                withCredentials: true,
            });
            setSeats(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch seat details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (date) {
            fetchSeats(date);
        }
    }, [date]);

    const handleDateChange = (e) => {
        setDate(e.target.value);
    };

    const totalSeats = seats.length;
    const availableSeats = seats.filter((seat) => seat.isSeatAvailable).length;
    const bookedSeats = totalSeats - availableSeats;

    return (
        <div className="home-page">
            <div className="container text-center">
                <h1>Welcome to the Seat Booking System!</h1>

                {/* Date picker for selecting date */}
                <div className="form-group">
                    <label htmlFor="date" className="mb-2">Select Date:</label>
                    <input
                        type="date"
                        id="date"
                        className="form-control"
                        value={date}
                        onChange={handleDateChange}
                        min={new Date().toISOString().split('T')[0]}
                        style={{ maxWidth: '300px', margin: '0 auto' }}
                    />
                </div>

                {/* Display loading, error, or seat counts */}
                {loading ? (
                    <div className="text-center mt-5">Loading...</div>
                ) : error ? (
                    <div className="alert alert-danger mt-5">Error: {error}</div>
                ) : (
                    <div className="row ">
                        <div className="col-md-4">
                            <div className="card p-3 mb-3">
                                <h3>Total Seats</h3>
                                <p className="display-4">{totalSeats}</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card p-3 mb-3">
                                <h3>Booked Seats</h3>
                                <p className="display-4 text-danger">{bookedSeats}</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card p-3 mb-3">
                                <h3>Available Seats</h3>
                                <p className="display-4 text-success">{availableSeats}</p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Home;
