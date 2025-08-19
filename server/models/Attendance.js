import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
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
    term: {
      type: String, // e.g., "Fall", "Spring"
      required: true,
    },
    semester: {
      type: Number, // e.g., 1-12
      min: 1,
      max: 12,
      required: true,
    },
    academicYear: {
      type: String, // e.g., "2024-2025"
      required: true,
    },
    lectureDate: {
      type: Date,
      required: true,
    },
    lectureNumber: {
      type: Number, // e.g., 1, 2, 3... for each course
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Excused"],
      default: "Present",
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate attendance for the same student in the same course lecture
attendanceSchema.index(
  { student: 1, course: 1, lectureDate: 1 },
  { unique: true }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
