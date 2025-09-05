import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true,
      maxLength: 100
    },
    description: {
      type: String,
      trim: true,
      maxLength: 500
    },
    assessmentType: {
      type: String,
      required: true,
      enum: [
        "Assignment", 
        "Quiz", 
        "Midterm", 
        "Final", 
        "Project", 
        "Presentation", 
        "Lab Work",
        "Participation",
        "Attendance"
      ],
      index: true
    },
    score: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    maxScore: { 
      type: Number, 
      required: true, 
      min: 1 
    },
    weight: { 
      type: Number, 
      required: true, 
      min: 0,
      max: 100
    },
    dueDate: {
      type: Date
    },
    submittedDate: {
      type: Date
    },
    gradedDate: {
      type: Date
    },
    grader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty"
    },
    feedback: {
      type: String,
      trim: true,
      maxLength: 1000
    },
    isAbsent: {
      type: Boolean,
      default: false
    },
    isExcused: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["Pending", "Graded", "Appealed", "Regraded"],
      default: "Pending"
    }
  },
  { 
    _id: true,
    timestamps: true 
  }
);

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true
    },
    program: {
      type: String, 
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true
    },
    section: {
      type: String, 
      required: true, 
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true
    },
    term: { 
      type: String, 
      required: true, 
      trim: true,
      index: true
    },
    year: { 
      type: Number, 
      min: 1, 
      max: 5,
      index: true
    },
    semester: { 
      type: Number, 
      min: 1, 
      max: 12,
      index: true
    },
    academicYear: { 
      type: String, 
      required: true,
      index: true
    },
    creditHours: { 
      type: Number, 
      required: true, 
      min: 0 
    },
    assessments: [assessmentSchema],
    totalScore: {
      type: Number,
      min: 0,
      default: 0
    },
    maxTotalScore: {
      type: Number,
      min: 0,
      default: 0
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100
    },
    finalGrade: { 
      type: String, 
      trim: true,
      enum: [
        "A+", "A", "A-", 
        "B+", "B", "B-", 
        "C+", "C", "C-", 
        "D+", "D", "F", 
        "I", "W", "P", 
        "NP", "AU"
      ]
    },
    gradePoint: { 
      type: Number, 
      min: 0, 
      max: 4,
      set: v => parseFloat(v.toFixed(2))
    },
    resultStatus: {
      type: String,
      enum: ["Pass", "Fail", "Incomplete", "Withdrawn", "In Progress"],
      default: "In Progress"
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    publishedDate: {
      type: Date
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty"
    },
    isAudit: {
      type: Boolean,
      default: false
    },
    isRepeat: {
      type: Boolean,
      default: false
    },
    previousGrade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade"
    },
    appealStatus: {
      type: String,
      enum: ["None", "Requested", "Under Review", "Approved", "Rejected"],
      default: "None"
    },
    appealReason: {
      type: String,
      trim: true,
      maxLength: 1000
    },
    appealDecision: {
      type: String,
      trim: true,
      maxLength: 1000
    },
    appealDecidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty"
    },
    appealDecidedDate: {
      type: Date
    },
    remarks: { 
      type: String, 
      trim: true,
      maxLength: 1000
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty"
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { 
    timestamps: true 
  }
);

// Compound indexes for better query performance
gradeSchema.index({ student: 1, course: 1, term: 1, academicYear: 1 }, { unique: true });
gradeSchema.index({ department: 1, academicYear: 1, term: 1 });
gradeSchema.index({ instructor: 1, academicYear: 1, term: 1 });

// Pre-save middleware to calculate derived fields
gradeSchema.pre('save', function(next) {
  // Calculate total score and max total score
  if (this.assessments && this.assessments.length > 0) {
    this.totalScore = this.assessments.reduce((sum, assessment) => {
      return sum + (assessment.score || 0);
    }, 0);
    
    this.maxTotalScore = this.assessments.reduce((sum, assessment) => {
      return sum + (assessment.maxScore || 0);
    }, 0);
    
    // Calculate percentage if maxTotalScore is not zero
    if (this.maxTotalScore > 0) {
      this.percentage = (this.totalScore / this.maxTotalScore) * 100;
    }
  }
  
  // Calculate final grade and grade point based on percentage
  if (this.percentage !== undefined && this.percentage !== null) {
    const { finalGrade, gradePoint } = calculateGrade(this.percentage);
    this.finalGrade = finalGrade;
    this.gradePoint = gradePoint;
    
    // Set result status based on final grade
    if (['F', 'NP'].includes(this.finalGrade)) {
      this.resultStatus = 'Fail';
    } else if (['I', 'W'].includes(this.finalGrade)) {
      this.resultStatus = 'Incomplete';
    } else if (this.finalGrade === 'P') {
      this.resultStatus = 'Pass';
    } else if (this.gradePoint >= 2.0) {
      this.resultStatus = 'Pass';
    } else {
      this.resultStatus = 'Fail';
    }
  }
  
  // Set published date if being published
  if (this.isModified('isPublished') && this.isPublished && !this.publishedDate) {
    this.publishedDate = new Date();
  }
  
  next();
});

