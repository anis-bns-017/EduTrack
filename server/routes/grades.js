import express from "express";
import {
  getAllGrades,
  createGrade,
  updateGrade,
  deleteGrade,
} from "../controllers/gradeController.js";

const router = express.Router();

router.get("/", getAllGrades);
router.post("/", createGrade);
router.put("/:id", updateGrade);
router.delete("/:id", deleteGrade);

export default router;
