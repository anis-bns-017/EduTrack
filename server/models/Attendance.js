import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    which_class: {
      type: String, 
      required: true, 
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Excused"],
      default: "Present",
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1, date: 1 }, { unique: true }); // Prevent duplicate entries

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
