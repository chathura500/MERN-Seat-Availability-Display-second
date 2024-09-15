// src/components/NavBar.js
import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = ({ userRole }) => {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/home">Seat Booking</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        {/* Common Links */}
                        <li className="nav-item">
                            <Link className="nav-link" to="/home">Home</Link>
                        </li>

                        {/* Admin Links */}
                        {userRole === 'admin' && (
                            <li className="nav-item">
                                <Link className="nav-link" to="/admin">Admin Panel</Link>
                            </li>
                        )}

                         {/* User-specific Links */}
                         {userRole === 'user' && (
                            <>
                                 <li className="nav-item">
                                    <Link className="nav-link" to="/seats">Book Seats</Link> {/* Add this link */}
                                </li>
                                
                                <li className="nav-item">
                                    <Link className="nav-link" to="/user-profile">Profile</Link>
                                </li>
                               
                            </>
                        )}

                        {/* Logout */}
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Logout</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
