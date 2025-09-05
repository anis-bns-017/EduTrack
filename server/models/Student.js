import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    father_name: {
      type: String,
      required: true,
      trim: true,
    },
    mother_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: (v) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v),
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    phone: {
      type: String,
      default: "",
      validate: {
        validator: function (v) {
          return (
            !v ||
            /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(v)
          );
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    program: {
      type: String,
      required: true,
    },
    programType: {
      type: String,
      enum: ["Undergraduate", "Graduate", "PhD", "Diploma", "Certificate"],
      required: true,
    },
    rollNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    studentId: {
      type: String,
      unique: true,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    emergencyContacts: [
      {
        name: String,
        relationship: String,
        phone: String,
        email: String,
      },
    ],
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    expectedGraduationDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: [
        "Active",
        "Inactive",
        "Graduated",
        "Transferred",
        "Suspended",
        "On Leave",
      ],
      default: "Active",
    },
    academicStanding: {
      type: String,
      enum: ["Good", "Probation", "Warning", "Suspended"],
      default: "Good",
    },
    profilePicture: {
      type: String, // URL to profile picture
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    facultyAdvisor: {
      type: String, 
      required: true, 
    },
    yearOfStudy: {
      type: Number,
      min: 1,
      max: 6,
    },
    semester: {
      type: Number,
      min: 1,
      max: 12,
    },
    currentCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    completedCourses: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        grade: String,
        semester: String,
        year: Number,
      },
    ],
    gpa: {
      type: Number,
      min: 0,
      max: 4,
    },
    totalCreditsEarned: {
      type: Number,
      default: 0,
    },
    financialInformation: {
      tuitionBalance: {
        type: Number,
        default: 0,
      },
      financialAid: Boolean,
      scholarships: [String],
    },
    nationality: String,
    identification: {
      type: {
        type: String,
        enum: ["Passport", "National ID", "Driver License", "Other"],
      },
      number: String,
    },
    disabilities: [
      {
        type: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        accommodations: {
          type: String,
          required: true,
        },
      },
    ],
    lastLogin: Date,
    metadata: {
      createdBy: mongoose.Schema.Types.ObjectId,
      updatedBy: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for student's full address
studentSchema.virtual("fullAddress").get(function () {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.postalCode}, ${this.address.country}`;
});

// Virtual for student's age
studentSchema.virtual("age").get(function () {
  if (this.dateOfBirth) {
    const diff = Date.now() - this.dateOfBirth.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }
  return null;
});

const Student = mongoose.model("Student", studentSchema);

export default Student;
