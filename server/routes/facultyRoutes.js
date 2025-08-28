import express from "express";
import {
  createFaculty,
  getFaculties,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
} from "../controllers/facultyController.js";

const router = express.Router();

router.post("/", createFaculty);
router.get("/", getFaculties);
router.get("/:id", getFacultyById);
router.put("/:id", updateFaculty);
router.delete("/:id", deleteFaculty);

export default router;
