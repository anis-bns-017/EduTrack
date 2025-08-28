import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import crypto from "crypto";

const teacherSchema = new mongoose.Schema(
  {
    // Basic Information
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true, // This creates an index automatically
      trim: true,
      uppercase: true,
      validate: {
        validator: (v) => /^[A-Z0-9]{6,10}$/.test(v),
        message: "Employee ID must be 6-10 alphanumeric characters",
      },
    },
    title: {
      type: String,
      enum: ["Dr.", "Prof.", "Mr.", "Mrs.", "Ms.", "Mx."],
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot be more than 50 characters"],
    },
    middleName: {
      type: String,
      trim: true,
      maxlength: [50, "Middle name cannot be more than 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot be more than 50 characters"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
      validate: {
        validator: function (value) {
          return value < new Date();
        },
        message: "Date of birth must be in the past",
      },
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"],
      required: [true, "Gender is required"],
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
    },
    nationality: {
      type: String,
      default: "Unknown",
    },
    
    // Contact Information
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // This creates an index automatically
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    phone: {
      type: String,
      validate: {
        validator: (v) => /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/.test(v),
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    
    // Authentication
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    
    // Institutional Information
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: [true, "Faculty is required"],
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      enum: {
        values: [
          "Professor",
          "Associate Professor",
          "Assistant Professor",
          "Senior Lecturer",
          "Lecturer",
          "Visiting Faculty",
          "Adjunct Professor",
          "Research Fellow",
          "Teaching Assistant",
        ],
        message: "Invalid designation provided",
      },
    },
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Visiting", "Adjunct"],
      default: "Full-time",
    },
    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
    },
    contractEndDate: Date,
    status: {
      type: String,
      enum: ["Active", "On Leave", "Sabbatical", "Retired", "Resigned", "Terminated"],
      default: "Active",
    },
    leaveBalance: {
      annual: { type: Number, default: 20 },
      sick: { type: Number, default: 12 },
      personal: { type: Number, default: 5 },
    },
    
    // Academic Information
    qualification: {
      type: String,
      required: [true, "Qualification is required"],
      enum: {
        values: ["PhD", "MSc", "MBA", "MA", "MPhil", "BSc", "BA", "Other"],
        message: "Qualification is either: PhD, MSc, MBA, MA, MPhil, BSc, BA, Other",
      },
    },
    specialization: {
      type: [String],
      required: [true, "Specialization is required"],
    },
    researchInterests: [String],
    areasOfExpertise: [String],
    publications: [{
      title: String,
      journal: String,
      year: Number,
      link: String,
    }],
    coursesTeaching: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    }],
    
    // Professional Details
    officeLocation: {
      type: String,
      trim: true,
    },
    officeHours: [{
      day: {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      },
      startTime: String,
      endTime: String,
      byAppointment: { type: Boolean, default: false },
    }],
    officeExtension: String,
    teachingLoad: {
      type: Number,
      min: 0,
      max: 24,
      default: 12,
    },
    experience: {
      teaching: { type: Number, default: 0 },
      industry: { type: Number, default: 0 },
      research: { type: Number, default: 0 },
    },
    previousInstitutions: [{
      name: String,
      position: String,
      duration: String,
    }],
    
    // Administrative Information
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    role: {
      type: String,
      default: "teacher",
      enum: ["teacher", "hod", "dean", "admin", "coordinator"],
      select: false,
    },
    permissions: [{
      module: String,
      access: {
        type: String,
        enum: ["read", "write", "admin"],
      },
    }],
    reportsTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    
    // Personalization
    profilePhoto: {
      type: String,
      default: "default.jpg",
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot be more than 500 characters"],
    },
    socialMedia: {
      linkedIn: String,
      twitter: String,
      researchGate: String,
      googleScholar: String,
      website: String,
    },
    awards: [{
      title: String,
      organization: String,
      year: Number,
      description: String,
    }],
    
    // Financial Information (Optional - based on requirements)
    salaryGrade: {
      type: String,
      trim: true,
    },
    bankAccount: {
      bankName: String,
      accountNumber: String,
      branchCode: String,
    },
    
    // System Information
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtuals
teacherSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

teacherSchema.virtual("formalName").get(function () {
  return `${this.title ? this.title + " " : ""}${this.firstName} ${this.lastName}`;
});

teacherSchema.virtual("yearsOfService").get(function () {
  return Math.floor((new Date() - this.joiningDate) / (365.25 * 24 * 60 * 60 * 1000));
});

teacherSchema.virtual("age").get(function () {
  return Math.floor((new Date() - this.dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000));
});

teacherSchema.virtual("isAccountLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Indexes - REMOVED DUPLICATES for employeeId and email
// Only define indexes that aren't already created by 'unique: true'
teacherSchema.index({ department: 1 });
teacherSchema.index({ faculty: 1 });
teacherSchema.index({ designation: 1 });
teacherSchema.index({ status: 1 });
teacherSchema.index({ "address.city": 1 });
teacherSchema.index({ createdAt: 1 });

// Compound indexes for better query performance
teacherSchema.index({ department: 1, status: 1 });
teacherSchema.index({ faculty: 1, designation: 1 });
teacherSchema.index({ lastName: 1, firstName: 1 });

// Text search index for searching across multiple fields
teacherSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
  specialization: "text",
  researchInterests: "text"
});

// Password hashing middleware
teacherSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

teacherSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Query middleware to filter out inactive teachers
teacherSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } });
  next();
});

// Instance methods
teacherSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

teacherSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

teacherSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

teacherSchema.methods.incrementLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  // Otherwise, increment
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock the account if too many attempts
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Static methods
teacherSchema.statics.getTeachersByDepartment = function (departmentId) {
  return this.find({ department: departmentId }).populate("department");
};

teacherSchema.statics.getTeachersByStatus = function (status) {
  return this.find({ status: status });
};

const Teacher = mongoose.model("Teacher", teacherSchema);

export default Teacher;