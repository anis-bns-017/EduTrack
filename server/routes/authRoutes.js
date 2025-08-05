import express from "express";
import { login, register, getMe } from "../controllers/authController.js";
 
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", getMe);


export default router;
