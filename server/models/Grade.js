import mongoose from "mongoose";

// Enhanced Assessment Schema with additional features
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
          "Thesis",
          "Dissertation",
          "Portfolio",
          "Practical Exam",
          "Oral Exam",
          "Peer Review",
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
    isExtraCredit: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: {
        values: ["Pending", "Graded", "Appealed", "Regraded", "Exempted"],
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
        weight: Number,
      },
    ],
    learningOutcomes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LearningOutcome",
      },
    ],
    // New fields for advanced grading
    isGroupWork: {
      type: Boolean,
      default: false,
    },
    groupMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    isModerated: {
      type: Boolean,
      default: false,
    },
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    moderatedDate: Date,
    // Analytics fields
    timeSpent: Number, // in minutes
    attemptCount: {
      type: Number,
      default: 1,
    },
    lastAttemptDate: Date,
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

// Virtual for assessment status with color coding
assessmentSchema.virtual("statusInfo").get(function () {
  const statusColors = {
    Pending: "#ffc107",
    Graded: "#28a745",
    Appealed: "#dc3545",
    Regraded: "#17a2b8",
    Exempted: "#6f42c1",
  };

  return {
    status: this.status,
    color: statusColors[this.status] || "#6c757d",
    isLate: this.submittedDate && this.dueDate && this.submittedDate > this.dueDate,
    isOverdue: !this.submittedDate && this.dueDate && new Date() > this.dueDate,
  };
});

