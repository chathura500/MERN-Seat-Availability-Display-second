import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './NavBar.css'; // Custom CSS file

const NavBar = ({ userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    axios.post("http://localhost:4000/logout", {}, { withCredentials: true })
      .then(() => {
        navigate("/"); // Redirect after successful logout
      })
      .catch((err) => console.log(err));
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close the offcanvas when window is resized to a width larger than 768px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) {
        setIsOpen(false); // Close offcanvas in large screens
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link className="navbar-brand" to="/home">Seat Booking</Link>

        {/* Normal navbar links - hidden in mobile view */}
        <div className={`navbar-links ${isOpen ? 'hide-links' : ''}`}>
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/home">Home</Link>
            </li>

            {userRole === 'admin' && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin">Admin Panel</Link>
              </li>
            )}

            {userRole === 'user' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/seats">Book Seats</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/user-profile">Profile</Link>
                </li>
              </>
            )}

            <li className="nav-item">
              <button className="nav-link logout-btn" onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </div>

        {/* Toggler for offcanvas menu */}
        <button className="navbar-toggler" onClick={toggleMenu}>
          &#9776; {/* Unicode character for hamburger icon */}
        </button>

        {/* Off-canvas menu for mobile view */}
        <div className={`offcanvas ${isOpen ? 'show' : ''}`}>
          <div className="offcanvas-header">
            <h5 className="offcanvas-title">Menu</h5>
          </div>
          <ul className="offcanvas-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/home" onClick={toggleMenu}>Home</Link>
            </li>

            {userRole === 'admin' && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin" onClick={toggleMenu}>Admin Panel</Link>
              </li>
            )}

            {userRole === 'user' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/seats" onClick={toggleMenu}>Book Seats</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/user-profile" onClick={toggleMenu}>Profile</Link>
                </li>
              </>
            )}

            <li className="nav-item">
              <button className="nav-link logout-btn" onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
