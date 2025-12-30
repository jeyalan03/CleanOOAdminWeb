const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
// DASHBOARD STATS
router.get("/dashboard/stats", dashboardController.dashboardStats);
router.get("/sidebar/stats", dashboardController.getSidebarCounts);

const adminController = require("../controllers/adminController");
router.post("/create", adminController.createAdmin);
router.get("/list", adminController.getAllAdmins);

router.post("/check-email", adminController.checkAdminEmail);

module.exports = router;
