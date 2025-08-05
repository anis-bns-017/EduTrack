import express from "express";
import * as attendance from "../controllers/attendanceController.js";
import protect from "./protect.js";
 
const router = express.Router();

router.get("/", protect, attendance.getAllAttendance);
router.post("/", protect, attendance.addAttendance);
router.put("/:id", protect, attendance.updateAttendance);
router.delete("/:id", protect, attendance.deleteAttendance);
router.get("/report", protect, attendance.getAttendanceReport);

export default router;
