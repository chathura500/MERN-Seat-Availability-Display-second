import React from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const [authenticated, setAuthenticated] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    axios.get('http://localhost:4000/home', { withCredentials: true })
      .then((response) => {
        console.log(response.data);  // Log response to see what you're getting
        if (response.data.data === "User access granted") {
          setAuthenticated(true);
        }
      })
      .catch((error) => {
        console.log(error);  // Log errors for debugging
        setAuthenticated(false);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while checking authentication
  }

  if (!authenticated) {
    return <Navigate to="/" />;
  }
  else{
  return children;} // If authenticated, show the protected component
};

export default ProtectedRoute;
