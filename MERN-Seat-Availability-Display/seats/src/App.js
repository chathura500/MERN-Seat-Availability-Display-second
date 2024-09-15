import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import AdminPanel from './components/AdminPanel';
import NavBar from './components/NavBar';
import UserProfile from './components/UserProfile'; 
import SeatDisplay from './components/SeatDisplay';

const App = () => {
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || ''); // Initialize from localStorage

    // Save userRole to localStorage whenever it changes
    useEffect(() => {
        if (userRole) {
            localStorage.setItem('userRole', userRole);
        }
    }, [userRole]);

    // Custom hook to check the current route
    const location = useLocation();
    
    // Don't show NavBar on login or register pages
    const hideNavBar = location.pathname === '/' || location.pathname === '/register';

    return (
        <div>
            {/* Conditionally render NavBar only when not on login or register pages */}
            {!hideNavBar && <NavBar userRole={userRole} />}
            <Routes>
                <Route path="/" element={<Login setUserRole={setUserRole} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={<Home />} />
                <Route path="/user-profile" element={<UserProfile />} /> {/* Add this route */}
                <Route path="/seats" element={<SeatDisplay />} />

                {/* Only allow access to AdminPanel if the user is an admin */}
                {userRole === 'admin' && <Route path="/admin" element={<AdminPanel />} />}
            </Routes>
        </div>
    );
};

const WrappedApp = () => (
    <Router>
        <App />
    </Router>
);

export default WrappedApp;
