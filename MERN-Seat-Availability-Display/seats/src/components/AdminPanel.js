import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminPanel.css';

const AdminPanel = () => {
  // State variables
  const [users, setUsers] = useState([]);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const todayDate = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayDate);

  const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatNumbers = Array.from({ length: 20 }, (_, i) => i + 1);

  const [creatingSeats, setCreatingSeats] = useState({});
  const [deletingSeats, setDeletingSeats] = useState({});

  // Fetch users and seats data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userResponse, seatResponse] = await Promise.all([
          axios.get(`http://localhost:4000/api/user/users-with-bookings`, {
            params: { date },
            withCredentials: true,
          }),
          axios.get(`http://localhost:4000/api/booking/seats`, {
            params: { date },
            withCredentials: true,
          }),
        ]);

        setUsers(userResponse.data);
        setSeats(seatResponse.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date]);

  // Sort seats alphabetically and numerically
  const sortedSeats = [...seats].sort((a, b) => {
    const [aLetter, aNumber] = a.seatNumber.split('-');
    const [bLetter, bNumber] = b.seatNumber.split('-');
    return aLetter.localeCompare(bLetter) || parseInt(aNumber) - parseInt(bNumber);
  });

  // Function to unbook a seat
  const handleUnbook = async (seatId) => {
    try {
      await axios.patch(
        `http://localhost:4000/api/booking/seats/unbook/${seatId}`,
        {},
        {
          withCredentials: true,
        }
      );
      setUsers((prevUsers) =>
        prevUsers.map((user) => ({
          ...user,
          bookings: user.bookings.filter((booking) => booking._id !== seatId),
        }))
      );
    } catch (err) {
      setError('Failed to unbook seat');
    }
  };

  // Function to create seats for a row
  const handleCreateRowSeats = async (letter) => {
    if (creatingSeats[letter]) return;
    setCreatingSeats((prev) => ({ ...prev, [letter]: true }));

    const formattedSeats = seatNumbers.map((number) => `${letter}-${number}`);
    const seatsToCreate = formattedSeats.filter(
      (seatId) => !seats.some((seat) => seat.seatNumber === seatId)
    );

    if (seatsToCreate.length === 0) {
      setError(`All seats in row ${letter} already exist`);
      setCreatingSeats((prev) => ({ ...prev, [letter]: false }));
      return;
    }

    try {
      const seatRequests = seatsToCreate.map((seatId) =>
        axios.post(
          'http://localhost:4000/api/booking/seats',
          {
            seatNumber: seatId,
            date,
          },
          {
            withCredentials: true,
          }
        )
      );

      const responses = await Promise.all(seatRequests);
      const newSeats = responses.map((res) => res.data);

      setSeats((prevSeats) => [...prevSeats, ...newSeats]);
      setError(null);
    } catch (err) {
      setError(`Failed to create some seats for row ${letter}`);
    } finally {
      setCreatingSeats((prev) => ({ ...prev, [letter]: false }));
    }
  };

  // Function to delete seats for a row
  const handleDeleteRowSeats = async (letter) => {
    if (deletingSeats[letter]) return;

    const confirmation = window.prompt(`Type "DELETE" to confirm deletion of row ${letter}`);
    if (confirmation !== 'DELETE') {
      setError('Row deletion canceled');
      return;
    }

    setDeletingSeats((prev) => ({ ...prev, [letter]: true }));

    const seatsToDelete = seats.filter((seat) => seat.seatNumber.startsWith(letter));

    if (seatsToDelete.length === 0) {
      setError(`No seats found for row ${letter}`);
      setDeletingSeats((prev) => ({ ...prev, [letter]: false }));
      return;
    }

    try {
      const deleteRequests = seatsToDelete.map((seat) =>
        axios.delete(`http://localhost:4000/api/booking/seats/${seat._id}`, {
          withCredentials: true,
        })
      );

      await Promise.all(deleteRequests);

      setSeats((prevSeats) => prevSeats.filter((seat) => !seat.seatNumber.startsWith(letter)));
      setError(null);
    } catch (err) {
      setError(`Failed to delete some seats in row ${letter}`);
    } finally {
      setDeletingSeats((prev) => ({ ...prev, [letter]: false }));
    }
  };

  // *** Move handleDeleteSeat function before SeatDropdown ***
  const handleDeleteSeat = async (seatId) => {
    try {
      await axios.delete(`http://localhost:4000/api/booking/seats/${seatId}`, {
        withCredentials: true,
      });
      setSeats((prevSeats) => prevSeats.filter((seat) => seat._id !== seatId));
    } catch (err) {
      setError('Failed to delete seat');
    }
  };

  // SeatDropdown component
  const SeatDropdown = ({ letter, seats }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="seat-dropdown">
        <button className="buton dropdownbuton" onClick={() => setIsOpen(!isOpen)}>
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
              {seats.map((seat) => (
                <tr key={seat._id}>
                  <td>{seat.seatNumber}</td>
                  <td>
                    <button
                      className="buton butondelseat"
                      onClick={() => handleDeleteSeat(seat._id)}
                    >
                      Delete Seat
                    </button>
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

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>

      {error && <p className="error-message">{error}</p>}

      <label htmlFor="date">Select Date:</label>
      <input
        type="date"
        id="date"
        value={date}
        min={todayDate}
        onChange={(e) => setDate(e.target.value)}
      />

      <div>
        <h2>Create Row Seats</h2>
        <div className="butonarrange">
          {seatLetters.map((letter) => (
            <button
              className="buton"
              key={letter}
              onClick={() => handleCreateRowSeats(letter)}
              disabled={creatingSeats[letter]}
            >
              {creatingSeats[letter] ? 'Creating...' : `Create Seats ${letter}-1 to ${letter}-20`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2>Delete Row Seats</h2>
        <div className="butonarrange">
          {seatLetters.map((letter) => (
            <button
              className="buton butondelete"
              key={letter}
              onClick={() => handleDeleteRowSeats(letter)}
              disabled={deletingSeats[letter]}
            >
              {deletingSeats[letter] ? 'Deleting...' : `Delete All Seats in Row ${letter}`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2>Seats List</h2>
        <div className="seat-dropdowns-container">
          {seatLetters.map((letter) => {
            const seatsForRow = sortedSeats.filter((seat) => seat.seatNumber.startsWith(letter));
            return (
              <SeatDropdown key={letter} letter={letter} seats={seatsForRow} />
            );
          })}
        </div>
      </div>

      <div>
        <h2>Users and Bookings</h2>
        <table className="users-bookings-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email</th>
              <th>Booked Seats</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td data-label="User Name">{user.name}</td>
                <td data-label="Email">{user.email}</td>
                <td data-label="Booked Seats">
                  {user.bookings.map((b) => b.seatNumber).join(', ')}
                </td>
                <td data-label="Actions">
                  {user.bookings.map((booking) => (
                    <button
                      key={booking._id}
                      onClick={() => handleUnbook(booking._id)}
                      className="buton-unbook"
                    >
                      Unbook {booking.seatNumber}
                    </button>
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
