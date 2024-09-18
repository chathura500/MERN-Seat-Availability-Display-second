import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminPanel.css';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [seats, setSeats] = useState([]); // State for seats
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [date, setDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0]; // Returns the date in 'YYYY-MM-DD' format
    });// Set the default date or provide a way to select it

    // State for creating a new seat
    const [seatLetter, setSeatLetter] = useState('');
    const [seatNumber, setSeatNumber] = useState('');
    const [seatLetters, setSeatLetters] = useState(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']); // Example letters
    const [seatNumbers, setSeatNumbers] = useState(Array.from({ length: 20 }, (_, i) => i + 1)); // Example numbers
    const [bulkSeats, setBulkSeats] = useState(''); // For inputting seats in bulk
    const sortedSeats = seats.sort((a, b) => {
        // Extract seat letters and numbers
        const [aLetter, aNumber] = a.seatNumber.split('-');
        const [bLetter, bNumber] = b.seatNumber.split('-');
    
        // Compare letters alphabetically
        return aLetter.localeCompare(bLetter) || aNumber - bNumber;
    });
    


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
        // Ensure both seatLetter and seatNumber are selected
        if (!seatLetter || !seatNumber) {
            window.alert('Please select both a seat letter and number');
            return;
        }

        try {
            const seatId = `${seatLetter}-${seatNumber}`;

            // Check if the seat already exists for the selected date
            if (seats.some(seat => seat.seatNumber === seatId)) {
                window.alert(`Seat ${seatId} already exists for ${date}`);
                return;
            }

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
            window.alert('Failed to create seat');
        }
    };

    const handleBulkCreateSeats = async () => {
        if (!bulkSeats) {
            setError('Please enter seat numbers to create in bulk');
            return;
        }
    
        // Split the input into individual seat strings, e.g., "A1,A2,B3" => ["A1", "A2", "B3"]
        const seatList = bulkSeats.split(',').map(seat => seat.trim());
    
        // Ensure all seat IDs are in the correct format (e.g., "A1" becomes "A-1")
        const formattedSeats = seatList.map(seat => {
            const letter = seat[0].toUpperCase(); // Extract the seat letter (first character)
            const number = seat.slice(1);         // Extract the seat number (remaining characters)
    
            // Check if the seat is valid
            if (!seatLetters.includes(letter) || number === '' || isNaN(number)) {
                setError(`Invalid seat format: ${seat}`);
                return null;
            }   
    
            return `${letter}-${number}`; // Format the seat correctly as "Letter-Number" (e.g., "A-1")
        }).filter(Boolean); // Remove any invalid entries
    
        if (formattedSeats.length === 0) {
            setError('Please enter valid seat formats');
            return;
        }
    
        const existingSeats = formattedSeats.filter(seatId => seats.some(seat => seat.seatNumber === seatId));
    
        if (existingSeats.length > 0) {
            setError(`The following seats already exist: ${existingSeats.join(', ')}`);
            return;
        }
    
        try {
            // Bulk API requests for each formatted seat
            const seatRequests = formattedSeats.map(seatId => axios.post('http://localhost:4000/api/booking/seats', {
                seatNumber: seatId,
                date
            }, {
                withCredentials: true,
            }));
    
            await Promise.all(seatRequests); // Send all requests concurrently
    
            // Clear input and error
            setBulkSeats('');
            setError(null);
    
            // Refetch seat data
            const seatResponse = await axios.get(`http://localhost:4000/api/booking/seats?date=${date}`, {
                withCredentials: true,
            });
            setSeats(seatResponse.data);
    
        } catch (err) {
            setError('Failed to create seats in bulk');
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
                min={new Date().toISOString().split('T')[0]} // Disable past dates
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
                <h2>Bulk Create Seats</h2>
                <label htmlFor="bulkSeats">Enter Seats (e.g., A1,A2,B3,B5):</label>
                <input
                    type="text"
                    id="bulkSeats"
                    value={bulkSeats}
                    onChange={(e) => setBulkSeats(e.target.value)}
                />
                <button onClick={handleBulkCreateSeats}>Create Bulk Seats</button>
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
                        {sortedSeats.map(seat => (
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
