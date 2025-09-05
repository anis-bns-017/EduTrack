import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true, // e.g., "CSE", "EEE"
    },

    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty", // linking with Faculty model
      required: true,
    },

    headOfDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher", // link to Teacher model
    },

    description: {
      type: String,
      trim: true,
    },

    // Academic Information
    establishedYear: {
      type: Number,
    },

    totalStudents: {
      type: Number,
      default: 0,
    },

    totalTeachers: {
      type: Number,
      default: 0,
    },

    offeredPrograms: [
      {
        type: String,
        trim: true, // e.g., "BSc in CSE", "MSc in Physics"
      },
    ],

    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course", // link to courses offered by this department
      },
    ],

    // Contact Information
    officeLocation: {
      type: String,
      trim: true, // e.g., "Building A, Room 305"
    },

    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },

    contactPhone: {
      type: String,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Department = mongoose.model("Department", departmentSchema);

export default Department;
