import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import studentsRoutes from "./routes/studentRoutes.js";
import teacherRoutes from "./routes/teachers.js";
import classRoutes from "./routes/classRoutes.js"
import gradeRoutes from "./routes/grades.js"
import attendanceRoutes from "./routes/attendanceRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

// Config
dotenv.config();
const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend origin
    credentials: true,
  })
);
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.send("EduTrack API is running");
});

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:");
    console.error("- URI used:", process.env.MONGO_URI);
    console.error("- Full error:", err);
    process.exit(1);
  }
};

app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/grades", gradeRoutes)
app.use("/api/classes", classRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/reports", reportRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  connectDB();
  console.log(`🚀 Server running on: ${PORT}`);
});
