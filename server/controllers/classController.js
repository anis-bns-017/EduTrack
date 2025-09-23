import asyncHandler from "express-async-handler";
import Class from "../models/Class.js";

// @desc Get all classes
export const getAllClasses = asyncHandler(async (req, res) => {
  const classes = await Class.find()
    .populate("teacher", "firstName middleName lastName email")
    .populate("course", "courseName courseCode")
    .populate("department", "name");
  res.status(200).json(classes);
  console.log("Classes: ", classes);
});

// @desc Create new class
export const createClass = asyncHandler(async (req, res) => {
  const {
    course,
    courseCode,
    className,
    subject,
    department,
    teacher,
    year,
    semester,
    credits,
    room,
    schedule,
  } = req.body;

  if (
    !className ||
    !subject ||
    !department ||
    !teacher ||
    !room ||
    !Array.isArray(schedule) ||
    schedule.length === 0
  ) {
    res.status(400);
    throw new Error(
      "Required fields: className, subject, department, teacher, room, and at least one schedule entry"
    );
  }

  const newClass = await Class.create({
    course,
    courseCode,
    className,
    subject,
    department,
    teacher,
    year,
    semester,
    credits,
    room,
    schedule,
  });

  res.status(201).json(newClass);
});

// @desc Update class
export const updateClass = asyncHandler(async (req, res) => {
  const { _id, ...updateData } = req.body;

  if (Object.keys(updateData).length === 0) {
    res.status(400);
    throw new Error("No update data provided");
  }

  const updatedClass = await Class.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate("teacher", "name email")
    .populate("course", "courseName courseCode")
    .populate("department", "name");

  if (!updatedClass) {
    res.status(404);
    throw new Error("Class not found");
  }

  res.status(200).json(updatedClass);
});

// @desc Delete class
export const deleteClass = asyncHandler(async (req, res) => {
  const deleted = await Class.findByIdAndDelete(req.params.id);

  if (!deleted) {
    res.status(404);
    throw new Error("Class not found");
  }

  res.status(200).json({ message: "Class deleted successfully" });
});
