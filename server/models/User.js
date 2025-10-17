import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minLength: [3, "Username must be at least 3 characters"],
      maxLength: [30, "Username cannot exceed 30 characters"],
      match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"]
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password must be at least 6 characters"],
      select: false // Don't include password in queries by default
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxLength: [50, "First name cannot exceed 50 characters"]
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxLength: [50, "Last name cannot exceed 50 characters"]
    },
    role: {
      type: String,
      enum: ["Super Admin", "Admin", "Teacher", "Student", "Staff"],
      required: [true, "Role is required"],
      default: "Teacher" // Keep default as teacher since you mentioned "admin" and "teacher"
    },
    profilePicture: {
      type: String,
      default: null
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"]
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "Prefer not to say"]
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    },
    lastLogin: {
      type: Date,
      default: Date.now
    },
    loginHistory: [{
      timestamp: {
        type: Date,
        default: Date.now
      },
      ipAddress: String,
      userAgent: String,
      status: {
        type: String,
        enum: ["Success", "Failed"],
        default: "Success"
      }
    }],
    emailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: String,
    isActive: {
      type: Boolean,
      default: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    permissions: [{
      type: String,
      enum: [
        // Grade permissions
        "grade:create",
        "grade:read",
        "grade:update",
        "grade:delete",
        "grade:publish",
        "grade:moderate",
        "grade:appeal",
        // Student permissions
        "student:create",
        "student:read",
        "student:update",
        "student:delete",
        // Teacher permissions
        "teacher:create",
        "teacher:read",
        "teacher:update",
        "teacher:delete",
        // Course permissions
        "course:create",
        "course:read",
        "course:update",
        "course:delete",
        // Department permissions
        "department:create",
        "department:read",
        "department:update",
        "department:delete",
        // Report permissions
        "report:generate",
        "report:export",
        // Admin permissions
        "admin:dashboard",
        "admin:users",
        "admin:settings"
      ]
    }],
    preferences: {
      language: {
        type: String,
        enum: ["en", "bn"],
        default: "en"
      },
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light"
      },
      notifications: {
        email: {
          type: Boolean,
          default: true
        },
        push: {
          type: Boolean,
          default: true
        },
        sms: {
          type: Boolean,
          default: false
        }
      }
    }
  },
  { 
    timestamps: true 
  }
);

// Indexes for better query performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get user permissions
userSchema.methods.getPermissions = function() {
  // Role-based default permissions
  const rolePermissions = {
    "Super Admin": [
      "grade:create", "grade:read", "grade:update", "grade:delete", "grade:publish", "grade:moderate", "grade:appeal",
      "student:create", "student:read", "student:update", "student:delete",
      "teacher:create", "teacher:read", "teacher:update", "teacher:delete",
      "course:create", "course:read", "course:update", "course:delete",
      "department:create", "department:read", "department:update", "department:delete",
      "report:generate", "report:export",
      "admin:dashboard", "admin:users", "admin:settings"
    ],
    "Admin": [
      "grade:read", "grade:update", "grade:publish", "grade:moderate",
      "student:read", "student:update",
      "teacher:read", "teacher:update",
      "course:read", "course:update",
      "department:read", "department:update",
      "report:generate", "report:export",
      "admin:dashboard"
    ],
    "Teacher": [
      "grade:create", "grade:read", "grade:update", "grade:publish",
      "student:read",
      "course:read",
      "report:generate"
    ],
    "Student": [
      "grade:read",
      "report:generate"
    ],
    "Staff": [
      "grade:read",
      "student:read",
      "teacher:read",
      "course:read",
      "department:read",
      "report:generate"
    ]
  };
  
  // Combine role permissions with custom permissions
  return [...(rolePermissions[this.role] || []), ...(this.permissions || [])];
};

// Instance method to check if user has specific permission
userSchema.methods.hasPermission = function(permission) {
  return this.getPermissions().includes(permission);
};

// Ensure virtual fields are serialized and sensitive data is excluded
userSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.twoFactorSecret;
    delete ret.emailVerificationToken;
    delete ret.passwordResetToken;
    return ret;
  }
});

userSchema.set('toObject', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.twoFactorSecret;
    delete ret.emailVerificationToken;
    delete ret.passwordResetToken;
    return ret;
  }
});

export default mongoose.model("User", userSchema);