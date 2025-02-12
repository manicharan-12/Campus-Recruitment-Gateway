const express = require("express");
const router = express.Router();
const adminController = require("../../controller/admin/adminController");
const dashboardController = require("../../controller/admin/dashboardController");
const teamController = require("../../controller/admin/teamController");
const universityController = require("../../controller/admin/universityController");
const facultyController = require("../../controller/admin/facultyController");
const verifyTokenAndRole = require("../../middleware/Admin/verifyTokenAndRole");
const { upload } = require("../../middleware/fileUpload");
const verifyToken = require("../../middleware/Shared/verifyToken");

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
  verifyToken(),
  universityController.editUniversity
);
router.post("/faculty", verifyToken(), facultyController.addFacultyData);
router.put(
  "/faculty/updatePassword/:id",
  verifyToken(),
  facultyController.changePassword
);
router.put("/faculty/:id", verifyToken(), facultyController.updateFaculty);
router.put(
  "/faculty/:id/toggleStatus",
  verifyToken(),
  facultyController.toggleFacultyStatus
);
router.delete("/faculty/:id", verifyToken(), facultyController.deleteFaculty);

module.exports = router;
