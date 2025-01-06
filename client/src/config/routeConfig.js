// config/routeConfig.js
import {
  AdminLayout,
  FacultyLayout,
  StudentLayout,
} from "../Layouts/implementations";
import Dashboard from "../components/Admin/Dashboard";
import Team from "../components/Admin/Team";
import University from "../components/Admin/University";

export const ROUTE_CONFIG = {
  admin: {
    Layout: AdminLayout,
    sidebarKey: "adminSidebar",
    routes: [
      {
        path: "dashboard",
        element: <Dashboard />,
        title: "Admin Dashboard",
        allowedRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        path: "team",
        element: <Team />,
        title: "Team Management",
        allowedRoles: ["SUPER_ADMIN"],
      },
      {
        path: "universities",
        element: <University />,
        title: "Universities",
        allowedRoles: ["ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
  faculty: {
    Layout: FacultyLayout,
    sidebarKey: "facultySidebar",
    routes: [
      {
        path: "dashboard",
        // element: <FacultyDashboard />,
        title: "Faculty Dashboard",
        allowedRoles: ["HEAD", "COORDINATOR"],
      },
      {
        path: "team",
        // element: <FacultyTeam />,
        title: "Team Management",
        allowedRoles: ["COORDINATOR"],
      },
    ],
  },
  student: {
    Layout: StudentLayout,
    sidebarKey: "studentSidebar",
    routes: [
      {
        path: "dashboard",
        // element: <StudentDashboard />,
        title: "Student Dashboard",
        allowedRoles: ["STUDENT"],
      },
    ],
  },
};
