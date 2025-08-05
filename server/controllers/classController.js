import asyncHandler from "express-async-handler";
import Class from "../models/Class.js";

// @desc Get all classes
export const getAllClasses = asyncHandler(async (req, res) => {
  const classes = await Class.find().populate("teacher", "name email");
  res.json(classes);
});

// @desc Create new class
export const createClass = asyncHandler(async (req, res) => {
  const { className, subject, teacher, room, schedule } = req.body;

  const newClass = await Class.create({ className, subject, teacher, room, schedule });
  res.status(201).json(newClass);
});

// @desc Update class
export const updateClass = asyncHandler(async (req, res) => {
  const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updatedClass) {
    res.status(404);
    throw new Error("Class not found");
  }
  res.json(updatedClass);
});

// @desc Delete class
export const deleteClass = asyncHandler(async (req, res) => {
  const deleted = await Class.findByIdAndDelete(req.params.id);
  if (!deleted) {
    res.status(404);
    throw new Error("Class not found");
  }
  res.json({ message: "Class deleted" });
});
