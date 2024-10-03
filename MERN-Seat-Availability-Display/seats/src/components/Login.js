// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import GoogleLoginButton from './GoogleLoginButton'; // Import the GoogleLoginButton

const Login = ({ setUserRole }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:4000/login', { email, password }, { withCredentials: true });
            console.log(response);
            if (response.data.data === "Admin Success") {
                setUserRole('admin'); // Set the role to admin
                navigate('/admin');
            } else {
                setUserRole('user'); // Set the role to user
                navigate('/home');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred');
        }
    };

    const handleGoogleLoginSuccess = async (credentialResponse) => {
        try {
            // Send the token to your backend for verification
            const response = await axios.post('http://localhost:4000/auth/google', {
                id_token: credentialResponse.credential,
            }, { withCredentials: true });
            console.log(response);
            if (response.data.data === "Admin Success") {
                setUserRole('admin'); // Set the role to admin
                navigate('/admin');
            } else {
                setUserRole('user'); // Set the role to user
                navigate('/home');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred during Google login');
        }
    };

    const handleGoogleLoginFailure = (error) => {
        setError('Google login failed: ' + error);
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%" }}>
                <h2 className="text-center mb-4">Login</h2>
                {error && <p className="text-danger text-center">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 mb-3">Login</button>
                </form>
                <p className="text-center mt-3">Don't have an account?</p>
                <Link
                    to="/register"
                    className="btn btn-success w-100 text-decoration-none"
                >
                    Signup
                </Link>
                <GoogleLoginButton 
                    onSuccess={handleGoogleLoginSuccess} 
                    onFailure={handleGoogleLoginFailure} 
                />
            </div>
        </div>
    );
};

export default Login;
