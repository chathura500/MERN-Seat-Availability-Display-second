import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [seats, setSeats] = useState([]); // State for seats
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [date, setDate] = useState('2024-09-18'); // Set the default date or provide a way to select it

    // State for creating a new seat
    const [seatLetter, setSeatLetter] = useState('');
    const [seatNumber, setSeatNumber] = useState('');
    const [seatLetters, setSeatLetters] = useState(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']); // Example letters
    const [seatNumbers, setSeatNumbers] = useState(Array.from({ length: 20 }, (_, i) => i + 1)); // Example numbers

    useEffect(() => {
        // Fetch users and their seat bookings
        const fetchData = async () => {
            try {
                const userResponse = await axios.get(`http://localhost:4000/api/user/users-with-bookings?date=${date}`, {
                    withCredentials: true, // Include cookies with request
                });
                setUsers(userResponse.data);

                const seatResponse = await axios.get(`http://localhost:4000/api/booking/seats?date=${date}`, {
                    withCredentials: true, // Include cookies with request
                });
                setSeats(seatResponse.data);

                setLoading(false);
            } catch (err) {
                setError('Failed to fetch data');
                setLoading(false);
            }
        };

        fetchData();
    }, [date]); // Re-fetch data when the date changes

    const handleUnbook = async (seatId) => {
        try {
            await axios.patch(`http://localhost:4000/api/booking/seats/unbook/${seatId}`, {}, {
                withCredentials: true, // Include cookies with request
            });
            // Optionally, refetch the users or update the state to reflect changes
            setUsers(users.map(user => ({
                ...user,
                bookings: user.bookings.filter(booking => booking._id !== seatId)
            })));
        } catch (err) {
            setError('Failed to unbook seat');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    const handleCreateSeat = async () => {
        try {
            const seatId = `${seatLetter}-${seatNumber}`;
            await axios.post('http://localhost:4000/api/booking/seats', {
                seatNumber: seatId,
                date
            }, {
                withCredentials: true, // Include cookies with request
            });
            // Optionally, refetch the seats or update the state to reflect changes
            setSeatLetter('');
            setSeatNumber('');
            // Re-fetch seats data
            const seatResponse = await axios.get(`http://localhost:4000/api/booking/seats?date=${date}`, {
                withCredentials: true,
            });
            setSeats(seatResponse.data);
        } catch (err) {
            setError('Failed to create seat');
        }
    };

    const handleDeleteSeat = async (seatId) => {
        try {
            await axios.delete(`http://localhost:4000/api/booking/seats/${seatId}`, {
                withCredentials: true, // Include cookies with request
            });
            // Optionally, refetch the seats or update the state to reflect changes
            setSeats(seats.filter(seat => seat._id !== seatId));
        } catch (err) {
            setError('Failed to delete seat');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="admin-panel">
            <h1>Admin Panel</h1>
            <label htmlFor="date">Select Date:</label>
            <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
            />
            <div>
                <h2>Create Seat</h2>
                <label htmlFor="seatLetter">Seat Letter:</label>
                <select
                    id="seatLetter"
                    value={seatLetter}
                    onChange={(e) => setSeatLetter(e.target.value)}
                >
                    <option value="">Select Letter</option>
                    {seatLetters.map(letter => (
                        <option key={letter} value={letter}>{letter}</option>
                    ))}
                </select>
                <label htmlFor="seatNumber">Seat Number:</label>
                <select
                    id="seatNumber"
                    value={seatNumber}
                    onChange={(e) => setSeatNumber(e.target.value)}
                >
                    <option value="">Select Number</option>
                    {seatNumbers.map(number => (
                        <option key={number} value={number}>{number}</option>
                    ))}
                </select>
                <button onClick={handleCreateSeat}>Create Seat</button>
            </div>
            <div>
                <h2>Seats List</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Seat Number</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {seats.map(seat => (
                            <tr key={seat._id}>
                                <td>{seat.seatNumber}</td>
                                <td>
                                    <button onClick={() => handleDeleteSeat(seat._id)}>Delete Seat</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div>
                <h2>Users and Bookings</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Booked Seats</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>
                                    {user.bookings.length > 0 ? (
                                        user.bookings.map((booking, index) => (
                                            <div key={index}>
                                                Seat Number: {booking.seatNumber}, Date: {new Date(booking.date).toLocaleDateString()}
                                            </div>
                                        ))
                                    ) : (
                                        <span>No bookings</span>
                                    )}
                                </td>
                                <td>
                                    {user.bookings.length > 0 && user.bookings.map(booking => (
                                        <div key={booking._id}>
                                            <button
                                                onClick={() => handleUnbook(booking._id)}
                                            >
                                                Unbook Seat {booking.seatNumber}
                                            </button>
                                        </div>
                                    ))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPanel;
