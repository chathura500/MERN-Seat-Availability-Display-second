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

    // Sort seats by seatNumber in alphabetical and numerical order
    const sortedSeats = seats.sort((a, b) => {
        const [aLetter, aNumber] = a.seatNumber.split('-');
        const [bLetter, bNumber] = b.seatNumber.split('-');
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
            // Update the users' state to reflect the unbooked seat
            setUsers(users.map(user => ({
                ...user,
                bookings: user.bookings.filter(booking => booking._id !== seatId)
            })));
        } catch (err) {
            setError('Failed to unbook seat');
        }
    };

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

            // Clear the seat selection fields
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

    const handleDeleteSeat = async (seatId) => {
        try {
            await axios.delete(`http://localhost:4000/api/booking/seats/${seatId}`, {
                withCredentials: true, // Include cookies with request
            });
            // Remove the deleted seat from the seats array
            setSeats(seats.filter(seat => seat._id !== seatId));
        } catch (err) {
            setError('Failed to delete seat');
        }
    };

    const handleBulkCreateSeats = async () => {
        if (!bulkSeats) {
            setError('Please enter seat numbers to create in bulk');
            return;
        }

        const seatList = bulkSeats.split(',').map(seat => seat.trim());

        const formattedSeats = seatList.map(seat => {
            const letter = seat[0].toUpperCase();
            const number = seat.slice(1);

            if (!seatLetters.includes(letter) || number === '' || isNaN(number)) {
                setError(`Invalid seat format: ${seat}`);
                return null;
            }

            return `${letter}-${number}`;
        }).filter(Boolean);

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
            const seatRequests = formattedSeats.map(seatId => axios.post('http://localhost:4000/api/booking/seats', {
                seatNumber: seatId,
                date
            }, {
                withCredentials: true,
            }));

            await Promise.all(seatRequests);

            setBulkSeats('');
            setError(null);

            const seatResponse = await axios.get(`http://localhost:4000/api/booking/seats?date=${date}`, {
                withCredentials: true,
            });
            setSeats(seatResponse.data);

        } catch (err) {
            setError('Failed to create seats in bulk');
        }
    };

    const handleCreateRowSeats = async (letter) => {
        const formattedSeats = seatNumbers.map((number) => `${letter}-${number}`);

        const seatsToCreate = formattedSeats.filter(seatId => !seats.some(seat => seat.seatNumber === seatId));

        if (seatsToCreate.length === 0) {
            setError(`All seats in row ${letter} already exist`);
            return;
        }

        try {
            const seatRequests = seatsToCreate.map(seatId => axios.post('http://localhost:4000/api/booking/seats', {
                seatNumber: seatId,
                date
            }, {
                withCredentials: true,
            }));

            await Promise.all(seatRequests);

            const seatResponse = await axios.get(`http://localhost:4000/api/booking/seats?date=${date}`, {
                withCredentials: true,
            });
            setSeats(seatResponse.data);
            setError(null);

        } catch (err) {
            setError(`Failed to create some seats for row ${letter}`);
        }
    };

    // Seat dropdown component for each letter row
    const SeatDropdown = ({ letter, seats, handleDeleteSeat }) => {
        const [isOpen, setIsOpen] = useState(false);

        return (
            <div className="seat-dropdown">
                <button onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? `Hide Seats for ${letter}` : `Show Seats for ${letter}`}
                </button>
                {isOpen && (
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
                )}
            </div>
        );
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
                <h2>Create Row Seats</h2>
                {seatLetters.map((letter) => (
                    <button key={letter} onClick={() => handleCreateRowSeats(letter)}>
                        Create Seats {letter}-1 to {letter}-20
                    </button>
                ))}
            </div>

            <div>
                <h2>Seats List</h2>
                {seatLetters.map(letter => {
                    const seatsForRow = sortedSeats.filter(seat => seat.seatNumber.startsWith(letter));
                    return (
                        <SeatDropdown 
                            key={letter} 
                            letter={letter} 
                            seats={seatsForRow} 
                            handleDeleteSeat={handleDeleteSeat} 
                        />
                    );
                })}
            </div>

            {/* <div>
                <h2>Create Seat</h2>
                <label>Seat Letter:</label>
                <select value={seatLetter} onChange={(e) => setSeatLetter(e.target.value)}>
                    <option value="">Select a letter</option>
                    {seatLetters.map((letter) => (
                        <option key={letter} value={letter}>{letter}</option>
                    ))}
                </select>

                <label>Seat Number:</label>
                <select value={seatNumber} onChange={(e) => setSeatNumber(e.target.value)}>
                    <option value="">Select a number</option>
                    {seatNumbers.map((number) => (
                        <option key={number} value={number}>{number}</option>
                    ))}
                </select>

                <button onClick={handleCreateSeat}>Create Seat</button>
            </div> */}

            {/* <div>
                <h2>Bulk Create Seats</h2>
                <label htmlFor="bulkSeats">Enter seats (e.g., A1, B2, C3):</label>
                <input
                    type="text"
                    id="bulkSeats"
                    value={bulkSeats}
                    onChange={(e) => setBulkSeats(e.target.value)}
                />
                <button onClick={handleBulkCreateSeats}>Create Seats in Bulk</button>
            </div> */}

            <div>
                <h2>Users and Bookings</h2>
                <table>
                    <thead>
                        <tr>
                            <th>User Name</th>
                            <th>Email</th>
                            <th>Booked Seats</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    {user.bookings.map(booking => (
                                        <span key={booking._id}>
                                            {booking.seatNumber}
                                            <button onClick={() => handleUnbook(booking._id)}>Unbook</button>
                                        </span>
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
