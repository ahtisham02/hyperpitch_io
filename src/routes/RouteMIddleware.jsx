import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RouteMiddleware = ({ children, isAuthRequired = false, isGuestOnly = false }) => {
  const userToken = useSelector((state) => state.auth.userToken);   

  const location = useLocation();

  if (isAuthRequired) {
    if (!userToken) { 
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
  }

  if (isGuestOnly) {
    if (userToken) { 
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  }

  return children;
};

export default RouteMiddleware;