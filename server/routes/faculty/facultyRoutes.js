const express = require("express");
const router = express.Router();
const verifyTokenAndRole = require("../../middleware/Faculty/verifyTokenAndRole");
const facultyController = require("../../controller/faculty/facultyController");
const dashboardController = require("../../controller/faculty/dashboardController");
const teamController = require("../../controller/faculty/teamController");
const studentController = require("../../controller/faculty/studentController");
const companyController = require("../../controller/faculty/companyController");
const analyticsController = require("../../controller/faculty/analyticsController");
const { upload } = require("../../middleware/fileUpload");

router.post("/login", facultyController.login);
router.get("/dashboard", verifyTokenAndRole(), dashboardController.dashboard);
router.get(
  "/team",
  verifyTokenAndRole(),
  teamController.getUniversityFaculties
);
router.get(
  "/student/filtered",
  verifyTokenAndRole(),
  studentController.getFilteredData
);
router.get(
  "/degree-programs",
  verifyTokenAndRole(),
  studentController.getDegreePrograms
);

router.post(
  "/send-notification",
  verifyTokenAndRole(),
  studentController.sendNotification
);

router.get(
  "/companies",
  verifyTokenAndRole(),
  companyController.getFacultyCompanies
);

router.post(
  "/companies",
  verifyTokenAndRole(),
  upload.single("companyLogo"),
  companyController.addCompany
);

router.get(
  "/company/:companyId",
  verifyTokenAndRole(),
  companyController.getCompanyDashboardData
);

router.put(
  "/company/:companyId/placement",
  verifyTokenAndRole(),
  companyController.updateCompanyPlacement
);

router.get(
  "/company/:companyId/roles",
  verifyTokenAndRole(),
  companyController.getCompanyRoles
);

router.get(
  "/company/:companyId/eligible-students",
  verifyTokenAndRole(),
  companyController.getEligibleStudents
);
router.post(
  "/company/:companyId/role",
  verifyTokenAndRole(),
  companyController.addCompanyRole
);

router.get(
  "/analytics/filters",
  verifyTokenAndRole(),
  analyticsController.getFilters
);

router.get(
  "/analytics",
  verifyTokenAndRole(),
  analyticsController.getAnalytics
);

module.exports = router;
