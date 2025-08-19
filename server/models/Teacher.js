import mongoose from "mongoose" // → Added mongoose import
import bcrypt from "bcryptjs"
import validator from "validator"
import crypto from "crypto"

const teacherSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
      validate: {
        validator: (v) => /^[A-Z0-9]{6,10}$/.test(v),
        message: "Employee ID must be 6-10 alphanumeric characters",
      },
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot be more than 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
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
          "Lecturer",
          "Visiting Faculty",
          "Adjunct Professor",
        ],
        message:
          "Designation is either: Professor, Associate Professor, Assistant Professor, Lecturer, Visiting Faculty, Adjunct Professor",
      },
    },
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
    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
    },
    officeLocation: {
      type: String,
      trim: true,
    },
    officeHours: {
      type: [
        {
          day: {
            type: String,
            enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          },
          startTime: String,
          endTime: String,
        },
      ],
    },
    phone: {
      type: String,
      validate: {
        validator: (v) => /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/.test(v),
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    coursesTeaching: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    role: {
      type: String,
      default: "teacher",
      enum: ["teacher", "hod", "dean", "admin"],
      select: false,
    },
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
    },
  },
  {
    timestamps: true, // → Replaces manual `createdAt`
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Virtuals
teacherSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`
})

teacherSchema.virtual("yearsOfService").get(function () {
  return new Date().getFullYear() - this.joiningDate.getFullYear() // → Simplified
})

// Indexes

teacherSchema.index({ department: 1 })
teacherSchema.index({ faculty: 1 })
teacherSchema.index({ coursesTeaching: 1 }) // → Optional but useful

// Password hashing
teacherSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

teacherSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next()
  this.passwordChangedAt = Date.now() - 1000
  next()
})

// Query middleware
teacherSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } })
  next()
})

// Instance methods
teacherSchema.methods.correctPassword = async (candidatePassword, userPassword) =>
  await bcrypt.compare(candidatePassword, userPassword)

teacherSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Number.parseInt(this.passwordChangedAt.getTime() / 1000, 10)
    return JWTTimestamp < changedTimestamp
  }
  return false
}

teacherSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex")
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex") // → Fixed typo
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000
  return resetToken
}

const Teacher = mongoose.model("Teacher", teacherSchema)

export default Teacher
