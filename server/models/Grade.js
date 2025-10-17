import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Assessment title is required"],
      trim: true,
      maxLength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [500, "Description cannot exceed 500 characters"],
    },
    assessmentType: {
      type: String,
      required: [true, "Assessment type is required"],
      enum: {
        values: [
          "Assignment",
          "Quiz",
          "Midterm",
          "Final",
          "Project",
          "Presentation",
          "Lab Work",
          "Participation",
          "Attendance",
        ],
        message: "Invalid assessment type",
      },
      index: true,
    },
    score: {
      type: Number,
      required: [true, "Score is required"],
      min: [0, "Score cannot be negative"],
      validate: {
        validator: function (v) {
          return v <= this.maxScore;
        },
        message: "Score cannot exceed maximum score",
      },
    },
    maxScore: {
      type: Number,
      required: [true, "Maximum score is required"],
      min: [1, "Maximum score must be at least 1"],
    },
    weight: {
      type: Number,
      required: [true, "Weight is required"],
      min: [0, "Weight cannot be negative"],
      max: [100, "Weight cannot exceed 100%"],
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || !this.submittedDate || v <= this.submittedDate;
        },
        message: "Due date must be before or equal to submitted date",
      },
    },
    submittedDate: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || !this.gradedDate || v <= this.gradedDate;
        },
        message: "Submitted date must be before or equal to graded date",
      },
    },
    gradedDate: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || !this.dueDate || v >= this.dueDate;
        },
        message: "Graded date must be after or equal to due date",
      },
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: function () {
        return this.status === "Graded";
      },
    },
    feedback: {
      type: String,
      trim: true,
      maxLength: [1000, "Feedback cannot exceed 1000 characters"],
    },
    isAbsent: {
      type: Boolean,
      default: false,
    },
    isExcused: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: {
        values: ["Pending", "Graded", "Appealed", "Regraded"],
        message: "Invalid status",
      },
      default: "Pending",
    },
    attachments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File",
      },
    ],
    rubricScores: [
      {
        criteria: String,
        score: Number,
        maxScore: Number,
        feedback: String,
      },
    ],
  },
  {
    _id: true,
    timestamps: true,
  }
);

