import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // e.g., Midterm, Final, Assignment
    score: { type: Number, required: true, min: 0 },
    maxScore: { type: Number, required: true, min: 1 },
    weight: { type: Number, required: true, min: 0 }, // percentage weight
  },
  { _id: false }
);

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    term: { type: String, required: true, trim: true }, // e.g., "Fall", "Spring"
    semester: { type: Number, min: 1, max: 12 }, // 1-12 depending on program
    academicYear: { type: String, required: true }, // e.g., "2024-2025"
    creditHours: { type: Number, required: true, min: 0 },
    assessments: [assessmentSchema], // detailed marks
    finalGrade: { type: String, trim: true }, // A+, A, B, etc.
    gradePoint: { type: Number, min: 0, max: 4 },
    resultStatus: {
      type: String,
      enum: ["Pass", "Fail", "Incomplete"],
      default: "Incomplete",
    },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Grade", gradeSchema);
