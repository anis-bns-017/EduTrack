import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    default: "",
  },
  class: {
    type: String,
    required: true,
  },
  rollNumber: {
    type: String,
    unique: true,
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  address: {
    type: String,
  },
  guardianName: {
    type: String,
  },
  guardianPhone: {
    type: String,
  },
  enrollmentDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive", "Graduated", "Transferred"],
    default: "Active",
  },
  profilePicture: {
    type: String, // URL to profile pic
  },
  // You can add relations like attendance records, grades, etc. later
}, {
  timestamps: true,
});

const Student = mongoose.model("Student", studentSchema);

export default Student;
