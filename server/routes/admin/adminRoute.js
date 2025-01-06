const express = require("express");
const router = express.Router();
const adminController = require("../../controller/admin/adminController");
const dashboardController = require("../../controller/admin/dashboardController");
const teamController = require("../../controller/admin/teamController");
const universityController = require("../../controller/admin/universityController");
const facultyController = require("../../controller/admin/facultyController");
const verifyTokenAndRole = require("../../middleware/Admin/verifyTokenAndRole");
const { upload } = require("../../middleware/fileUpload");

router.post("/login", adminController.login);
router.get("/dashboard", verifyTokenAndRole(), dashboardController.dashboard);
router.get("/team", verifyTokenAndRole(), teamController.teamData);
router.post("/add/team", verifyTokenAndRole(), teamController.addTeamData);
router.get(
  "/university",
  verifyTokenAndRole(),
  universityController.universityData
);
router.post(
  "/add/university",
  verifyTokenAndRole(),
  upload.single("logo"),
  universityController.addUniversityData
);
router.delete(
  "/university/:id",
  verifyTokenAndRole(),
  universityController.deleteUniversity
);

router.put(
  "/university/:id",
  verifyTokenAndRole(),
  universityController.editUniversity
);
router.post("/faculty", verifyTokenAndRole(), facultyController.addFacultyData);

module.exports = router;
