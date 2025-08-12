import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  description: { type: String },
  credits: { type: Number, default: 3 },
  // You can add semester, instructor, prerequisites, etc.
}, { timestamps: true });

const Course = mongoose.model("Course", courseSchema);
export default Course;
