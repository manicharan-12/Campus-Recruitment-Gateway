const express = require("express");
const router = express.Router();
const verifyTokenAndRole = require("../../middleware/Faculty/verifyTokenAndRole");
const facultyController = require("../../controller/faculty/facultyController");
const dashboardController = require("../../controller/faculty/dashboardController");
const teamController = require("../../controller/faculty/teamController");
const studentController = require("../../controller/faculty/studentController");
const analyticsController = require("../../controller/faculty/analyticsController");

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
  "/analytics/configurations",
  verifyTokenAndRole(),
  analyticsController.getAllAnalytics
);

router.get(
  "/analytics/data/:configId",
  verifyTokenAndRole(),
  analyticsController.getAnalyticsOnConfiguration
);

router.post(
  "/analytics/configurations",
  verifyTokenAndRole(),
  analyticsController.createAnalytics
);

router.delete(
  "/analytics/configurations/:id",
  verifyTokenAndRole(),
  analyticsController.deleteAnalytics
);

module.exports = router;
