// src/components/NavBar.js
import React, { useState } from 'react';
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

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link className="navbar-brand" to="/home">Seat Booking</Link>

        <div className={`navbar-links ${isOpen ? 'open' : ''}`}>
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

        <button className="navbar-toggler" onClick={toggleMenu}>
          &#9776; {/* Unicode character for hamburger icon */}
        </button>

        {/* Off-canvas menu for mobile view */}
        <div className={`offcanvas ${isOpen ? 'show' : ''}`}>
          <div className="offcanvas-header">
            <h5 className="offcanvas-title">Menu</h5>
            <button className="btn-close" onClick={toggleMenu}>
              &times;
            </button>
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
