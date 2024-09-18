import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/user/profile', {
                    params: { date },
                    withCredentials: true
                });
                setUser(response.data.user);
                setBookings(response.data.bookings);
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
            }
        };

        fetchUserProfile();
    }, [date]); // Refetch when the date changes

    const handleDateChange = (event) => {
        setDate(event.target.value);
    };

    return (
        <div>
            <h1>User Profile</h1>
            {user ? (
                <div>
                    <h2>{user.name}</h2>
                    <p>ID: {user._id}</p> {/* Display the user ID */}
                    <p>Email: {user.email}</p>
                    <p>Role: {user.role}</p>
                    
                    <div>
                        <label htmlFor="date">Select Date: </label>
                        <input
                            type="date"
                            id="date"
                            value={date}
                            onChange={handleDateChange}
                        />
                    </div>

                    <h3>Booked Seats for {date}:</h3>
                    {bookings.length > 0 ? (
                        <ul>
                            {bookings.map((booking) => (
                                <li key={booking._id}>
                                    Seat Number: {booking.seatNumber} - Status: {booking.isSeatAvailable ? 'Available' : 'Booked'}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No bookings for this date.</p>
                    )}
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default UserProfile;
