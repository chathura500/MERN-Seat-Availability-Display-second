import React from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const AdminProtectedRoute = ({ children }) => {
  const [authenticated, setAuthenticated] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    axios.get('http://localhost:4000/admin', { withCredentials: true })
      .then((response) => {
        if (response.data.data === "Admin access granted") {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      })
      .catch((error) => {
        setAuthenticated(false);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminProtectedRoute;
