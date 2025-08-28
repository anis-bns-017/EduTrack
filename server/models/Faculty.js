import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true, // e.g., "Faculty of Science"
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true, // e.g., "SCI", "ENG", "ART"
    },
    dean: {
      type: String,
      required: true, 
    },
    departments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department", // Departments under this Faculty
      },
    ],
    establishedYear: {
      type: Number,
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
    officeLocation: {
      type: String, // e.g., "Main Campus, Building A, Room 101"
      trim: true,
    },
    description: {
      type: String, // overview of the faculty
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Faculty", facultySchema);
