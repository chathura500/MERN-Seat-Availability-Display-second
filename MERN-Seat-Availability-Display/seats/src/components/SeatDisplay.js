import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './SeatList.css';

const SeatDisplay = () => {
  const todayDate = new Date().toISOString().split('T')[0];
  const [seats, setSeats] = useState([]);
  const [date, setDate] = useState(todayDate);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch seats for the selected date
  const fetchSeats = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await axios.get('http://localhost:4000/api/booking/seats', {
        params: { date },
        withCredentials: true,
      });
      setSeats(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch seat details');
      setSeats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  // Book selected seat
  const bookSeat = async (seatId) => {
    setError('');
    setSuccessMessage('');
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/booking/seats/book/${seatId}`,
        { date },
        { withCredentials: true }
      );
      setSuccessMessage(response.data.message || 'Seat booked successfully!');
      // Update the seat state directly
      setSeats((prevSeats) =>
        prevSeats.map((seat) =>
          seat._id === seatId ? { ...seat, isSeatAvailable: false } : seat
        )
      );
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to book seat');
    }
  };

  // Unbook selected seat
  const unbookSeat = async (seatId) => {
    setError('');
    setSuccessMessage('');
    try {
      const response = await axios.patch(
        `http://localhost:4000/api/booking/seats/unbook/${seatId}`,
        { date },
        { withCredentials: true }
      );
      setSuccessMessage(response.data.message || 'Seat unbooked successfully!');
      // Update the seat state directly
      setSeats((prevSeats) =>
        prevSeats.map((seat) =>
          seat._id === seatId ? { ...seat, isSeatAvailable: true } : seat
        )
      );
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to unbook seat');
    }
  };

  // Memoized calculation of available seats
  const availableSeatsCount = useMemo(
    () => seats.filter((seat) => seat.isSeatAvailable).length,
    [seats]
  );

  // Group and sort seats by sections
  const sections = useMemo(() => {
    const sectionsMap = seats.reduce((acc, seat) => {
      const section = seat.seatNumber.charAt(0);
      if (!acc[section]) {
        acc[section] = [];
      }
      acc[section].push(seat);
      return acc;
    }, {});

    return Object.keys(sectionsMap)
      .sort()
      .map((section) => ({
        section,
        seats: sectionsMap[section].sort((a, b) => {
          const numA = parseInt(a.seatNumber.slice(1));
          const numB = parseInt(b.seatNumber.slice(1));
          return numA - numB;
        }),
      }));
  }, [seats]);

  // Handle date change
  const handleDateChange = (e) => {
    setDate(e.target.value);
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="seatmaincontainer container mt-4">
      <div className="smallcont">
        <h1 className="mb-4">Seat Booking</h1>
      </div>

      {/* Select Date */}
      <div className="row mb-4 text-center">
        <div className="col-md-6 mx-auto">
          <div className="form-group">
            <label htmlFor="date">Select Date:</label>
            <input
              type="date"
              id="date"
              className="form-control"
              value={date}
              min={todayDate}
              onChange={handleDateChange}
            />
          </div>
        </div>
      </div>

      {/* Show error or success messages */}
      {error && <p className="text-danger mt-2 text-center">{error}</p>}
      {successMessage && <p className="text-success mt-2 text-center">{successMessage}</p>}

      {/* Loading indicator */}
      {loading && (
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}

      {/* Seat List */}
      {!loading && seats.length > 0 && (
        <div className="seatset">
          <p className="text-center mb-4">
            Available Seats: <span className="badge">{availableSeatsCount}</span>
          </p>
          <div className="theater-container">
            <div className="screen mb-4"></div>
            {sections.map(({ section, seats }) => {
              const leftSeats = seats.slice(0, 10);
              const rightSeats = seats.slice(10);

              return (
                <div key={section} className="section mb-4">
                  <h3 className="section-title">Section {section}</h3>
                  <div className="seat-grid">
                    {/* Left Seats */}
                    <div className="seat-group">
                      {leftSeats.map((seat) => (
                        <div
                          key={seat._id}
                          className={`seat ${seat.isSeatAvailable ? 'available' : 'booked'}`}
                          onClick={() => {
                            if (seat.isSeatAvailable) {
                              bookSeat(seat._id);
                            } else if (
                              window.confirm(`Do you want to unbook seat ${seat.seatNumber}?`)
                            ) {
                              unbookSeat(seat._id);
                            }
                          }}
                        >
                          {seat.seatNumber}
                          <div className="seat-tooltip">
                            {seat.isSeatAvailable ? 'Available' : 'Booked'}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Right Seats */}
                    <div className="seat-group">
                      {rightSeats.map((seat) => (
                        <div
                          key={seat._id}
                          className={`seat ${seat.isSeatAvailable ? 'available' : 'booked'}`}
                          onClick={() => {
                            if (seat.isSeatAvailable) {
                              bookSeat(seat._id);
                            } else if (
                              window.confirm(`Do you want to unbook seat ${seat.seatNumber}?`)
                            ) {
                              unbookSeat(seat._id);
                            }
                          }}
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
      {!loading && seats.length === 0 && (
        <p className="text-center">No seats available for the selected date.</p>
      )}
    </div>
  );
};

export default SeatDisplay;
