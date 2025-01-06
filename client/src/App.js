import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// Import login components
import AdminLogin from "./components/Admin/Login/Login";
import FacultyLogin from "./components/Faculty/Login/Login";
import StudentLogin from "./components/Student/Login/Login";

// Import layouts with sidebars
import AdminLayout from "./Layouts/AdminLayout";
import FacultyLayout from "./Layouts/FacultyLayout";
import StudentLayout from "./Layouts/StudentLayout";

import Dashboard from "./components/Admin/Dashboard";
import Team from "./components/Admin/Team";
import UniversityProfile from "./components/Shared/UniversityProfile/UniversityProfile";

// Function to check if user is authenticated
const isAuthenticated = () => {
  const token = Cookies.get("userCookie");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      Cookies.remove("userCookie");
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};

// Function to get user role from token
const getUserRole = () => {
  const token = Cookies.get("userCookie");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.role;
  } catch (error) {
    return null;
  }
};

// Protected Layout Component
const ProtectedLayout = ({ allowedRoles, layout: Layout }) => {
  const isAuth = isAuthenticated();
  const userRole = getUserRole();

  if (!isAuth) {
    // Redirect to appropriate login based on attempted access
    if (
      allowedRoles.includes("ADMIN") ||
      allowedRoles.includes("SUPER_ADMIN")
    ) {
      return <Navigate to="/login/admin" />;
    } else if (
      allowedRoles.includes("FACULTY") ||
      allowedRoles.includes("COORDINATOR")
    ) {
      return <Navigate to="/login/faculty" />;
    } else {
      return <Navigate to="/login/student" />;
    }
  }

  if (!allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    switch (userRole) {
      case "SUPER_ADMIN":
      case "ADMIN":
        return <Navigate to="/admin/dashboard" />;
      case "FACULTY":
      case "COORDINATOR":
        return <Navigate to="/faculty/dashboard" />;
      case "STUDENT":
        return <Navigate to="/student/dashboard" />;
      default:
        return <Navigate to="/" />;
    }
  }

  // Render the layout with nested routes
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

// Public Route Component (accessible only when not logged in)
const PublicRoute = ({ children }) => {
  const isAuth = isAuthenticated();
  const userRole = getUserRole();

  if (isAuth) {
    // Redirect to appropriate dashboard based on role
    switch (userRole) {
      case "SUPER_ADMIN":
      case "ADMIN":
        return <Navigate to="/admin/dashboard" />;
      case "FACULTY":
      case "COORDINATOR":
        return <Navigate to="/faculty/dashboard" />;
      case "STUDENT":
        return <Navigate to="/student/dashboard" />;
      default:
        return <Navigate to="/" />;
    }
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      {/* Public Routes (Login Pages) */}
      <Route
        path="/login/admin"
        element={
          <PublicRoute>
            <AdminLogin />
          </PublicRoute>
        }
      />
      <Route
        path="/login/faculty"
        element={
          <PublicRoute>
            <FacultyLogin />
          </PublicRoute>
        }
      />
      <Route
        path="/login/student"
        element={
          <PublicRoute>
            <StudentLogin />
          </PublicRoute>
        }
      />

      {/* Admin Routes with Layout */}
      <Route
        element={
          <ProtectedLayout
            allowedRoles={["SUPER_ADMIN", "ADMIN"]}
            layout={AdminLayout}
          />
        }
      >
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/team" element={<Team />} />
      </Route>

      {/* Faculty Routes with Layout */}
      <Route
        element={
          <ProtectedLayout
            allowedRoles={["FACULTY", "COORDINATOR"]}
            layout={FacultyLayout}
          />
        }
      ></Route>

      {/* Student Routes with Layout */}
      <Route
        element={
          <ProtectedLayout allowedRoles={["STUDENT"]} layout={StudentLayout} />
        }
      ></Route>

      {/* Common Routes (accessible by all authenticated users) */}
      <Route
        path="/university/:id"
        element={
          <ProtectedLayout
            element={<UniversityProfile />}
            allowedRoles={[
              "SUPER_ADMIN",
              "ADMIN",
              "FACULTY",
              "COORDINATOR",
              "STUDENT",
            ]}
          />
        }
      />

      {/* Redirect unauthorized access to login */}
      <Route path="/" element={<Navigate to="/login/student" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
