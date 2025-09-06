// class.model.js
import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course", // make sure you have a Course model
    },
    courseCode: { type: String, trim: true },
    className: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    year: { type: String, trim: true },
    semester: { type: String, trim: true },
    credits: { type: Number, min: 0 },
    room: { type: String, trim: true },
    schedule: { type: [{ day: String, time: String }], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Class", classSchema);
