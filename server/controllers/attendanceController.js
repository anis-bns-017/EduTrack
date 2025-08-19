import Attendance from "../models/Attendance.js";
import asyncHandler from "express-async-handler";

/**
 * GET /api/attendance/report
 * Generates an attendance report with optional date range filtering.
 */
export const getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, course, department, student } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.lectureDate = {};
      if (startDate) filter.lectureDate.$gte = new Date(startDate);
      if (endDate) filter.lectureDate.$lte = new Date(endDate);
    }
    if (course) filter.course = course;
    if (department) filter.department = department;
    if (student) filter.student = student;

    const attendanceRecords = await Attendance.find(filter)
      .populate("student", "name roll")
      .populate("department", "name")
      .populate("course", "name code")
      .sort({ lectureDate: -1 });

    res.json(attendanceRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to get attendance report" });
  }
};

/**
 * GET /api/attendance
 * Returns all attendance records.
 */
export const getAllAttendance = asyncHandler(async (req, res) => {
  const records = await Attendance.find()
    .populate("student", "name rollNumber")
    .populate("department", "name")
    .populate("course", "name code")
    .sort({ lectureDate: -1 });

  res.json(records);
});

/**
 * POST /api/attendance
 * Add a new attendance record.
 */
export const addAttendance = asyncHandler(async (req, res) => {
  const {
    student,
    department,
    course,
    term,
    semester,
    academicYear,
    lectureDate,
    lectureNumber,
    status,
    remarks
  } = req.body;

  // Prevent duplicate attendance for the same student, course, and date
  const existing = await Attendance.findOne({
    student,
    course,
    lectureDate
  });
  if (existing) {
    res.status(400);
    throw new Error("Attendance already recorded for this course and date.");
  }

  const record = new Attendance({
    student,
    department,
    course,
    term,
    semester,
    academicYear,
    lectureDate,
    lectureNumber,
    status,
    remarks
  });

  const saved = await record.save();
  res.status(201).json(saved);
});

/**
 * PUT /api/attendance/:id
 * Update attendance status or remarks.
 */
export const updateAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;

  const record = await Attendance.findById(id);
  if (!record) {
    res.status(404);
    throw new Error("Attendance record not found.");
  }

  if (status) record.status = status;
  if (remarks) record.remarks = remarks;

  const updated = await record.save();
  res.json(updated);
});

/**
 * DELETE /api/attendance/:id
 * Remove an attendance record.
 */
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