// Virtual for assessment percentage
assessmentSchema.virtual("percentage").get(function () {
  if (!this.maxScore || this.maxScore === 0) return 0;
  return parseFloat(((this.score / this.maxScore) * 100).toFixed(2));
});

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student is required"],
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
      index: true,
    },
    program: {
      type: String,
      required: [true, "Program is required"],
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
      index: true,
    },
    section: {
      type: String,
      required: [true, "Section is required"],
      trim: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: [true, "Instructor is required"],
    },
    term: {
      type: String,
      required: [true, "Term is required"],
      trim: true,
      index: true,
      enum: {
        values: ["Fall", "Spring", "Summer", "Winter"],
        message: "Invalid term",
      },
    },
    year: {
      type: Number,
      min: [1, "Year must be at least 1"],
      max: [5, "Year cannot exceed 5"],
      index: true,
      validate: {
        validator: Number.isInteger,
        message: "Year must be an integer",
      },
    },
    semester: {
      type: Number,
      min: [1, "Semester must be at least 1"],
      max: [12, "Semester cannot exceed 12"],
      index: true,
      validate: {
        validator: Number.isInteger,
        message: "Semester must be an integer",
      },
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
      index: true,
      validate: {
        validator: function (v) {
          return /^\d{4}-\d{4}$/.test(v);
        },
        message: "Academic year must be in format YYYY-YYYY",
      },
    },
    creditHours: {
      type: Number,
      required: [true, "Credit hours is required"],
      min: [0, "Credit hours cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Credit hours must be an integer",
      },
    },
    assessments: [assessmentSchema],
    totalScore: {
      type: Number,
      min: 0,
      default: 0,
    },
    maxTotalScore: {
      type: Number,
      min: 0,
      default: 0,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      set: (v) => (v ? parseFloat(v.toFixed(2)) : v),
    },
    finalGrade: {
      type: String,
      trim: true,
      enum: {
        values: [
          "A+",
          "A",
          "A-",
          "B+",
          "B",
          "B-",
          "C+",
          "C",
          "D",
          "F",
          "I",
          "W",
          "P",
          "NP",
          "AU",
        ],
        message: "Invalid grade",
      },
    },

    gradePoint: {
      type: Number,
      min: 0.0,
      max: 4.0,
      validate: {
        validator: function (v) {
          return [
            0.0, 2.0, 2.25, 2.5, 2.75, 3.0, 3.25, 3.5, 3.75, 4.0,
          ].includes(v);
        },
        message: "Invalid grade point",
      },
    },

    gradePoint: {
      type: Number,
      min: 0,
      max: 4,
      set: (v) => (v ? parseFloat(v.toFixed(2)) : v),
    },
    resultStatus: {
      type: String,
      enum: {
        values: ["Pass", "Fail", "Incomplete", "Withdrawn", "In Progress"],
        message: "Invalid result status",
      },
      default: "In Progress",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedDate: {
      type: Date,
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    isAudit: {
      type: Boolean,
      default: false,
    },
    isRepeat: {
      type: Boolean,
      default: false,
    },
    previousGrade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade",
    },
    appealStatus: {
      type: String,
      enum: {
        values: ["None", "Requested", "Under Review", "Approved", "Rejected"],
        message: "Invalid appeal status",
      },
      default: "None",
    },
    appealReason: {
      type: String,
      trim: true,
      maxLength: [1000, "Appeal reason cannot exceed 1000 characters"],
    },
    appealDecision: {
      type: String,
      trim: true,
      maxLength: [1000, "Appeal decision cannot exceed 1000 characters"],
    },
    appealDecidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    appealDecidedDate: {
      type: Date,
    },
    remarks: {
      type: String,
      trim: true,
      maxLength: [1000, "Remarks cannot exceed 1000 characters"],
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Security and audit fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Version control
    version: {
      type: Number,
      default: 1,
    },
    // Locking mechanism
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lockedAt: {
      type: Date,
    },
    // Grade moderation
    moderationStatus: {
      type: String,
      enum: ["None", "Pending", "Approved", "Rejected"],
      default: "None",
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    moderatedAt: {
      type: Date,
    },
    moderationNotes: {
      type: String,
      maxLength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for better query performance
gradeSchema.index(
  { student: 1, course: 1, term: 1, academicYear: 1 },
  { unique: true }
);
gradeSchema.index({ department: 1, academicYear: 1, term: 1 });
gradeSchema.index({ instructor: 1, academicYear: 1, term: 1 });
gradeSchema.index({ isActive: 1, isPublished: 1 });
gradeSchema.index({ appealStatus: 1, isPublished: 1 });

// Pre-save middleware to calculate derived fields
gradeSchema.pre("save", function (next) {
  try {
    // Calculate total score and max total score from assessments
    if (this.assessments && this.assessments.length > 0) {
      this.totalScore = this.assessments.reduce((sum, assessment) => {
        // Only include graded assessments that are not excused absences
        if (assessment.isExcused || assessment.isAbsent) {
          return sum;
        }
        return sum + (assessment.score || 0);
      }, 0);

      this.maxTotalScore = this.assessments.reduce((sum, assessment) => {
        // Only include assessments that are not excused absences
        if (assessment.isExcused) {
          return sum;
        }
        return sum + (assessment.maxScore || 0);
      }, 0);

      // Calculate percentage if maxTotalScore is not zero
      if (this.maxTotalScore > 0) {
        this.percentage = parseFloat(
          ((this.totalScore / this.maxTotalScore) * 100).toFixed(2)
        );
      } else {
        this.percentage = 0;
      }
    } else {
      this.totalScore = 0;
      this.maxTotalScore = 0;
      this.percentage = 0;
    }

    // Calculate final grade and grade point based on percentage
    if (this.percentage !== undefined && this.percentage !== null) {
      const { finalGrade, gradePoint } = calculateGrade(this.percentage);
      this.finalGrade = finalGrade;
      this.gradePoint = gradePoint;

      // Set result status based on final grade
      if (["F", "NP"].includes(this.finalGrade)) {
        this.resultStatus = "Fail";
      } else if (["I", "W"].includes(this.finalGrade)) {
        this.resultStatus = "Incomplete";
      } else if (this.finalGrade === "P") {
        this.resultStatus = "Pass";
      } else if (this.gradePoint >= 2.0) {
        this.resultStatus = "Pass";
      } else {
        this.resultStatus = "Fail";
      }
    }

    // Set published date if being published
    if (
      this.isModified("isPublished") &&
      this.isPublished &&
      !this.publishedDate
    ) {
      this.publishedDate = new Date();
    }

    // Update version
    if (this.isNew) {
      this.version = 1;
    } else if (this.isModified()) {
      this.version += 1;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Static method to get student GPA
gradeSchema.statics.calculateGPA = async function (
  studentId,
  academicYear = null,
  term = null
) {
  try {
    const matchCriteria = {
      student: studentId,
      resultStatus: "Pass",
      isPublished: true,
      isActive: true,
    };

    if (academicYear) matchCriteria.academicYear = academicYear;
    if (term) matchCriteria.term = term;

    const grades = await this.find(matchCriteria)
      .select("gradePoint creditHours")
      .lean();

    if (grades.length === 0) return 0;

    const totalGradePoints = grades.reduce((sum, grade) => {
      return sum + grade.gradePoint * grade.creditHours;
    }, 0);

    const totalCredits = grades.reduce((sum, grade) => {
      return sum + grade.creditHours;
    }, 0);

    return totalCredits > 0
      ? parseFloat((totalGradePoints / totalCredits).toFixed(2))
      : 0;
  } catch (error) {
    throw new Error(`Failed to calculate GPA: ${error.message}`);
  }
};

// Static method to get class statistics
gradeSchema.statics.getClassStatistics = async function (
  courseId,
  term,
  academicYear
) {
  try {
    const grades = await this.find({
      course: courseId,
      term,
      academicYear,
      isPublished: true,
      isActive: true,
    });

    if (grades.length === 0) {
      return {
        totalStudents: 0,
        averageGrade: 0,
        gradeDistribution: {},
        passRate: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
      };
    }

    const gradeDistribution = {};
    let passCount = 0;
    let totalGradePoints = 0;
    let validGradesCount = 0;
    let totalScores = 0;
    let highestScore = 0;
    let lowestScore = 100;

    grades.forEach((grade) => {
      // Count grade distribution
      if (grade.finalGrade) {
        gradeDistribution[grade.finalGrade] =
          (gradeDistribution[grade.finalGrade] || 0) + 1;
      }

      // Count passes
      if (grade.resultStatus === "Pass") {
        passCount++;
      }

      // Sum grade points (only for grades that have grade points)
      if (grade.gradePoint !== null && grade.gradePoint !== undefined) {
        totalGradePoints += grade.gradePoint;
        validGradesCount++;
      }

      // Calculate score statistics
      if (grade.percentage !== null && grade.percentage !== undefined) {
        totalScores += grade.percentage;
        if (grade.percentage > highestScore) highestScore = grade.percentage;
        if (grade.percentage < lowestScore) lowestScore = grade.percentage;
      }
    });

    const averageGrade =
      validGradesCount > 0
        ? parseFloat((totalGradePoints / validGradesCount).toFixed(2))
        : 0;
    const averageScore =
      grades.length > 0
        ? parseFloat((totalScores / grades.length).toFixed(2))
        : 0;

    return {
      totalStudents: grades.length,
      averageGrade,
      gradeDistribution,
      passRate: parseFloat(((passCount / grades.length) * 100).toFixed(2)),
      averageScore,
      highestScore,
      lowestScore,
    };
  } catch (error) {
    throw new Error(`Failed to get class statistics: ${error.message}`);
  }
};

// Static method to get department statistics
gradeSchema.statics.getDepartmentStatistics = async function (
  departmentId,
  academicYear
) {
  try {
    const matchCriteria = {
      department: departmentId,
      academicYear,
      isPublished: true,
      isActive: true,
    };

    const grades = await this.find(matchCriteria)
      .populate("course", "name code")
      .populate("instructor", "name")
      .lean();

    if (grades.length === 0) {
      return {
        totalStudents: 0,
        totalCourses: 0,
        averageGPA: 0,
        passRate: 0,
        courseStats: [],
      };
    }

    // Group by course
    const courseGroups = {};
    grades.forEach((grade) => {
      const courseId = grade.course._id.toString();
      if (!courseGroups[courseId]) {
        courseGroups[courseId] = {
          course: grade.course,
          instructor: grade.instructor,
          students: [],
          totalGradePoints: 0,
          totalCredits: 0,
          passCount: 0,
        };
      }

      courseGroups[courseId].students.push(grade);
      courseGroups[courseId].totalGradePoints +=
        grade.gradePoint * grade.creditHours;
      courseGroups[courseId].totalCredits += grade.creditHours;

      if (grade.resultStatus === "Pass") {
        courseGroups[courseId].passCount++;
      }
    });

    // Calculate statistics for each course
    const courseStats = Object.values(courseGroups).map((group) => {
      const averageGPA =
        group.totalCredits > 0
          ? parseFloat((group.totalGradePoints / group.totalCredits).toFixed(2))
          : 0;
      const passRate =
        group.students.length > 0
          ? parseFloat(
              ((group.passCount / group.students.length) * 100).toFixed(2)
            )
          : 0;

      return {
        course: group.course,
        instructor: group.instructor,
        studentCount: group.students.length,
        averageGPA,
        passRate,
      };
    });

    // Calculate overall department statistics
    const totalGradePoints = Object.values(courseGroups).reduce(
      (sum, group) => sum + group.totalGradePoints,
      0
    );
    const totalCredits = Object.values(courseGroups).reduce(
      (sum, group) => sum + group.totalCredits,
      0
    );
    const totalPasses = Object.values(courseGroups).reduce(
      (sum, group) => sum + group.passCount,
      0
    );

    const averageGPA =
      totalCredits > 0
        ? parseFloat((totalGradePoints / totalCredits).toFixed(2))
        : 0;
    const passRate =
      grades.length > 0
        ? parseFloat(((totalPasses / grades.length) * 100).toFixed(2))
        : 0;

    return {
      totalStudents: grades.length,
      totalCourses: Object.keys(courseGroups).length,
      averageGPA,
      passRate,
      courseStats,
    };
  } catch (error) {
    throw new Error(`Failed to get department statistics: ${error.message}`);
  }
};

// Instance method to check if grade can be appealed
gradeSchema.methods.canAppeal = function () {
  if (
    !this.isPublished ||
    !this.publishedDate ||
    this.appealStatus !== "None"
  ) {
    return false;
  }

  const appealDeadline = new Date(this.publishedDate);
  appealDeadline.setDate(appealDeadline.getDate() + 14); // 2-week appeal window

  return new Date() <= appealDeadline;
};

// Instance method to lock grade for editing
gradeSchema.methods.lock = function (userId) {
  this.isLocked = true;
  this.lockedBy = userId;
  this.lockedAt = new Date();
  return this.save();
};

// Instance method to unlock grade for editing
gradeSchema.methods.unlock = function () {
  this.isLocked = false;
  this.lockedBy = undefined;
  this.lockedAt = undefined;
  return this.save();
};

// Instance method to submit for moderation
gradeSchema.methods.submitForModeration = function (userId, notes) {
  this.moderationStatus = "Pending";
  this.moderatedBy = userId;
  this.moderatedAt = new Date();
  if (notes) this.moderationNotes = notes;
  return this.save();
};

// Instance method to approve moderated grade
gradeSchema.methods.approveModeration = function (userId, notes) {
  this.moderationStatus = "Approved";
  this.moderatedBy = userId;
  this.moderatedAt = new Date();
  if (notes) this.moderationNotes = notes;
  return this.save();
};

// Instance method to reject moderated grade
gradeSchema.methods.rejectModeration = function (userId, notes) {
  this.moderationStatus = "Rejected";
  this.moderatedBy = userId;
  this.moderatedAt = new Date();
  if (notes) this.moderationNotes = notes;
  return this.save();
};

// Virtual for student performance summary
gradeSchema.virtual("performanceSummary").get(function () {
  if (!this.assessments || this.assessments.length === 0) {
    return "No assessments yet";
  }

  const completed = this.assessments.filter(
    (a) => a.status === "Graded"
  ).length;
  const total = this.assessments.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return `${completed}/${total} assessments completed (${percentage}%)`;
});

// Virtual for assessment breakdown by type
gradeSchema.virtual("assessmentBreakdown").get(function () {
  if (!this.assessments || this.assessments.length === 0) {
    return {};
  }

  const breakdown = {};
  let totalWeight = 0;

  this.assessments.forEach((assessment) => {
    const type = assessment.assessmentType;
    if (!breakdown[type]) {
      breakdown[type] = {
        count: 0,
        totalScore: 0,
        totalMaxScore: 0,
        totalWeight: 0,
        averagePercentage: 0,
      };
    }

    breakdown[type].count++;
    breakdown[type].totalScore += assessment.score;
    breakdown[type].totalMaxScore += assessment.maxScore;
    breakdown[type].totalWeight += assessment.weight;
    totalWeight += assessment.weight;
  });

  // Calculate average percentages
  Object.keys(breakdown).forEach((type) => {
    const typeData = breakdown[type];
    if (typeData.totalMaxScore > 0) {
      typeData.averagePercentage = parseFloat(
        ((typeData.totalScore / typeData.totalMaxScore) * 100).toFixed(2)
      );
    }
  });

  return breakdown;
});

// Virtual for grade trend (compared to previous grades)
gradeSchema.virtual("gradeTrend").get(function () {
  // This would need to be populated with actual logic to compare with previous grades
  // For now, it's a placeholder
  return {
    trend: "stable",
    difference: 0,
    previousGrade: this.previousGrade,
  };
});

// Helper function to calculate grade based on percentage
function calculateGrade(percentage) {
  if (percentage >= 80) return { finalGrade: "A+", gradePoint: 4.0 };
  if (percentage >= 75) return { finalGrade: "A", gradePoint: 3.75 };
  if (percentage >= 70) return { finalGrade: "A-", gradePoint: 3.5 };
  if (percentage >= 65) return { finalGrade: "B+", gradePoint: 3.25 };
  if (percentage >= 60) return { finalGrade: "B", gradePoint: 3.0 };
  if (percentage >= 55) return { finalGrade: "B-", gradePoint: 2.75 };
  if (percentage >= 50) return { finalGrade: "C+", gradePoint: 2.5 };
  if (percentage >= 45) return { finalGrade: "C", gradePoint: 2.25 };
  if (percentage >= 40) return { finalGrade: "D", gradePoint: 2.0 };
  return { finalGrade: "F", gradePoint: 0.0 };
}

// Ensure virtual fields are serialized
gradeSchema.set("toJSON", { virtuals: true });
gradeSchema.set("toObject", { virtuals: true });

export default mongoose.model("Grade", gradeSchema);
