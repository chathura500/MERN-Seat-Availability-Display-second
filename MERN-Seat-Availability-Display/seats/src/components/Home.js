import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HomePage.css';

const Home = () => {
  // Get today's date in 'YYYY-MM-DD' format
  const todayDate = new Date().toISOString().split('T')[0];

  // State variables
  const [date, setDate] = useState(todayDate);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch seats data for the selected date
  const fetchSeats = async (selectedDate) => {
    setLoading(true);
    setError(''); // Clear previous errors
    try {
      const response = await axios.get('http://localhost:4000/api/booking/seats', {
        params: { date: selectedDate },
        withCredentials: true,
      });
      setSeats(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch seat details');
      setSeats([]); // Clear seats data on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch seats when the component mounts or when the date changes
  useEffect(() => {
    fetchSeats(date);
  }, [date]);

  // Handle date change
  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  // Calculate seat counts
  const totalSeats = seats.length;
  const availableSeats = seats.filter((seat) => seat.isSeatAvailable).length;
  const bookedSeats = totalSeats - availableSeats;

  return (
    <div className="home-page">
      <div className="container text-center">
        <h1>Welcome to the Seat Booking System!</h1>

        {/* Date picker */}
        <div className="form-group">
          <label htmlFor="date" className="mb-2">
            Select Date:
          </label>
          <input
            type="date"
            id="date"
            className="form-control"
            value={date}
            onChange={handleDateChange}
            min={todayDate} // Prevent selection of past dates
            style={{ maxWidth: '300px', margin: '0 auto' }}
          />
        </div>

        {/* Display loading, error, or seat counts */}
        {loading ? (
          <div className="text-center mt-5">Loading...</div>
        ) : error ? (
          <div className="alert alert-danger mt-5">Error: {error}</div>
        ) : (
          <div className="row mt-5">
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
