import Attendance from "../models/Attendance.js";
import asyncHandler from "express-async-handler";

// GET /api/attendance/report
export const getAttendanceReport = async (req, res) => {
  try {
    // Example: aggregate attendance % per class or per student

    // For simplicity, return all attendance records filtered by optional date query
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Populate student and class info
    const attendanceRecords = await Attendance.find(filter)
      .populate("student", "name")
      .populate("class", "className");

    // Here you can add aggregation or summarization logic if needed

    res.json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ message: "Failed to get attendance report" });
  }
};

// Get all attendance records
export const getAllAttendance = asyncHandler(async (req, res) => {
  const records = await Attendance.find()
    .populate("student", "name roll className")
    .sort({ date: -1 });
  res.json(records);
});

// Add new attendance
export const addAttendance = asyncHandler(async (req, res) => {
  const { student, which_class, date, status } = req.body;

  const existing = await Attendance.findOne({ student, date });
  if (existing) {
    res.status(400);
    throw new Error("Attendance already recorded for this date.");
  }

  const record = new Attendance({ student, which_class, date, status });
  const saved = await record.save();
  res.status(201).json(saved);
});

// Update attendance
export const updateAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const record = await Attendance.findById(id);
  if (!record) {
    res.status(404);
    throw new Error("Attendance record not found.");
  }

  record.status = status;
  const updated = await record.save();
  res.json(updated);
});

// Delete attendance
export const deleteAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const record = await Attendance.findById(id);
  if (!record) {
    res.status(404);
    throw new Error("Attendance record not found.");
  }

  await record.deleteOne();
  res.json({ message: "Attendance deleted successfully." });
});
