import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';

const PrivateRoute = ({ Component }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Component /> : <Navigate to="/login" />;
};
export default PrivateRoute;
