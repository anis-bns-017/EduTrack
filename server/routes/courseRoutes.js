import express from "express";
import {
  createCourse,
  getCourses,
} from "../controllers/courseController.js";

const router = express.Router();

router.post("/", createCourse); // bulk or single insert
router.get("/", getCourses);

export default router;
