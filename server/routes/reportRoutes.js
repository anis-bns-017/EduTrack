import express from "express";
import protect from "./protect.js";
import { getReport } from "../controllers/reportController.js";

const router = express.Router();

// POST /api/reports
router.post("/", protect, getReport);

export default router;
