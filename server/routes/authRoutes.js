import express from "express";
import { login, register, getMe } from "../controllers/authController.js";
import protect from "./protect.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

export default router;
