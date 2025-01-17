import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { initializeAuth } from "./redux/authSlice";

// Import Login Components
import AdminLogin from "./components/Admin/Login/Login";
import FacultyLogin from "./components/Faculty/Login/Login";
import StudentLogin from "./components/Student/Login/Login";

// Import Layouts and Components
import AdminLayout from "./layouts/AdminLayout";
import FacultyLayout from "./layouts/FacultyLayout";
import StudentLayout from "./layouts/StudentLayout";
import Dashboard from "./components/Admin/Dashboard";
import Team from "./components/Admin/Team";
import University from "./components/Admin/University";
import UniversityProfile from "./components/Shared/UniversityProfile/UniversityProfile";

// Import ProtectedRoute
import ProtectedRoute from "./Auth/ProtectedRoute";

const App = () => {
  const dispatch = useDispatch();

  // Initialize authentication from cookies on app load
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login/admin" element={<AdminLogin />} />
      <Route path="/login/faculty" element={<FacultyLogin />} />
      <Route path="/login/student" element={<StudentLogin />} />

      {/* Admin Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["Super Admin", "Admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/team" element={<Team />} />
        <Route path='/admin/universities' element={<University/>}/>
      </Route>

      {/* Faculty Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["Head", "Coordinator"]}>
            <FacultyLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/faculty/dashboard" />
      </Route>

      {/* Student Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["Student"]}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/student/dashboard" />
      </Route>

      {/* Shared Routes */}
      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "Super Admin",
              "Admin",
              "Head",
              "Coordinator",
              "Student",
            ]}
          >
            <UniversityProfile/>
          </ProtectedRoute>
        }
      >
        <Route path="/university/:id" element={<UniversityProfile />} />
      </Route>

      {/* Default Routes */}
      <Route path="/" element={<Navigate to="/login/student" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