// Enhanced Grade Schema with comprehensive university grading features
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
    specialization: {
      type: String,
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
          "IP", // In Progress
          "CR", // Credit
          "NC", // No Credit
        ],
        message: "Invalid grade",
      },
    },
    gradePoint: {
      type: Number,
      min: 0.0,
      max: 4.0,
      set: (v) => (v ? parseFloat(v.toFixed(2)) : v),
    },
    // GPA Scale (4.0, 5.0, etc.)
    gpaScale: {
      type: Number,
      default: 4.0,
      enum: [4.0, 5.0, 10.0],
    },
    // Quality points (gradePoint * creditHours)
    qualityPoints: {
      type: Number,
      default: 0,
    },
    resultStatus: {
      type: String,
      enum: {
        values: ["Pass", "Fail", "Incomplete", "Withdrawn", "In Progress", "Exempted"],
        message: "Invalid result status",
      },
      default: "In Progress",
    },
    // Academic standing
    academicStanding: {
      type: String,
      enum: ["Excellent", "Good", "Satisfactory", "Probation", "Suspension"],
      default: "Good",
    },
    // Honor roll status
    honorRoll: {
      type: String,
      enum: ["None", "Dean's List", "President's List", "Chancellor's List"],
      default: "None",
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
    repeatCount: {
      type: Number,
      default: 0,
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
    // Grade distribution for statistical purposes
    percentile: {
      type: Number,
      min: 0,
      max: 100,
    },
    zScore: {
      type: Number,
    },
    // Attendance impact
    attendanceRate: {
      type: Number,
      min: 0,
      max: 100,
    },
    attendanceImpact: {
      type: String,
      enum: ["Positive", "Neutral", "Negative"],
      default: "Neutral",
    },
    // Learning outcomes achievement
    learningOutcomesAchievement: [
      {
        outcome: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "LearningOutcome",
        },
        achievementLevel: {
          type: Number,
          min: 0,
          max: 100,
        },
      },
    ],
    // Grade history
    gradeHistory: [
      {
        date: Date,
        action: String,
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        changes: mongoose.Schema.Types.Mixed,
      },
    ],
    // External verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedDate: Date,
    // Integration with external systems
    lmsId: String, // Learning Management System ID
    sisId: String, // Student Information System ID
    // Additional metadata
    tags: [String],
    metadata: mongoose.Schema.Types.Mixed,
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
gradeSchema.index({ academicStanding: 1, honorRoll: 1 });
gradeSchema.index({ program: 1, specialization: 1, year: 1 });

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

    // Calculate quality points
    this.qualityPoints = (this.gradePoint || 0) * (this.creditHours || 0);

    // Calculate final grade and grade point based on percentage
    if (this.percentage !== undefined && this.percentage !== null) {
      const { finalGrade, gradePoint } = calculateGrade(this.percentage, this.gpaScale);
      this.finalGrade = finalGrade;
      this.gradePoint = gradePoint;

      // Set result status based on final grade
      if (["F", "NP", "NC"].includes(this.finalGrade)) {
        this.resultStatus = "Fail";
      } else if (["I", "W", "IP"].includes(this.finalGrade)) {
        this.resultStatus = "Incomplete";
      } else if (["P", "CR", "AU"].includes(this.finalGrade)) {
        this.resultStatus = "Pass";
      } else if (this.gradePoint >= 2.0) {
        this.resultStatus = "Pass";
      } else {
        this.resultStatus = "Fail";
      }
    }

    // Set academic standing based on grade point
    if (this.gradePoint >= 3.5) {
      this.academicStanding = "Excellent";
    } else if (this.gradePoint >= 3.0) {
      this.academicStanding = "Good";
    } else if (this.gradePoint >= 2.0) {
      this.academicStanding = "Satisfactory";
    } else if (this.gradePoint >= 1.0) {
      this.academicStanding = "Probation";
    } else {
      this.academicStanding = "Suspension";
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
      
      // Add to grade history
      if (!this.gradeHistory) this.gradeHistory = [];
      this.gradeHistory.push({
        date: new Date(),
        action: "Grade Updated",
        performedBy: this.updatedBy,
        changes: this.getChanges(),
      });
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Static method to get student GPA with more options
gradeSchema.statics.calculateGPA = async function (
  studentId,
  options = {}
) {
  try {
    const {
      academicYear = null,
      term = null,
      program = null,
      gpaScale = 4.0,
      includeInProgress = false,
      includeWithdrawn = false,
      onlyPassed = true,
      onlyCompleted = false,
    } = options;

    const matchCriteria = {
      student: studentId,
      gpaScale,
      isActive: true,
    };

    if (academicYear) matchCriteria.academicYear = academicYear;
    if (term) matchCriteria.term = term;
    if (program) matchCriteria.program = program;

    if (onlyPassed) {
      matchCriteria.resultStatus = "Pass";
    } else if (onlyCompleted) {
      matchCriteria.resultStatus = { $in: ["Pass", "Fail"] };
    } else if (!includeInProgress) {
      matchCriteria.resultStatus = { $ne: "In Progress" };
    }

    if (!includeWithdrawn) {
      matchCriteria.finalGrade = { $ne: "W" };
    }

    const grades = await this.find(matchCriteria)
      .select("gradePoint creditHours qualityPoints")
      .lean();

    if (grades.length === 0) return { gpa: 0, totalCredits: 0, totalQualityPoints: 0 };

    const totalQualityPoints = grades.reduce((sum, grade) => {
      return sum + (grade.qualityPoints || 0);
    }, 0);

    const totalCredits = grades.reduce((sum, grade) => {
      return sum + (grade.creditHours || 0);
    }, 0);

    const gpa = totalCredits > 0
      ? parseFloat((totalQualityPoints / totalCredits).toFixed(2))
      : 0;

    return {
      gpa,
      totalCredits,
      totalQualityPoints,
      courseCount: grades.length,
    };
  } catch (error) {
    throw new Error(`Failed to calculate GPA: ${error.message}`);
  }
};

// Static method to get student academic history
gradeSchema.statics.getStudentAcademicHistory = async function (
  studentId,
  options = {}
) {
  try {
    const {
      limit = 10,
      page = 1,
      sortBy = "academicYear",
      sortOrder = "desc",
      academicYear = null,
      program = null,
    } = options;

    const matchCriteria = { student: studentId, isActive: true };
    if (academicYear) matchCriteria.academicYear = academicYear;
    if (program) matchCriteria.program = program;

    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const grades = await this.find(matchCriteria)
      .populate("course", "name code")
      .populate("instructor", "name")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await this.countDocuments(matchCriteria);

    // Calculate cumulative GPA
    const { gpa: cumulativeGPA, totalCredits } = await this.calculateGPA(studentId, {
      program,
      onlyCompleted: true,
    });

    // Calculate GPA by academic year
    const academicYears = await this.distinct("academicYear", matchCriteria);
    const gpaByYear = {};

    for (const year of academicYears) {
      const { gpa } = await this.calculateGPA(studentId, {
        academicYear: year,
        program,
        onlyCompleted: true,
      });
      gpaByYear[year] = gpa;
    }

    return {
      grades,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
      statistics: {
        cumulativeGPA,
        totalCredits,
        gpaByYear,
      },
    };
  } catch (error) {
    throw new Error(`Failed to get student academic history: ${error.message}`);
  }
};

// Static method to get class statistics with enhanced analytics
gradeSchema.statics.getClassStatistics = async function (
  courseId,
  term,
  academicYear,
  options = {}
) {
  try {
    const {
      includeDistribution = true,
      includePercentiles = true,
      section = null,
    } = options;

    const matchCriteria = {
      course: courseId,
      term,
      academicYear,
      isPublished: true,
      isActive: true,
    };

    if (section) matchCriteria.section = section;

    const grades = await this.find(matchCriteria)
      .populate("student", "name studentId")
      .lean();

    if (grades.length === 0) {
      return {
        totalStudents: 0,
        averageGrade: 0,
        gradeDistribution: {},
        passRate: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        standardDeviation: 0,
        median: 0,
      };
    }

    const gradeDistribution = {};
    let passCount = 0;
    let totalGradePoints = 0;
    let validGradesCount = 0;
    let totalScores = 0;
    let highestScore = 0;
    let lowestScore = 100;
    const scores = [];

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
        scores.push(grade.percentage);
        if (grade.percentage > highestScore) highestScore = grade.percentage;
        if (grade.percentage < lowestScore) lowestScore = grade.percentage;
      }
    });

    // Calculate median
    scores.sort((a, b) => a - b);
    const median = scores.length % 2 === 0
      ? (scores[scores.length / 2 - 1] + scores[scores.length / 2]) / 2
      : scores[Math.floor(scores.length / 2)];

    // Calculate standard deviation
    const mean = totalScores / grades.length;
    const squaredDifferences = scores.map(score => Math.pow(score - mean, 2));
    const avgSquaredDiff = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / scores.length;
    const standardDeviation = Math.sqrt(avgSquaredDiff);

    const averageGrade =
      validGradesCount > 0
        ? parseFloat((totalGradePoints / validGradesCount).toFixed(2))
        : 0;
    const averageScore =
      grades.length > 0
        ? parseFloat((totalScores / grades.length).toFixed(2))
        : 0;

    const result = {
      totalStudents: grades.length,
      averageGrade,
      gradeDistribution,
      passRate: parseFloat(((passCount / grades.length) * 100).toFixed(2)),
      averageScore,
      highestScore,
      lowestScore,
      median: parseFloat(median.toFixed(2)),
      standardDeviation: parseFloat(standardDeviation.toFixed(2)),
    };

    // Calculate percentiles if requested
    if (includePercentiles && scores.length > 0) {
      result.percentiles = {
        p25: getPercentile(scores, 25),
        p50: getPercentile(scores, 50),
        p75: getPercentile(scores, 75),
        p90: getPercentile(scores, 90),
        p95: getPercentile(scores, 95),
      };
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to get class statistics: ${error.message}`);
  }
};

// Static method to get department statistics with enhanced analytics
gradeSchema.statics.getDepartmentStatistics = async function (
  departmentId,
  academicYear,
  options = {}
) {
  try {
    const {
      term = null,
      includeCourseBreakdown = true,
      includeInstructorBreakdown = true,
      includeProgramBreakdown = true,
    } = options;

    const matchCriteria = {
      department: departmentId,
      academicYear,
      isPublished: true,
      isActive: true,
    };

    if (term) matchCriteria.term = term;

    const grades = await this.find(matchCriteria)
      .populate("course", "name code")
      .populate("instructor", "name")
      .populate("program", "name")
      .lean();

    if (grades.length === 0) {
      return {
        totalStudents: 0,
        totalCourses: 0,
        averageGPA: 0,
        passRate: 0,
        courseStats: [],
        instructorStats: [],
        programStats: [],
      };
    }

    // Group by course
    const courseGroups = {};
    grades.forEach((grade) => {
      const courseId = grade.course._id.toString();
      if (!courseGroups[courseId]) {
        courseGroups[courseId] = {
          course: grade.course,
          students: [],
          totalGradePoints: 0,
          totalCredits: 0,
          passCount: 0,
          scores: [],
        };
      }

      courseGroups[courseId].students.push(grade);
      courseGroups[courseId].totalGradePoints += grade.gradePoint * grade.creditHours;
      courseGroups[courseId].totalCredits += grade.creditHours;

      if (grade.resultStatus === "Pass") {
        courseGroups[courseId].passCount++;
      }

      if (grade.percentage !== null && grade.percentage !== undefined) {
        courseGroups[courseId].scores.push(grade.percentage);
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

      // Calculate median score
      group.scores.sort((a, b) => a - b);
      const medianScore = group.scores.length % 2 === 0
        ? (group.scores[group.scores.length / 2 - 1] + group.scores[group.scores.length / 2]) / 2
        : group.scores[Math.floor(group.scores.length / 2)];

      return {
        course: group.course,
        studentCount: group.students.length,
        averageGPA,
        passRate,
        medianScore: parseFloat(medianScore.toFixed(2)),
      };
    });

    // Group by instructor
    const instructorGroups = {};
    grades.forEach((grade) => {
      const instructorId = grade.instructor._id.toString();
      if (!instructorGroups[instructorId]) {
        instructorGroups[instructorId] = {
          instructor: grade.instructor,
          courses: {},
          students: [],
          totalGradePoints: 0,
          totalCredits: 0,
          passCount: 0,
        };
      }

      instructorGroups[instructorId].students.push(grade);
      instructorGroups[instructorId].totalGradePoints += grade.gradePoint * grade.creditHours;
      instructorGroups[instructorId].totalCredits += grade.creditHours;

      if (grade.resultStatus === "Pass") {
        instructorGroups[instructorId].passCount++;
      }

      const courseId = grade.course._id.toString();
      if (!instructorGroups[instructorId].courses[courseId]) {
        instructorGroups[instructorId].courses[courseId] = {
          course: grade.course,
          studentCount: 0,
          passCount: 0,
        };
      }

      instructorGroups[instructorId].courses[courseId].studentCount++;
      if (grade.resultStatus === "Pass") {
        instructorGroups[instructorId].courses[courseId].passCount++;
      }
    });

    // Calculate statistics for each instructor
    const instructorStats = Object.values(instructorGroups).map((group) => {
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
        instructor: group.instructor,
        studentCount: group.students.length,
        courseCount: Object.keys(group.courses).length,
        averageGPA,
        passRate,
        courses: Object.values(group.courses),
      };
    });

    // Group by program
    const programGroups = {};
    grades.forEach((grade) => {
      const programId = grade.program._id.toString();
      if (!programGroups[programId]) {
        programGroups[programId] = {
          program: grade.program,
          students: [],
          totalGradePoints: 0,
          totalCredits: 0,
          passCount: 0,
        };
      }

      programGroups[programId].students.push(grade);
      programGroups[programId].totalGradePoints += grade.gradePoint * grade.creditHours;
      programGroups[programId].totalCredits += grade.creditHours;

      if (grade.resultStatus === "Pass") {
        programGroups[programId].passCount++;
      }
    });

    // Calculate statistics for each program
    const programStats = Object.values(programGroups).map((group) => {
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
        program: group.program,
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

    const result = {
      totalStudents: grades.length,
      totalCourses: Object.keys(courseGroups).length,
      averageGPA,
      passRate,
    };

    if (includeCourseBreakdown) {
      result.courseStats = courseStats;
    }

    if (includeInstructorBreakdown) {
      result.instructorStats = instructorStats;
    }

    if (includeProgramBreakdown) {
      result.programStats = programStats;
    }

    return result;
  } catch (error) {
    throw new Error(`Failed to get department statistics: ${error.message}`);
  }
};

// Static method to get honor roll
gradeSchema.statics.getHonorRoll = async function (
  options = {}
) {
  try {
    const {
      academicYear,
      term,
      program,
      minGPA = 3.5,
      minCredits = 12,
      honorRollType = "Dean's List",
    } = options;

    const matchCriteria = {
      honorRoll: honorRollType,
      isActive: true,
      isPublished: true,
    };

    if (academicYear) matchCriteria.academicYear = academicYear;
    if (term) matchCriteria.term = term;
    if (program) matchCriteria.program = program;

    const honorRollStudents = await this.find(matchCriteria)
      .populate("student", "name studentId email")
      .populate("program", "name")
      .sort({ gradePoint: -1 })
      .lean();

    // Group by student to get all their qualifying courses
    const studentMap = {};
    honorRollStudents.forEach((grade) => {
      const studentId = grade.student._id.toString();
      if (!studentMap[studentId]) {
        studentMap[studentId] = {
          student: grade.student,
          program: grade.program,
          courses: [],
          totalCredits: 0,
          totalQualityPoints: 0,
          gpa: 0,
        };
      }

      studentMap[studentId].courses.push({
        course: grade.course,
        grade: grade.finalGrade,
        gradePoint: grade.gradePoint,
        creditHours: grade.creditHours,
      });

      studentMap[studentId].totalCredits += grade.creditHours;
      studentMap[studentId].totalQualityPoints += grade.gradePoint * grade.creditHours;
    });

    // Calculate GPA for each student
    Object.values(studentMap).forEach((student) => {
      student.gpa = student.totalCredits > 0
        ? parseFloat((student.totalQualityPoints / student.totalCredits).toFixed(2))
        : 0;
    });

    // Filter by minimum GPA and credits
    const filteredStudents = Object.values(studentMap).filter(
      (student) => student.gpa >= minGPA && student.totalCredits >= minCredits
    );

    // Sort by GPA (descending)
    filteredStudents.sort((a, b) => b.gpa - a.gpa);

    return filteredStudents;
  } catch (error) {
    throw new Error(`Failed to get honor roll: ${error.message}`);
  }
};

// Static method to generate transcript
gradeSchema.statics.generateTranscript = async function (
  studentId,
  options = {}
) {
  try {
    const {
      includeUnpublished = false,
      includeInProgress = false,
      academicYear = null,
      program = null,
    } = options;

    const matchCriteria = {
      student: studentId,
      isActive: true,
    };

    if (!includeUnpublished) {
      matchCriteria.isPublished = true;
    }

    if (!includeInProgress) {
      matchCriteria.resultStatus = { $ne: "In Progress" };
    }

    if (academicYear) matchCriteria.academicYear = academicYear;
    if (program) matchCriteria.program = program;

    const grades = await this.find(matchCriteria)
      .populate("course", "name code description creditHours")
      .populate("instructor", "name")
      .populate("program", "name")
      .populate("department", "name")
      .sort({ academicYear: 1, term: 1, semester: 1 })
      .lean();

    if (grades.length === 0) {
      return {
        student: null,
        program: null,
        academicHistory: [],
        statistics: {
          totalCredits: 0,
          cumulativeGPA: 0,
          totalCourses: 0,
        },
      };
    }

    // Get student information
    const student = await mongoose.model("Student").findById(studentId)
      .populate("user", "name email")
      .lean();

    // Group grades by academic year and term
    const academicHistory = {};
    let totalCredits = 0;
    let totalQualityPoints = 0;
    let totalCourses = 0;

    grades.forEach((grade) => {
      const year = grade.academicYear;
      const term = grade.term;

      if (!academicHistory[year]) {
        academicHistory[year] = {};
      }

      if (!academicHistory[year][term]) {
        academicHistory[year][term] = {
          courses: [],
          termCredits: 0,
          termGPA: 0,
          termQualityPoints: 0,
        };
      }

      academicHistory[year][term].courses.push({
        course: grade.course,
        instructor: grade.instructor,
        finalGrade: grade.finalGrade,
        gradePoint: grade.gradePoint,
        creditHours: grade.creditHours,
        resultStatus: grade.resultStatus,
        assessments: grade.assessments,
      });

      academicHistory[year][term].termCredits += grade.creditHours;
      academicHistory[year][term].termQualityPoints += grade.gradePoint * grade.creditHours;

      totalCredits += grade.creditHours;
      totalQualityPoints += grade.gradePoint * grade.creditHours;
      totalCourses++;
    });

    // Calculate term GPAs
    Object.keys(academicHistory).forEach((year) => {
      Object.keys(academicHistory[year]).forEach((term) => {
        const termData = academicHistory[year][term];
        termData.termGPA = termData.termCredits > 0
          ? parseFloat((termData.termQualityPoints / termData.termCredits).toFixed(2))
          : 0;
      });
    });

    // Calculate cumulative GPA
    const cumulativeGPA = totalCredits > 0
      ? parseFloat((totalQualityPoints / totalCredits).toFixed(2))
      : 0;

    return {
      student,
      program: grades[0].program,
      department: grades[0].department,
      academicHistory,
      statistics: {
        totalCredits,
        cumulativeGPA,
        totalCourses,
        academicStanding: getAcademicStanding(cumulativeGPA),
      },
    };
  } catch (error) {
    throw new Error(`Failed to generate transcript: ${error.message}`);
  }
};

// Static method to get graduation requirements status
gradeSchema.statics.getGraduationRequirementsStatus = async function (
  studentId,
  programId
) {
  try {
    // Get student information
    const student = await mongoose.model("Student").findById(studentId)
      .populate("program")
      .lean();

    // Get program requirements
    const program = await mongoose.model("Program").findById(programId)
      .populate({
        path: "requirements",
        populate: {
          path: "courses",
          model: "Course",
        },
      })
      .lean();

    if (!program || !program.requirements) {
      throw new Error("Program or requirements not found");
    }

    // Get all completed grades for the student
    const completedGrades = await this.find({
      student: studentId,
      resultStatus: { $in: ["Pass", "Completed"] },
      isPublished: true,
      isActive: true,
    })
      .populate("course")
      .lean();

    // Check each requirement
    const requirementsStatus = [];
    let totalCreditsCompleted = 0;
    let totalCreditsRequired = 0;

    for (const requirement of program.requirements) {
      const requirementStatus = {
        name: requirement.name,
        description: requirement.description,
        type: requirement.type,
        creditsRequired: requirement.creditsRequired || 0,
        creditsCompleted: 0,
        coursesRequired: requirement.courses || [],
        coursesCompleted: [],
        isCompleted: false,
        alternativeOptions: requirement.alternativeOptions || [],
      };

      totalCreditsRequired += requirement.creditsRequired || 0;

      if (requirement.type === "Course") {
        // Check specific course requirements
        for (const course of requirement.courses) {
          const completedGrade = completedGrades.find(
            (grade) => grade.course._id.toString() === course._id.toString()
          );

          if (completedGrade) {
            requirementStatus.coursesCompleted.push({
              course: completedGrade.course,
              grade: completedGrade.finalGrade,
              creditHours: completedGrade.creditHours,
            });

            requirementStatus.creditsCompleted += completedGrade.creditHours;
            totalCreditsCompleted += completedGrade.creditHours;
          }
        }
      } else if (requirement.type === "Category") {
        // Check category requirements (e.g., electives)
        const categoryCourses = completedGrades.filter((grade) => {
          return grade.course.category === requirement.category;
        });

        categoryCourses.forEach((grade) => {
          requirementStatus.coursesCompleted.push({
            course: grade.course,
            grade: grade.finalGrade,
            creditHours: grade.creditHours,
          });

          requirementStatus.creditsCompleted += grade.creditHours;
          totalCreditsCompleted += grade.creditHours;
        });
      } else if (requirement.type === "Credits") {
        // Check credit requirements
        const categoryCourses = completedGrades.filter((grade) => {
          return grade.course.category === requirement.category;
        });

        categoryCourses.forEach((grade) => {
          requirementStatus.creditsCompleted += grade.creditHours;
          totalCreditsCompleted += grade.creditHours;
        });
      }

      requirementStatus.isCompleted = requirementStatus.creditsCompleted >= requirementStatus.creditsRequired;
      requirementsStatus.push(requirementStatus);
    }

    // Calculate overall completion percentage
    const completionPercentage = totalCreditsRequired > 0
      ? parseFloat(((totalCreditsCompleted / totalCreditsRequired) * 100).toFixed(2))
      : 0;

    // Get current GPA
    const { gpa } = await this.calculateGPA(studentId, {
      program: programId,
      onlyCompleted: true,
    });

    // Check if GPA meets minimum requirement
    const minGPA = program.minGPA || 2.0;
    const gpaRequirementMet = gpa >= minGPA;

    return {
      student,
      program,
      requirementsStatus,
      summary: {
        totalCreditsCompleted,
        totalCreditsRequired,
        completionPercentage,
        currentGPA: gpa,
        minGPA,
        gpaRequirementMet,
        canGraduate: completionPercentage >= 100 && gpaRequirementMet,
      },
    };
  } catch (error) {
    throw new Error(`Failed to get graduation requirements status: ${error.message}`);
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

// Instance method to publish grade
gradeSchema.methods.publish = function (userId) {
  this.isPublished = true;
  this.publishedDate = new Date();
  this.publishedBy = userId;
  return this.save();
};

// Instance method to unpublish grade
gradeSchema.methods.unpublish = function () {
  this.isPublished = false;
  this.publishedDate = undefined;
  this.publishedBy = undefined;
  return this.save();
};

// Instance method to verify grade
gradeSchema.methods.verify = function (userId) {
  this.isVerified = true;
  this.verifiedBy = userId;
  this.verifiedDate = new Date();
  return this.save();
};

// Instance method to get grade changes
gradeSchema.methods.getChanges = function () {
  const changes = {};
  const modifiedPaths = this.modifiedPaths();

  modifiedPaths.forEach((path) => {
    changes[path] = {
      old: this.get(path),
      new: this._changes[path],
    };
  });

  return changes;
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

// Virtual for grade color coding
gradeSchema.virtual("gradeColor").get(function () {
  if (!this.finalGrade) return "#6c757d"; // Gray for no grade

  const gradeColors = {
    "A+": "#0066cc",
    "A": "#0080ff",
    "A-": "#3399ff",
    "B+": "#66b3ff",
    "B": "#99ccff",
    "B-": "#ccddff",
    "C+": "#ffcc99",
    "C": "#ffcc66",
    "D": "#ff9933",
    "F": "#ff3333",
    "I": "#ffcc00",
    "W": "#cccccc",
    "P": "#66cc66",
    "NP": "#ff6666",
    "AU": "#ccccff",
  };

  return gradeColors[this.finalGrade] || "#6c757d";
});

// Virtual for academic standing color coding
gradeSchema.virtual("standingColor").get(function () {
  if (!this.academicStanding) return "#6c757d"; // Gray for no standing

  const standingColors = {
    "Excellent": "#28a745", // Green
    "Good": "#17a2b8", // Cyan
    "Satisfactory": "#ffc107", // Yellow
    "Probation": "#fd7e14", // Orange
    "Suspension": "#dc3545", // Red
  };

  return standingColors[this.academicStanding] || "#6c757d";
});

// Helper function to calculate grade based on percentage
function calculateGrade(percentage, gpaScale = 4.0) {
  if (gpaScale === 4.0) {
    if (percentage >= 97) return { finalGrade: "A+", gradePoint: 4.0 };
    if (percentage >= 93) return { finalGrade: "A", gradePoint: 4.0 };
    if (percentage >= 90) return { finalGrade: "A-", gradePoint: 3.7 };
    if (percentage >= 87) return { finalGrade: "B+", gradePoint: 3.3 };
    if (percentage >= 83) return { finalGrade: "B", gradePoint: 3.0 };
    if (percentage >= 80) return { finalGrade: "B-", gradePoint: 2.7 };
    if (percentage >= 77) return { finalGrade: "C+", gradePoint: 2.3 };
    if (percentage >= 73) return { finalGrade: "C", gradePoint: 2.0 };
    if (percentage >= 70) return { finalGrade: "C-", gradePoint: 1.7 };
    if (percentage >= 67) return { finalGrade: "D+", gradePoint: 1.3 };
    if (percentage >= 65) return { finalGrade: "D", gradePoint: 1.0 };
    return { finalGrade: "F", gradePoint: 0.0 };
  } else if (gpaScale === 5.0) {
    if (percentage >= 97) return { finalGrade: "A+", gradePoint: 5.0 };
    if (percentage >= 93) return { finalGrade: "A", gradePoint: 5.0 };
    if (percentage >= 90) return { finalGrade: "A-", gradePoint: 4.7 };
    if (percentage >= 87) return { finalGrade: "B+", gradePoint: 4.3 };
    if (percentage >= 83) return { finalGrade: "B", gradePoint: 4.0 };
    if (percentage >= 80) return { finalGrade: "B-", gradePoint: 3.7 };
    if (percentage >= 77) return { finalGrade: "C+", gradePoint: 3.3 };
    if (percentage >= 73) return { finalGrade: "C", gradePoint: 3.0 };
    if (percentage >= 70) return { finalGrade: "C-", gradePoint: 2.7 };
    if (percentage >= 67) return { finalGrade: "D+", gradePoint: 2.3 };
    if (percentage >= 65) return { finalGrade: "D", gradePoint: 2.0 };
    return { finalGrade: "F", gradePoint: 0.0 };
  } else if (gpaScale === 10.0) {
    if (percentage >= 97) return { finalGrade: "A+", gradePoint: 10.0 };
    if (percentage >= 93) return { finalGrade: "A", gradePoint: 10.0 };
    if (percentage >= 90) return { finalGrade: "A-", gradePoint: 9.0 };
    if (percentage >= 87) return { finalGrade: "B+", gradePoint: 8.0 };
    if (percentage >= 83) return { finalGrade: "B", gradePoint: 7.0 };
    if (percentage >= 80) return { finalGrade: "B-", gradePoint: 6.0 };
    if (percentage >= 77) return { finalGrade: "C+", gradePoint: 5.0 };
    if (percentage >= 73) return { finalGrade: "C", gradePoint: 4.0 };
    if (percentage >= 70) return { finalGrade: "C-", gradePoint: 3.0 };
    if (percentage >= 67) return { finalGrade: "D+", gradePoint: 2.0 };
    if (percentage >= 65) return { finalGrade: "D", gradePoint: 1.0 };
    return { finalGrade: "F", gradePoint: 0.0 };
  }

  // Default to 4.0 scale
  return calculateGrade(percentage, 4.0);
}

// Helper function to get academic standing based on GPA
function getAcademicStanding(gpa) {
  if (gpa >= 3.5) return "Excellent";
  if (gpa >= 3.0) return "Good";
  if (gpa >= 2.0) return "Satisfactory";
  if (gpa >= 1.0) return "Probation";
  return "Suspension";
}

// Helper function to get percentile value
function getPercentile(sortedArray, percentile) {
  if (sortedArray.length === 0) return 0;

  const index = (percentile / 100) * (sortedArray.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;

  if (upper >= sortedArray.length) return sortedArray[sortedArray.length - 1];

  return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
}

// Ensure virtual fields are serialized
gradeSchema.set("toJSON", { virtuals: true });
gradeSchema.set("toObject", { virtuals: true });

export default mongoose.model("Grade", gradeSchema);