import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  faculty: {
    type: String,
    required: true,
    trim: true,
  },
  headOfDepartment: {
    type: String, // or you can link to a Teacher/Staff model if you have one
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

const Department = mongoose.model("Department", departmentSchema);

export default Department;
