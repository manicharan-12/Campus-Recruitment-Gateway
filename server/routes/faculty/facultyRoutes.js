const express = require("express");
const router = express.Router();
const verifyTokenAndRole = require("../../middleware/Faculty/verifyTokenAndRole");
const facultyController = require("../../controller/faculty/facultyController");
const dashboardController = require("../../controller/faculty/dashboardController");
const teamController = require("../../controller/faculty/teamController");
const studentController = require("../../controller/faculty/studentController");

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

module.exports = router;
