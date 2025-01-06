import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = ({ children, requiredPermission }) => {
  const location = useLocation();
  const { userRole, hasPermission } = useAuth();

  if (!userRole) {
    // Get base route type from current path
    const baseType = location.pathname.split("/")[1] || "student";
    const routeKey = baseType.toUpperCase();
    return (
      <Navigate
        to={ROUTES[routeKey]?.login || ROUTES.STUDENT.login}
        state={{ from: location }}
        replace
      />
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    const baseRole = userRole.replace(/^(SUPER_|COORDINATOR_)/, "");
    return <Navigate to={ROUTES[baseRole].dashboard} replace />;
  }

  return children;
};

export default ProtectedRoute;
