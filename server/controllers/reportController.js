import asyncHandler from "express-async-handler";
import Attendance from "../models/Attendance.js";
import Grade from "../models/Grade.js";
import Student from "../models/Student.js";

// @desc    Get report data based on filters
// @route   POST /api/reports
// @access  Private
export const getReport = asyncHandler(async (req, res) => {
  const { className, studentId, fromDate, toDate } = req.body;

  const studentFilter = {};
  const attendanceFilter = {};
  const gradeFilter = {};

  if (className) {
    studentFilter.className = className;
  }

  if (studentId) {
    studentFilter._id = studentId;
    attendanceFilter.student = studentId;
    gradeFilter.student = studentId;
  }

  if (fromDate && toDate) {
    attendanceFilter.date = { $gte: new Date(fromDate), $lte: new Date(toDate) };
    gradeFilter.date = { $gte: new Date(fromDate), $lte: new Date(toDate) };
  }

  const students = await Student.find(studentFilter);
  const studentIds = students.map((s) => s._id);

  const attendanceRecords = await Attendance.find({
    ...attendanceFilter,
    student: { $in: studentIds },
  }).populate("student");

  const grades = await Grade.find({
    ...gradeFilter,
    student: { $in: studentIds },
  }).populate("student");

  res.json({
    students,
    attendance: attendanceRecords,
    grades,
  });
});