// Static method to get student GPA
gradeSchema.statics.calculateGPA = async function(studentId, academicYear = null, term = null) {
  const matchCriteria = { 
    student: studentId, 
    resultStatus: 'Pass',
    isPublished: true
  };
  
  if (academicYear) matchCriteria.academicYear = academicYear;
  if (term) matchCriteria.term = term;
  
  const grades = await this.find(matchCriteria)
    .select('gradePoint creditHours')
    .lean();
  
  if (grades.length === 0) return 0;
  
  const totalGradePoints = grades.reduce((sum, grade) => {
    return sum + (grade.gradePoint * grade.creditHours);
  }, 0);
  
  const totalCredits = grades.reduce((sum, grade) => {
    return sum + grade.creditHours;
  }, 0);
  
  return totalCredits > 0 ? parseFloat((totalGradePoints / totalCredits).toFixed(2)) : 0;
};

// Static method to get class statistics
gradeSchema.statics.getClassStatistics = async function(courseId, term, academicYear) {
  const grades = await this.find({ 
    course: courseId, 
    term, 
    academicYear,
    isPublished: true 
  });
  
  if (grades.length === 0) {
    return {
      totalStudents: 0,
      averageGrade: 0,
      gradeDistribution: {},
      passRate: 0
    };
  }
  
  const gradeDistribution = {};
  let passCount = 0;
  let totalGradePoints = 0;
  
  grades.forEach(grade => {
    // Count grade distribution
    if (grade.finalGrade) {
      gradeDistribution[grade.finalGrade] = (gradeDistribution[grade.finalGrade] || 0) + 1;
    }
    
    // Count passes
    if (grade.resultStatus === 'Pass') {
      passCount++;
    }
    
    // Sum grade points
    if (grade.gradePoint) {
      totalGradePoints += grade.gradePoint;
    }
  });
  
  return {
    totalStudents: grades.length,
    averageGrade: parseFloat((totalGradePoints / grades.length).toFixed(2)),
    gradeDistribution,
    passRate: parseFloat(((passCount / grades.length) * 100).toFixed(2))
  };
};

// Instance method to check if grade can be appealed
gradeSchema.methods.canAppeal = function() {
  const appealDeadline = new Date(this.publishedDate);
  appealDeadline.setDate(appealDeadline.getDate() + 14); // 2-week appeal window
  
  return (
    this.isPublished && 
    this.appealStatus === 'None' && 
    new Date() <= appealDeadline
  );
};

// Virtual for student performance summary
gradeSchema.virtual('performanceSummary').get(function() {
  if (!this.assessments || this.assessments.length === 0) {
    return 'No assessments yet';
  }
  
  const completed = this.assessments.filter(a => a.status === 'Graded').length;
  const total = this.assessments.length;
  
  return `${completed}/${total} assessments completed (${Math.round((completed/total)*100)}%)`;
});

// Helper function to calculate grade based on percentage
function calculateGrade(percentage) {
  if (percentage >= 80) return { finalGrade: 'A+', gradePoint: 4.00 };
  if (percentage >= 75) return { finalGrade: 'A', gradePoint: 3.75 };
  if (percentage >= 70) return { finalGrade: 'A-', gradePoint: 3.50 };
  if (percentage >= 65) return { finalGrade: 'B+', gradePoint: 3.25 };
  if (percentage >= 60) return { finalGrade: 'B', gradePoint: 3.00 };
  if (percentage >= 55) return { finalGrade: 'B-', gradePoint: 2.75 };
  if (percentage >= 50) return { finalGrade: 'C+', gradePoint: 2.50 };
  if (percentage >= 45) return { finalGrade: 'C', gradePoint: 2.25 };
  if (percentage >= 40) return { finalGrade: 'D', gradePoint: 2.00 };
  return { finalGrade: 'F', gradePoint: 0.00 };
}

export default mongoose.model("Grade", gradeSchema);