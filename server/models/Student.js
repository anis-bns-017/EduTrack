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
  // Changed from 'class' to 'program' or 'degree' for university context
  program: {
    type: String,
    required: true,
  },
  rollNumber: {
    type: String,
    unique: true,
    sparse: true, // allows some docs to not have rollNumber
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
    type: String, // URL to profile picture
  },
  department: {
    type: String,
  },
  facultyAdvisor: {
    type: String,
  },
  yearOfStudy: {
    type: Number,
    min: 1,
    max: 5,
  },
  cgpa: {
    type: Number,
    min: 0,
    max: 4,
  },
  // Add more fields as needed (e.g., attendance, courses, etc.)
}, {
  timestamps: true,
});

const Student = mongoose.model("Student", studentSchema);

export default Student;
