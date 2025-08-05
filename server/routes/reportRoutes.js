import express from "express";
import { getReport } from "../controllers/reportController.js";
import protect from "./protect.js";

const router = express.Router();

// POST /api/reports
router.post("/", protect, getReport);

export default router;
