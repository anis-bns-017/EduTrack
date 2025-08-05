import express from "express";
import {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/studentController.js";
import protect from "./protect.js";
 
const router = express.Router();

router.get("/", getAllStudents); // public, add protect here if needed: router.get("/", protect, getAllStudents);

router.post("/", protect, createStudent);
router.put("/:id", protect, updateStudent);
router.delete("/:id", protect, deleteStudent);

export default router;
