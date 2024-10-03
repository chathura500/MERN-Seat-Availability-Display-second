import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

const GoogleLoginButton = ({ onSuccess, onFailure }) => {
    const handleLoginSuccess = (credentialResponse) => {
        if (onSuccess) {
            onSuccess(credentialResponse); // Call the onSuccess prop if it's a function
        }
    };

    const handleLoginFailure = (error) => {
        if (onFailure) {
            onFailure(error); // Call the onFailure prop if it's a function
        }
    };

    return (
        <GoogleLogin
            onSuccess={handleLoginSuccess}
            onFailure={handleLoginFailure}
            logo="path/to/logo.png" // Replace with actual logo path if needed
            style={{ width: '100%' }}
        />
    );
};

export default GoogleLoginButton;
