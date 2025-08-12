import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, default: "" },

    department: { type: String, required: true },
    designation: { type: String, required: true },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Other",
    },
    address: { type: String, default: "" },

    experience: { type: Number, min: 0 },

    joiningDate: { type: Date, default: Date.now },

    status: {
      type: String,
      enum: ["Active", "Inactive", "On Leave", "Retired"],
      default: "Active",
    },

    qualifications: { type: String, default: "" },

    coursesHandled: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],

    officeRoom: { type: String, default: "" },

    profilePicture: { type: String, default: "" },

    userAccountId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Teacher", teacherSchema);
