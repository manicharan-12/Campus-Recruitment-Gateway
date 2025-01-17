import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { token, role } = useSelector((state) => state.auth);
  
  // If no token, redirect to the appropriate login page based on role
  if (!token) {
    if (allowedRoles.includes("Admin") || allowedRoles.includes("Super Admin")) {
      return <Navigate to="/login/admin" />;
    } else if (allowedRoles.includes("Head") || allowedRoles.includes("Coordinator")) {
      return <Navigate to="/login/faculty" />;
    } else {
      return <Navigate to="/login/student" />;
    }
  }

  // If the token exists, but the role does not match, redirect to a different route
  if (token && !allowedRoles.includes(role)) {
    // If the role does not match, redirect based on the current user's role
    switch (role) {
      case "Super Admin":
      case "Admin":
        return <Navigate to="/admin/dashboard" />;
      case "Head":
      case "Coordinator":
        return <Navigate to="/faculty/dashboard" />;
      case "Student":
        return <Navigate to="/student/dashboard" />;
      default:
        return <Navigate to="/" />;
    }
  }

  // If authorized, render the children components
  return <>{children}</>;
};

export default ProtectedRoute;
