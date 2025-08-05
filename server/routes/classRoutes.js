import express from "express";
import {
  getAllClasses,
  createClass,
  updateClass,
  deleteClass,
} from "../controllers/classController.js";
import protect from "./protect.js";
 
const router = express.Router();

router.get("/", getAllClasses); // Public, add protect if you want to restrict
router.post("/", protect, createClass);
router.put("/:id", protect, updateClass);
router.delete("/:id", protect, deleteClass);

export default router;
