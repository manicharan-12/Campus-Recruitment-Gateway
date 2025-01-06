const express = require("express");
const router = express.Router();
const sharedController = require("../../controller/shared/sharedController");

router.get("/university/:id", sharedController.completeUniversityData);

module.exports = router;
