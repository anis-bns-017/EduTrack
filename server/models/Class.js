import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    room: {
      type: String,
      trim: true,
    },
    schedule: {
      day: {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      },
      time: {
        type: String,
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Archived"],
      default: "Active",
    },
  },
  { timestamps: true }
);

// Indexes for faster querying
classSchema.index({ className: 1 });
classSchema.index({ teacher: 1 });

const Class = mongoose.model("Class", classSchema);
export default Class;
