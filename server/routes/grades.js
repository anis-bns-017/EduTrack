import express from "express";
import {
  getAllGrades,
  createGrade,
  updateGrade,
  deleteGrade,
  getGradesReport,
} from "../controllers/gradeController.js";
import protect from "./protect.js";

const router = express.Router();

router.get("/", getAllGrades); // Public - add protect here if you want to restrict access
router.post("/", protect, createGrade);
router.put("/:id", protect, updateGrade);
router.delete("/:id", protect, deleteGrade);
router.get("/report", getGradesReport);

export default router;
