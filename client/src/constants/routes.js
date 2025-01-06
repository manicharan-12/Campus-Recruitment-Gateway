//constants/routes.js

export const ROUTES = {
  STUDENT: {
    path: "/student",
    login: "/login/student",
    dashboard: "/student/dashboard",
  },
  FACULTY: {
    path: "/faculty",
    login: "/login/faculty",
    dashboard: "/faculty/dashboard",
    subRoutes: {
      team: "/faculty/team",
    },
  },
  ADMIN: {
    path: "/admin",
    login: "/login/admin",
    dashboard: "/admin/dashboard",
    subRoutes: {
      team: "/admin/team",
      universities: "/admin/universities",
    },
  },
};
