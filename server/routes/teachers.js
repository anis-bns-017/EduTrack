import express from "express";
import {
  getAllTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacherController.js";
import protect from "./protect.js";

const router = express.Router();

router.get("/", getAllTeachers); // usually public, but add protect if you want only logged-in users to get teachers

router.post("/", protect, createTeacher);
router.put("/:id", protect, updateTeacher);
router.delete("/:id", protect, deleteTeacher);

export default router;
