import mongoose from "mongoose";
import Grade from "../models/Grade.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Course from "../models/Course.js";
import Department from "../models/Department.js";
import User from "../models/User.js";

/**
 * Utility: Calculate final grade and grade point (using the enhanced Grade model helper)
 */
const calculateFinalGrade = (assessments, gpaScale = 4.0) => {
  if (!assessments || !assessments.length) {
    return { 
      grade: "F", 
      gradePoint: 0.00, 
      percentage: 0,
      resultStatus: "Fail"
    };
  }

  let totalScore = 0;
  let maxTotalScore = 0;

  assessments.forEach(assessment => {
    if (!assessment.isExcused) {
      totalScore += parseFloat(assessment.score || 0);
      maxTotalScore += parseFloat(assessment.maxScore || 0);
    }
  });

  if (maxTotalScore === 0) {
    return { 
      grade: "F", 
      gradePoint: 0.00, 
      percentage: 0,
      resultStatus: "Fail"
    };
  }

  const percentage = parseFloat(((totalScore / maxTotalScore) * 100).toFixed(2));

  // Use the enhanced calculateGrade function from the Grade model
  const { finalGrade, gradePoint } = calculateGrade(percentage, gpaScale);

  // Determine result status
  let resultStatus = "Fail";
  if (["F", "NP", "NC"].includes(finalGrade)) {
    resultStatus = "Fail";
  } else if (["I", "W", "IP"].includes(finalGrade)) {
    resultStatus = "Incomplete";
  } else if (["P", "CR", "AU"].includes(finalGrade)) {
    resultStatus = "Pass";
  } else if (gradePoint >= 2.0) {
    resultStatus = "Pass";
  }

  return { grade: finalGrade, gradePoint, percentage, resultStatus };
};

/**
 * Helper function to calculate grade based on percentage (from Grade model)
 */
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

/**
 * GET: Department / Course / Student Grade Report
 */
export const getGradesReport = async (req, res) => {
  try {
    const { 
      departmentId, 
      courseId, 
      studentId, 
      term, 
      academicYear, 
      instructorId, 
      isPublished,
      resultStatus,
      program,
      specialization,
      section,
      year,
      semester,
      appealStatus,
      moderationStatus,
      academicStanding,
      honorRoll,
      gpaScale,
      page = 1,
      limit = 20,
      sortBy = 'academicYear',
      sortOrder = 'desc'
    } = req.query;

    const filter = { isActive: true }; // Only active grades
    
    // Apply filters
    if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) filter.department = departmentId;
    if (courseId && mongoose.Types.ObjectId.isValid(courseId)) filter.course = courseId;
    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) filter.student = studentId;
    if (instructorId && mongoose.Types.ObjectId.isValid(instructorId)) filter.instructor = instructorId;
    if (term) filter.term = term;
    if (academicYear) filter.academicYear = academicYear;
    if (isPublished !== undefined) filter.isPublished = isPublished === 'true';
    if (resultStatus) filter.resultStatus = resultStatus;
    if (program) filter.program = program;
    if (specialization) filter.specialization = specialization;
    if (section) filter.section = section;
    if (year) filter.year = parseInt(year);
    if (semester) filter.semester = parseInt(semester);
    if (appealStatus) filter.appealStatus = appealStatus;
    if (moderationStatus) filter.moderationStatus = moderationStatus;
    if (academicStanding) filter.academicStanding = academicStanding;
    if (honorRoll) filter.honorRoll = honorRoll;
    if (gpaScale) filter.gpaScale = parseFloat(gpaScale);

    // Pagination
    const skip = (page - 1) * limit;
    
    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [grades, total] = await Promise.all([
      Grade.find(filter)
        .populate("student", "name rollNumber email")
        .populate("course", "name code creditHours")
        .populate("department", "name")
        .populate("instructor", "name email")
        .populate("lastUpdatedBy", "name")
        .populate("publishedBy", "name")
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      Grade.countDocuments(filter)
    ]);

    if (!grades.length) {
      return res.status(404).json({ 
        success: false,
        message: "No grades found matching criteria" 
      });
    }

    res.json({ 
      success: true,
      total, 
      page: Number(page),
      pages: Math.ceil(total / limit),
      grades 
    });
  } catch (error) {
    console.error("Grades Report Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to generate grades report", 
      error: error.message 
    });
  }
};

/**
 * GET: All Grades (Paginated)
 */
export const getAllGrades = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      isPublished, 
      academicYear, 
      term,
      sortBy = 'academicYear',
      sortOrder = 'desc',
      search
    } = req.query;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    if (isPublished !== undefined) filter.isPublished = isPublished === 'true';
    if (academicYear) filter.academicYear = academicYear;
    if (term) filter.term = term;
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { 'finalGrade': { $regex: search, $options: 'i' } },
        { 'resultStatus': { $regex: search, $options: 'i' } },
        { 'academicStanding': { $regex: search, $options: 'i' } },
        { 'honorRoll': { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [grades, total] = await Promise.all([
      Grade.find(filter)
        .populate("student", "name rollNumber email")
        .populate("course", "name code creditHours")
        .populate("department", "name")
        .populate("instructor", "name email")
        .populate("lastUpdatedBy", "name")
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      Grade.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      grades
    });
  } catch (error) {
    console.error("Get All Grades Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch grades", 
      error: error.message 
    });
  }
};

/**
 * GET: Single Grade by ID
 */
export const getGradeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid grade ID format" 
      });
    }

    const grade = await Grade.findOne({ _id: id, isActive: true })
      .populate("student", "name rollNumber email")
      .populate("course", "name code creditHours")
      .populate("department", "name")
      .populate("instructor", "name email")
      .populate("lastUpdatedBy", "name")
      .populate("publishedBy", "name")
      .populate("createdBy", "name")
      .populate("updatedBy", "name")
      .populate("lockedBy", "name")
 
      .populate("appealDecidedBy", "name")
      .populate("verifiedBy", "name");

    if (!grade) {
      return res.status(404).json({ 
        success: false,
        message: "Grade not found" 
      });
    }

    res.status(200).json({
      success: true,
      grade
    });
  } catch (error) {
    console.error("Get Grade By ID Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch grade", 
      error: error.message 
    });
  }
};

/**
 * POST: Create New Grade Record
 */
export const createGrade = async (req, res) => {
  try {
    const { 
      student, 
      department, 
      course, 
      instructor, 
      program,
      specialization,
      section,
      year, 
      semester, 
      term, 
      academicYear, 
      creditHours,
      gpaScale = 4.0,
      assessments = [],
      remarks,
      isAudit = false,
      isRepeat = false,
      repeatCount = 0,
      attendanceRate,
      tags = [],
      metadata = {}
    } = req.body;

    // Validate required fields
    const requiredFields = [
      "student", "department", "course", "instructor", "program", "section",
      "year", "semester", "term", "academicYear", "creditHours"
    ];
    
    const missingFields = requiredFields.filter(field => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: "Missing required fields", 
        missingFields 
      });
    }

    // Validate ObjectId formats
    const objectIdFields = { student, department, course, instructor };
    for (const [field, value] of Object.entries(objectIdFields)) {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return res.status(400).json({ 
          success: false,
          message: `Invalid ${field} ID format` 
        });
      }
    }

    // Validate references exist
    const [studentExists, departmentExists, courseExists, instructorExists] = await Promise.all([
      Student.findById(student),
      Department.findById(department),
      Course.findById(course),
      Teacher.findById(instructor)
    ]);

    if (!studentExists) {
      return res.status(404).json({ 
        success: false,
        message: "Student not found" 
      });
    }
    if (!departmentExists) {
      return res.status(404).json({ 
        success: false,
        message: "Department not found" 
      });
    }
    if (!courseExists) {
      return res.status(404).json({ 
        success: false,
        message: "Course not found" 
      });
    }
    if (!instructorExists) {
      return res.status(404).json({ 
        success: false,
        message: "Instructor not found" 
      });
    }

    // Check for existing grade with same unique combination
    const existingGrade = await Grade.findOne({ 
      student, 
      course, 
      term, 
      academicYear,
      isActive: true 
    });

    if (existingGrade) {
      return res.status(409).json({ 
        success: false,
        message: "Grade already exists for this student, course, term, and academic year", 
        existingGrade: {
          _id: existingGrade._id,
          student: existingGrade.student,
          course: existingGrade.course,
          term: existingGrade.term,
          academicYear: existingGrade.academicYear
        }
      });
    }

    // Validate assessments with proper date handling
    const validatedAssessments = assessments.map(assessment => {
      // Create a new assessment object to avoid modifying the original
      const newAssessment = {
        ...assessment,
        score: Math.max(0, parseFloat(assessment.score || 0)),
        maxScore: Math.max(1, parseFloat(assessment.maxScore || 100)),
        weight: Math.max(0, Math.min(100, parseFloat(assessment.weight || 0))),
        isAbsent: Boolean(assessment.isAbsent),
        isExcused: Boolean(assessment.isExcused),
        isExtraCredit: Boolean(assessment.isExtraCredit),
        status: assessment.status || "Pending"
      };
      
      // Handle dates properly
      if (assessment.dueDate) {
        newAssessment.dueDate = new Date(assessment.dueDate);
      }
      
      if (assessment.submittedDate) {
        newAssessment.submittedDate = new Date(assessment.submittedDate);
      }
      
      if (assessment.gradedDate) {
        newAssessment.gradedDate = new Date(assessment.gradedDate);
      }
      
     
      return newAssessment;
    });

    // Calculate final grade based on assessments
    const { grade, gradePoint, percentage, resultStatus } = calculateFinalGrade(validatedAssessments, gpaScale);

    // Calculate quality points
    const qualityPoints = gradePoint * parseFloat(creditHours);

    // Determine academic standing based on grade point
    let academicStanding = "Good";
    if (gradePoint >= 3.5) {
      academicStanding = "Excellent";
    } else if (gradePoint >= 3.0) {
      academicStanding = "Good";
    } else if (gradePoint >= 2.0) {
      academicStanding = "Satisfactory";
    } else if (gradePoint >= 1.0) {
      academicStanding = "Probation";
    } else {
      academicStanding = "Suspension";
    }

    // Create the new grade with only valid fields
    const newGradeData = {
      student,
      department,
      course,
      instructor,
      program: program.trim(),
      specialization: specialization?.trim(),
      section: section.trim(),
      year: parseInt(year),
      semester: parseInt(semester),
      term: term.trim(),
      academicYear: academicYear.trim(),
      creditHours: parseFloat(creditHours),
      gpaScale: parseFloat(gpaScale),
      assessments: validatedAssessments,
      finalGrade: grade,
      gradePoint,
      percentage,
      qualityPoints,
      resultStatus,
      academicStanding,
      isAudit: Boolean(isAudit),
      isRepeat: Boolean(isRepeat),
      repeatCount: parseInt(repeatCount),
      attendanceRate: attendanceRate ? parseFloat(attendanceRate) : undefined,
      remarks: remarks?.trim(),
      tags,
      metadata,
      createdBy: req.user?.id,
      lastUpdatedBy: req.user?.id
    };

    // Only add ObjectId fields if they're valid

    
    
    if (req.body.appealDecidedBy && mongoose.Types.ObjectId.isValid(req.body.appealDecidedBy)) {
      newGradeData.appealDecidedBy = req.body.appealDecidedBy;
    }
    
    if (req.body.publishedBy && mongoose.Types.ObjectId.isValid(req.body.publishedBy)) {
      newGradeData.publishedBy = req.body.publishedBy;
    }
    
    if (req.body.verifiedBy && mongoose.Types.ObjectId.isValid(req.body.verifiedBy)) {
      newGradeData.verifiedBy = req.body.verifiedBy;
    }

    const newGrade = new Grade(newGradeData);

    await newGrade.save();

    // Populate the created grade for response
    const populatedGrade = await Grade.findById(newGrade._id)
      .populate("student", "name rollNumber email")
      .populate("course", "name code creditHours")
      .populate("department", "name")
      .populate("instructor", "name email")
      .populate("createdBy", "name email")
      .populate("lastUpdatedBy", "name email");

    console.log("New Grade Created:", newGrade._id);

    res.status(201).json({ 
      success: true,
      message: "Grade created successfully", 
      grade: populatedGrade 
    });
  } catch (error) {
    console.error("Create Grade Error:", error);
    
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A grade with the same student, course, term, and academic year already exists",
        error: "DUPLICATE_GRADE"
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    res.status(500).json({ 
      success: false,
      message: "Failed to create grade", 
      error: error.message 
    });
  }
};
/**
 * PUT: Update Existing Grade
 */
export const updateGrade = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false,
        message: "Invalid grade ID format" 
      });
    }

    const gradeRecord = await Grade.findOne({ _id: id, isActive: true }).session(session);
    if (!gradeRecord) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false,
        message: "Grade not found" 
      });
    }

    // If grade is locked, restrict updates
    if (gradeRecord.isPublished && !req.body.forceUpdate) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: "Cannot update published grade without forceUpdate flag",
        error: "GRADE_PUBLISHED"
      });
    }

    const { assessments, ...otherUpdates } = req.body;
    
    // FIX: Handle ObjectId fields properly by converting empty strings to null
    const updates = {
      ...otherUpdates,
      lastUpdatedBy: req.user?.id
    };

    // Convert empty strings to null for ObjectId fields
    if (updates.previousGrade === "" || updates.previousGrade === undefined) {
      updates.previousGrade = null;
    } else if (updates.previousGrade && !mongoose.Types.ObjectId.isValid(updates.previousGrade)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Invalid previousGrade ID format"
      });
    }

    // Handle other ObjectId fields if needed
    if (updates.publishedBy === "" || updates.publishedBy === undefined) {
      updates.publishedBy = null;
    } else if (updates.publishedBy && !mongoose.Types.ObjectId.isValid(updates.publishedBy)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Invalid publishedBy ID format"
      });
    }

    if (updates.appealDecidedBy === "" || updates.appealDecidedBy === undefined) {
      updates.appealDecidedBy = null;
    } else if (updates.appealDecidedBy && !mongoose.Types.ObjectId.isValid(updates.appealDecidedBy)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Invalid appealDecidedBy ID format"
      });
    }

    // Ensure numeric fields are properly typed
    if (otherUpdates.year) updates.year = parseInt(otherUpdates.year);
    if (otherUpdates.semester) updates.semester = parseInt(otherUpdates.semester);
    if (otherUpdates.creditHours) updates.creditHours = parseFloat(otherUpdates.creditHours);
    if (otherUpdates.gpaScale) updates.gpaScale = parseFloat(otherUpdates.gpaScale);
    if (otherUpdates.attendanceRate) updates.attendanceRate = parseFloat(otherUpdates.attendanceRate);
    if (otherUpdates.repeatCount) updates.repeatCount = parseInt(otherUpdates.repeatCount);

    if (assessments) {
      const validatedAssessments = assessments.map(assessment => ({
        ...assessment,
        score: Math.max(0, parseFloat(assessment.score || 0)),
        maxScore: Math.max(1, parseFloat(assessment.maxScore || 100)),
        weight: Math.max(0, Math.min(100, parseFloat(assessment.weight || 0))),
        isAbsent: Boolean(assessment.isAbsent),
        isExcused: Boolean(assessment.isExcused),
        isExtraCredit: Boolean(assessment.isExtraCredit),
        status: assessment.status || "Pending"
      }));

      const gpaScale = updates.gpaScale || gradeRecord.gpaScale;
      const { grade, gradePoint, percentage, resultStatus } = calculateFinalGrade(validatedAssessments, gpaScale);
      
      // Calculate quality points
      const creditHours = updates.creditHours || gradeRecord.creditHours;
      const qualityPoints = gradePoint * creditHours;
      
      // Determine academic standing based on grade point
      let academicStanding = "Good";
      if (gradePoint >= 3.5) {
        academicStanding = "Excellent";
      } else if (gradePoint >= 3.0) {
        academicStanding = "Good";
      } else if (gradePoint >= 2.0) {
        academicStanding = "Satisfactory";
      } else if (gradePoint >= 1.0) {
        academicStanding = "Probation";
      } else {
        academicStanding = "Suspension";
      }
      
      updates.finalGrade = grade;
      updates.gradePoint = gradePoint;
      updates.percentage = percentage;
      updates.qualityPoints = qualityPoints;
      updates.resultStatus = resultStatus;
      updates.academicStanding = academicStanding;
      updates.assessments = validatedAssessments;
    }

    const updatedGrade = await Grade.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true, session }
    )
      .populate("student", "name rollNumber email")
      .populate("course", "name code creditHours")
      .populate("department", "name")
      .populate("instructor", "name email")
      .populate("lastUpdatedBy", "name");

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ 
      success: true,
      message: "Grade updated successfully", 
      grade: updatedGrade 
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    
    console.error("Update Grade Error:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Update would create a duplicate grade entry",
        error: "DUPLICATE_GRADE"
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    res.status(500).json({ 
      success: false,
      message: "Failed to update grade", 
      error: error.message 
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

/**
 * DELETE: Remove Grade (Soft delete by setting isActive to false)
 */
export const deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid grade ID format" 
      });
    }

    const grade = await Grade.findOne({ _id: id, isActive: true });
    if (!grade) {
      return res.status(404).json({ 
        success: false,
        message: "Grade not found" 
      });
    }

    // Check if grade is locked
    if (grade.isLocked) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete locked grade",
        error: "GRADE_LOCKED"
      });
    }

    // Check if grade is published
    if (grade.isPublished) {
      return res.status(403).json({
        success: false,
        message: "Cannot delete published grade",
        error: "GRADE_PUBLISHED"
      });
    }

    const deletedGrade = await Grade.findByIdAndUpdate(
      id, 
      { isActive: false, lastUpdatedBy: req.user?.id },
      { new: true }
    );
    
    res.status(200).json({ 
      success: true,
      message: "Grade deleted successfully", 
      grade: deletedGrade 
    });
  } catch (error) {
    console.error("Delete Grade Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete grade", 
      error: error.message 
    });
  }
};

/**
 * GET: Transcript for a Student
 */
export const getStudentTranscript = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { includeUnpublished = false, includeInProgress = false, academicYear = null, program = null } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid student ID format" 
      });
    }

    const studentExists = await Student.findById(studentId);
    if (!studentExists) {
      return res.status(404).json({ 
        success: false,
        message: "Student not found" 
      });
    }

    // Use the enhanced generateTranscript static method from Grade model
    const transcript = await Grade.generateTranscript(studentId, {
      includeUnpublished: includeUnpublished === 'true',
      includeInProgress: includeInProgress === 'true',
      academicYear,
      program
    });

    if (!transcript) {
      return res.status(404).json({ 
        success: false,
        message: "No grades found for this student" 
      });
    }

    res.status(200).json({
      success: true,
      transcript
    });
  } catch (error) {
    console.error("Transcript Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get transcript", 
      error: error.message 
    });
  }
};

/**
 * NEW: GET: Student Results by Semester
 * Provides detailed semester-wise breakdown of a student's results with subject mark details
 */
export const getStudentResultsBySemester = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { academicYear = null, program = null, includeAssessments = true } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid student ID format" 
      });
    }

    const studentExists = await Student.findById(studentId);
    if (!studentExists) {
      return res.status(404).json({ 
        success: false,
        message: "Student not found" 
      });
    }

    // Build filter
    const filter = { 
      student: studentId, 
      isActive: true,
      isPublished: true
    };
    
    if (academicYear) filter.academicYear = academicYear;
    if (program) filter.program = program;

    // Get all grades for the student
    const grades = await Grade.find(filter)
      .populate("course", "name code creditHours")
      .populate("department", "name")
      .populate("instructor", "name")
      .sort({ academicYear: 1, semester: 1 });

    if (!grades.length) {
      return res.status(404).json({ 
        success: false,
        message: "No grades found for this student" 
      });
    }

    // Group grades by academic year and semester
    const semesters = {};
    let totalCredits = 0;
    let totalQualityPoints = 0;
    let overallGPA = 0;

    grades.forEach(grade => {
      const year = grade.academicYear;
      const semester = grade.semester;
      const term = grade.term;

      if (!semesters[year]) {
        semesters[year] = {};
      }

      if (!semesters[year][semester]) {
        semesters[year][semester] = {
          term,
          courses: [],
          semesterCredits: 0,
          semesterQualityPoints: 0,
          semesterGPA: 0,
          totalCourses: 0,
          passedCourses: 0,
          failedCourses: 0
        };
      }

      // Add course details
      const courseDetails = {
        courseId: grade.course._id,
        courseName: grade.course.name,
        courseCode: grade.course.code,
        creditHours: grade.creditHours,
        finalGrade: grade.finalGrade,
        gradePoint: grade.gradePoint,
        percentage: grade.percentage,
        resultStatus: grade.resultStatus,
        instructor: grade.instructor.name,
        department: grade.department.name
      };

      // Include assessment details if requested
      if (includeAssessments === 'true' && grade.assessments && grade.assessments.length > 0) {
        courseDetails.assessments = grade.assessments.map(assessment => ({
          title: assessment.title,
          assessmentType: assessment.assessmentType,
          score: assessment.score,
          maxScore: assessment.maxScore,
          weight: assessment.weight,
          percentage: parseFloat(((assessment.score / assessment.maxScore) * 100).toFixed(2)),
          status: assessment.status,
          isExcused: assessment.isExcused,
          isAbsent: assessment.isAbsent
        }));
      }

      semesters[year][semester].courses.push(courseDetails);
      semesters[year][semester].semesterCredits += grade.creditHours;
      semesters[year][semester].semesterQualityPoints += grade.qualityPoints;
      semesters[year][semester].totalCourses++;

      if (grade.resultStatus === "Pass") {
        semesters[year][semester].passedCourses++;
      } else if (grade.resultStatus === "Fail") {
        semesters[year][semester].failedCourses++;
      }

      // Update totals
      totalCredits += grade.creditHours;
      totalQualityPoints += grade.qualityPoints;
    });

    // Calculate semester GPAs
    Object.keys(semesters).forEach(year => {
      Object.keys(semesters[year]).forEach(semester => {
        const semesterData = semesters[year][semester];
        semesterData.semesterGPA = semesterData.semesterCredits > 0
          ? parseFloat((semesterData.semesterQualityPoints / semesterData.semesterCredits).toFixed(2))
          : 0;
      });
    });

    // Calculate overall GPA
    overallGPA = totalCredits > 0
      ? parseFloat((totalQualityPoints / totalCredits).toFixed(2))
      : 0;

    // Get student details
    const studentDetails = await Student.findById(studentId)
      .populate("user", "name email")
      .populate("program", "name");

    res.status(200).json({
      success: true,
      student: studentDetails,
      academicYear: academicYear || 'All',
      program: program || 'All',
      overallGPA,
      totalCredits,
      semesters
    });
  } catch (error) {
    console.error("Get Student Results By Semester Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get student results by semester", 
      error: error.message 
    });
  }
};

/**
 * NEW: GET: Department Results by Year and Semester
 * Provides department-specific results by academic year and semester
 */
export const getDepartmentResultsByYearAndSemester = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { academicYear, semester, term, program, includeStatistics = true } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid department ID format" 
      });
    }

    const departmentExists = await Department.findById(departmentId);
    if (!departmentExists) {
      return res.status(404).json({ 
        success: false,
        message: "Department not found" 
      });
    }

    // Build filter
    const filter = { 
      department: departmentId, 
      isActive: true,
      isPublished: true
    };
    
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = parseInt(semester);
    if (term) filter.term = term;
    if (program) filter.program = program;

    // Get all grades for the department
    const grades = await Grade.find(filter)
      .populate("student", "name rollNumber")
      .populate("course", "name code")
      .populate("instructor", "name")
      .sort({ academicYear: 1, semester: 1, course: 1 });

    if (!grades.length) {
      return res.status(404).json({ 
        success: false,
        message: "No grades found for this department" 
      });
    }

    // Group grades by academic year and semester
    const results = {};
    let totalStudents = new Set();
    let totalCourses = new Set();
    let totalPasses = 0;
    let totalFails = 0;
    let totalCredits = 0;
    let totalQualityPoints = 0;

    grades.forEach(grade => {
      const year = grade.academicYear;
      const sem = grade.semester;
      const termName = grade.term;
      const courseId = grade.course._id.toString();
      const studentId = grade.student._id.toString();

      if (!results[year]) {
        results[year] = {};
      }

      if (!results[year][sem]) {
        results[year][sem] = {
          term: termName,
          courses: {},
          students: new Set(),
          semesterCredits: 0,
          semesterQualityPoints: 0,
          semesterGPA: 0,
          totalCourses: 0,
          passedCourses: 0,
          failedCourses: 0,
          totalStudents: 0
        };
      }

      // Track unique students
      results[year][sem].students.add(studentId);
      totalStudents.add(studentId);
      
      // Track unique courses
      totalCourses.add(courseId);

      // Group by course
      if (!results[year][sem].courses[courseId]) {
        results[year][sem].courses[courseId] = {
          course: {
            id: courseId,
            name: grade.course.name,
            code: grade.course.code
          },
          instructor: grade.instructor.name,
          students: [],
          totalScore: 0,
          maxScore: 0,
          averageScore: 0,
          averageGradePoint: 0,
          passRate: 0,
          totalStudents: 0,
          passedStudents: 0,
          failedStudents: 0
        };
      }

      // Add student to course
      results[year][sem].courses[courseId].students.push({
        id: studentId,
        name: grade.student.name,
        rollNumber: grade.student.rollNumber,
        finalGrade: grade.finalGrade,
        gradePoint: grade.gradePoint,
        percentage: grade.percentage,
        resultStatus: grade.resultStatus
      });

      // Update course statistics
      results[year][sem].courses[courseId].totalScore += grade.percentage || 0;
      results[year][sem].courses[courseId].maxScore += 100; // Assuming percentage scale
      results[year][sem].courses[courseId].averageGradePoint += grade.gradePoint || 0;
      results[year][sem].courses[courseId].totalStudents++;

      if (grade.resultStatus === "Pass") {
        results[year][sem].courses[courseId].passedStudents++;
        results[year][sem].passedCourses++;
        totalPasses++;
      } else if (grade.resultStatus === "Fail") {
        results[year][sem].courses[courseId].failedStudents++;
        results[year][sem].failedCourses++;
        totalFails++;
      }

      // Update semester statistics
      results[year][sem].semesterCredits += grade.creditHours || 0;
      results[year][sem].semesterQualityPoints += grade.qualityPoints || 0;
      results[year][sem].totalCourses++;

      // Update overall statistics
      totalCredits += grade.creditHours || 0;
      totalQualityPoints += grade.qualityPoints || 0;
    });

    // Calculate averages and rates
    Object.keys(results).forEach(year => {
      Object.keys(results[year]).forEach(sem => {
        const semesterData = results[year][sem];
        
        // Convert Set to count
        semesterData.totalStudents = semesterData.students.size;
        
        // Calculate semester GPA
        semesterData.semesterGPA = semesterData.semesterCredits > 0
          ? parseFloat((semesterData.semesterQualityPoints / semesterData.semesterCredits).toFixed(2))
          : 0;
        
        // Calculate course statistics
        Object.keys(semesterData.courses).forEach(courseId => {
          const courseData = semesterData.courses[courseId];
          courseData.averageScore = courseData.totalStudents > 0
            ? parseFloat((courseData.totalScore / courseData.totalStudents).toFixed(2))
            : 0;
          courseData.averageGradePoint = courseData.totalStudents > 0
            ? parseFloat((courseData.averageGradePoint / courseData.totalStudents).toFixed(2))
            : 0;
          courseData.passRate = courseData.totalStudents > 0
            ? parseFloat(((courseData.passedStudents / courseData.totalStudents) * 100).toFixed(2))
            : 0;
        });
      });
    });

    // Calculate overall GPA
    const overallGPA = totalCredits > 0
      ? parseFloat((totalQualityPoints / totalCredits).toFixed(2))
      : 0;

    // Prepare response
    const response = {
      success: true,
      department: {
        id: departmentId,
        name: departmentExists.name
      },
      academicYear: academicYear || 'All',
      semester: semester || 'All',
      term: term || 'All',
      program: program || 'All',
      overallStatistics: {
        totalStudents: totalStudents.size,
        totalCourses: totalCourses.size,
        overallGPA,
        totalPasses,
        totalFails,
        passRate: (totalPasses + totalFails) > 0
          ? parseFloat(((totalPasses / (totalPasses + totalFails)) * 100).toFixed(2))
          : 0
      },
      results
    };

    // Add additional statistics if requested
    if (includeStatistics === 'true') {
      // Use the enhanced getDepartmentStatistics static method from Grade model
      const statistics = await Grade.getDepartmentStatistics(departmentId, academicYear, {
        term,
        includeCourseBreakdown: true,
        includeInstructorBreakdown: true,
        includeProgramBreakdown: true
      });
      
      response.statistics = statistics;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Get Department Results By Year And Semester Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get department results by year and semester", 
      error: error.message 
    });
  }
};

/**
 * NEW: GET: Results by Year and Semester
 * Provides general results filtered by academic year and semester
 */
export const getResultsByYearAndSemester = async (req, res) => {
  try {
    const { academicYear, semester, term, departmentId, program, includeStatistics = true } = req.query;
    
    if (!academicYear || !semester) {
      return res.status(400).json({
        success: false,
        message: "academicYear and semester are required"
      });
    }

    // Build filter
    const filter = { 
      academicYear,
      semester: parseInt(semester),
      isActive: true,
      isPublished: true
    };
    
    if (term) filter.term = term;
    if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) filter.department = departmentId;
    if (program) filter.program = program;

    // Get all grades for the specified academic year and semester
    const grades = await Grade.find(filter)
      .populate("student", "name rollNumber")
      .populate("course", "name code")
      .populate("department", "name")
      .populate("instructor", "name")
      .sort({ department: 1, course: 1, student: 1 });

    if (!grades.length) {
      return res.status(404).json({ 
        success: false,
        message: "No grades found for the specified academic year and semester" 
      });
    }

    // Group grades by department
    const departments = {};
    let totalStudents = new Set();
    let totalCourses = new Set();
    let totalPasses = 0;
    let totalFails = 0;
    let totalCredits = 0;
    let totalQualityPoints = 0;

    grades.forEach(grade => {
      const departmentId = grade.department._id.toString();
      const departmentName = grade.department.name;
      const courseId = grade.course._id.toString();
      const studentId = grade.student._id.toString();

      if (!departments[departmentId]) {
        departments[departmentId] = {
          name: departmentName,
          courses: {},
          students: new Set(),
          departmentCredits: 0,
          departmentQualityPoints: 0,
          departmentGPA: 0,
          totalCourses: 0,
          passedCourses: 0,
          failedCourses: 0,
          totalStudents: 0
        };
      }

      // Track unique students
      departments[departmentId].students.add(studentId);
      totalStudents.add(studentId);
      
      // Track unique courses
      totalCourses.add(courseId);

      // Group by course
      if (!departments[departmentId].courses[courseId]) {
        departments[departmentId].courses[courseId] = {
          course: {
            id: courseId,
            name: grade.course.name,
            code: grade.course.code
          },
          instructor: grade.instructor.name,
          students: [],
          totalScore: 0,
          maxScore: 0,
          averageScore: 0,
          averageGradePoint: 0,
          passRate: 0,
          totalStudents: 0,
          passedStudents: 0,
          failedStudents: 0
        };
      }

      // Add student to course
      departments[departmentId].courses[courseId].students.push({
        id: studentId,
        name: grade.student.name,
        rollNumber: grade.student.rollNumber,
        finalGrade: grade.finalGrade,
        gradePoint: grade.gradePoint,
        percentage: grade.percentage,
        resultStatus: grade.resultStatus
      });

      // Update course statistics
      departments[departmentId].courses[courseId].totalScore += grade.percentage || 0;
      departments[departmentId].courses[courseId].maxScore += 100; // Assuming percentage scale
      departments[departmentId].courses[courseId].averageGradePoint += grade.gradePoint || 0;
      departments[departmentId].courses[courseId].totalStudents++;

      if (grade.resultStatus === "Pass") {
        departments[departmentId].courses[courseId].passedStudents++;
        departments[departmentId].passedCourses++;
        totalPasses++;
      } else if (grade.resultStatus === "Fail") {
        departments[departmentId].courses[courseId].failedStudents++;
        departments[departmentId].failedCourses++;
        totalFails++;
      }

      // Update department statistics
      departments[departmentId].departmentCredits += grade.creditHours || 0;
      departments[departmentId].departmentQualityPoints += grade.qualityPoints || 0;
      departments[departmentId].totalCourses++;

      // Update overall statistics
      totalCredits += grade.creditHours || 0;
      totalQualityPoints += grade.qualityPoints || 0;
    });

    // Calculate averages and rates
    Object.keys(departments).forEach(departmentId => {
      const departmentData = departments[departmentId];
      
      // Convert Set to count
      departmentData.totalStudents = departmentData.students.size;
      
      // Calculate department GPA
      departmentData.departmentGPA = departmentData.departmentCredits > 0
        ? parseFloat((departmentData.departmentQualityPoints / departmentData.departmentCredits).toFixed(2))
        : 0;
      
      // Calculate course statistics
      Object.keys(departmentData.courses).forEach(courseId => {
        const courseData = departmentData.courses[courseId];
        courseData.averageScore = courseData.totalStudents > 0
          ? parseFloat((courseData.totalScore / courseData.totalStudents).toFixed(2))
          : 0;
        courseData.averageGradePoint = courseData.totalStudents > 0
          ? parseFloat((courseData.averageGradePoint / courseData.totalStudents).toFixed(2))
          : 0;
        courseData.passRate = courseData.totalStudents > 0
          ? parseFloat(((courseData.passedStudents / courseData.totalStudents) * 100).toFixed(2))
          : 0;
      });
    });

    // Calculate overall GPA
    const overallGPA = totalCredits > 0
      ? parseFloat((totalQualityPoints / totalCredits).toFixed(2))
      : 0;

    // Prepare response
    const response = {
      success: true,
      academicYear,
      semester,
      term: term || 'All',
      program: program || 'All',
      overallStatistics: {
        totalDepartments: Object.keys(departments).length,
        totalStudents: totalStudents.size,
        totalCourses: totalCourses.size,
        overallGPA,
        totalPasses,
        totalFails,
        passRate: (totalPasses + totalFails) > 0
          ? parseFloat(((totalPasses / (totalPasses + totalFails)) * 100).toFixed(2))
          : 0
      },
      departments
    };

    // Add additional statistics if requested
    if (includeStatistics === 'true') {
      // Get class statistics for each course
      const courseStatistics = {};
      
      for (const departmentId of Object.keys(departments)) {
        for (const courseId of Object.keys(departments[departmentId].courses)) {
          const course = departments[departmentId].courses[courseId];
          const statistics = await Grade.getClassStatistics(courseId, term, academicYear, {
            includeDistribution: true,
            includePercentiles: true
          });
          
          courseStatistics[courseId] = statistics;
        }
      }
      
      response.courseStatistics = courseStatistics;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Get Results By Year And Semester Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get results by year and semester", 
      error: error.message 
    });
  }
};

/**
 * NEW: GET: Section Results
 * Provides section-specific results with detailed statistics
 */
export const getSectionResults = async (req, res) => {
  try {
    const { section, academicYear, semester, term, departmentId, courseId, program, includeStatistics = true } = req.query;
    
    if (!section) {
      return res.status(400).json({
        success: false,
        message: "section is required"
      });
    }

    // Build filter
    const filter = { 
      section,
      isActive: true,
      isPublished: true
    };
    
    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = parseInt(semester);
    if (term) filter.term = term;
    if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) filter.department = departmentId;
    if (courseId && mongoose.Types.ObjectId.isValid(courseId)) filter.course = courseId;
    if (program) filter.program = program;

    // Get all grades for the specified section
    const grades = await Grade.find(filter)
      .populate("student", "name rollNumber email")
      .populate("course", "name code creditHours")
      .populate("department", "name")
      .populate("instructor", "name")
      .sort({ academicYear: 1, semester: 1, course: 1 });

    if (!grades.length) {
      return res.status(404).json({ 
        success: false,
        message: "No grades found for the specified section" 
      });
    }

    // Group grades by academic year and semester
    const results = {};
    let totalStudents = new Set();
    let totalCourses = new Set();
    let totalPasses = 0;
    let totalFails = 0;
    let totalCredits = 0;
    let totalQualityPoints = 0;

    grades.forEach(grade => {
      const year = grade.academicYear;
      const sem = grade.semester;
      const termName = grade.term;
      const courseId = grade.course._id.toString();
      const studentId = grade.student._id.toString();

      if (!results[year]) {
        results[year] = {};
      }

      if (!results[year][sem]) {
        results[year][sem] = {
          term: termName,
          courses: {},
          students: new Set(),
          semesterCredits: 0,
          semesterQualityPoints: 0,
          semesterGPA: 0,
          totalCourses: 0,
          passedCourses: 0,
          failedCourses: 0,
          totalStudents: 0
        };
      }

      // Track unique students
      results[year][sem].students.add(studentId);
      totalStudents.add(studentId);
      
      // Track unique courses
      totalCourses.add(courseId);

      // Group by course
      if (!results[year][sem].courses[courseId]) {
        results[year][sem].courses[courseId] = {
          course: {
            id: courseId,
            name: grade.course.name,
            code: grade.course.code,
            creditHours: grade.course.creditHours
          },
          instructor: grade.instructor.name,
          department: grade.department.name,
          students: [],
          totalScore: 0,
          maxScore: 0,
          averageScore: 0,
          averageGradePoint: 0,
          passRate: 0,
          totalStudents: 0,
          passedStudents: 0,
          failedStudents: 0
        };
      }

      // Add student to course
      results[year][sem].courses[courseId].students.push({
        id: studentId,
        name: grade.student.name,
        rollNumber: grade.student.rollNumber,
        email: grade.student.email,
        finalGrade: grade.finalGrade,
        gradePoint: grade.gradePoint,
        percentage: grade.percentage,
        resultStatus: grade.resultStatus,
        academicStanding: grade.academicStanding
      });

      // Update course statistics
      results[year][sem].courses[courseId].totalScore += grade.percentage || 0;
      results[year][sem].courses[courseId].maxScore += 100; // Assuming percentage scale
      results[year][sem].courses[courseId].averageGradePoint += grade.gradePoint || 0;
      results[year][sem].courses[courseId].totalStudents++;

      if (grade.resultStatus === "Pass") {
        results[year][sem].courses[courseId].passedStudents++;
        results[year][sem].passedCourses++;
        totalPasses++;
      } else if (grade.resultStatus === "Fail") {
        results[year][sem].courses[courseId].failedStudents++;
        results[year][sem].failedCourses++;
        totalFails++;
      }

      // Update semester statistics
      results[year][sem].semesterCredits += grade.creditHours || 0;
      results[year][sem].semesterQualityPoints += grade.qualityPoints || 0;
      results[year][sem].totalCourses++;

      // Update overall statistics
      totalCredits += grade.creditHours || 0;
      totalQualityPoints += grade.qualityPoints || 0;
    });

    // Calculate averages and rates
    Object.keys(results).forEach(year => {
      Object.keys(results[year]).forEach(sem => {
        const semesterData = results[year][sem];
        
        // Convert Set to count
        semesterData.totalStudents = semesterData.students.size;
        
        // Calculate semester GPA
        semesterData.semesterGPA = semesterData.semesterCredits > 0
          ? parseFloat((semesterData.semesterQualityPoints / semesterData.semesterCredits).toFixed(2))
          : 0;
        
        // Calculate course statistics
        Object.keys(semesterData.courses).forEach(courseId => {
          const courseData = semesterData.courses[courseId];
          courseData.averageScore = courseData.totalStudents > 0
            ? parseFloat((courseData.totalScore / courseData.totalStudents).toFixed(2))
            : 0;
          courseData.averageGradePoint = courseData.totalStudents > 0
            ? parseFloat((courseData.averageGradePoint / courseData.totalStudents).toFixed(2))
            : 0;
          courseData.passRate = courseData.totalStudents > 0
            ? parseFloat(((courseData.passedStudents / courseData.totalStudents) * 100).toFixed(2))
            : 0;
        });
      });
    });

    // Calculate overall GPA
    const overallGPA = totalCredits > 0
      ? parseFloat((totalQualityPoints / totalCredits).toFixed(2))
      : 0;

    // Prepare response
    const response = {
      success: true,
      section,
      academicYear: academicYear || 'All',
      semester: semester || 'All',
      term: term || 'All',
      departmentId: departmentId || 'All',
      courseId: courseId || 'All',
      program: program || 'All',
      overallStatistics: {
        totalStudents: totalStudents.size,
        totalCourses: totalCourses.size,
        overallGPA,
        totalPasses,
        totalFails,
        passRate: (totalPasses + totalFails) > 0
          ? parseFloat(((totalPasses / (totalPasses + totalFails)) * 100).toFixed(2))
          : 0
      },
      results
    };

    // Add additional statistics if requested
    if (includeStatistics === 'true') {
      // Get class statistics for each course
      const courseStatistics = {};
      
      for (const year of Object.keys(results)) {
        for (const sem of Object.keys(results[year])) {
          for (const courseId of Object.keys(results[year][sem].courses)) {
            const course = results[year][sem].courses[courseId];
            const statistics = await Grade.getClassStatistics(courseId, term, year, {
              includeDistribution: true,
              includePercentiles: true
            });
            
            courseStatistics[courseId] = statistics;
          }
        }
      }
      
      response.courseStatistics = courseStatistics;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Get Section Results Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get section results", 
      error: error.message 
    });
  }
};

/**
 * PATCH: Publish/Unpublish Grade
 */
export const publishGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid grade ID format" 
      });
    }

    const gradeExists = await Grade.findOne({ _id: id, isActive: true });
    if (!gradeExists) {
      return res.status(404).json({ 
        success: false,
        message: "Grade not found" 
      });
    }

    // Check if grade is locked
    if (gradeExists.isLocked) {
      return res.status(403).json({
        success: false,
        message: "Cannot publish/unpublish locked grade",
        error: "GRADE_LOCKED"
      });
    }

    const updateData = { 
      isPublished: Boolean(isPublished),
      lastUpdatedBy: req.user?.id
    };

    if (isPublished) {
      // Validate that grade has all required fields before publishing
      if (!gradeExists.finalGrade || gradeExists.percentage === undefined) {
        return res.status(400).json({
          success: false,
          message: "Cannot publish grade without final grade and percentage calculated",
          error: "INCOMPLETE_GRADE"
        });
      }

      updateData.publishedBy = req.user?.id;
      updateData.publishedDate = new Date();
    } else {
      updateData.publishedBy = null;
      updateData.publishedDate = null;
    }

    const updatedGrade = await Grade.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("student", "name rollNumber")
      .populate("course", "name code")
      .populate("publishedBy", "name")
      .populate("lastUpdatedBy", "name");

    res.status(200).json({
      success: true,
      message: `Grade ${isPublished ? 'published' : 'unpublished'} successfully`,
      grade: updatedGrade
    });
  } catch (error) {
    console.error("Publish Grade Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update grade publication status", 
      error: error.message 
    });
  }
};

/**
 * GET: Student GPA
 */
export const getStudentGPA = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { 
      academicYear = null, 
      term = null, 
      program = null,
      gpaScale = 4.0,
      includeInProgress = false,
      includeWithdrawn = false,
      onlyPassed = true,
      onlyCompleted = false
    } = req.query;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid student ID format" 
      });
    }

    const studentExists = await Student.findById(studentId);
    if (!studentExists) {
      return res.status(404).json({ 
        success: false,
        message: "Student not found" 
      });
    }

    // Use the enhanced calculateGPA static method from Grade model
    const gpaData = await Grade.calculateGPA(studentId, {
      academicYear,
      term,
      program,
      gpaScale: parseFloat(gpaScale),
      includeInProgress: includeInProgress === 'true',
      includeWithdrawn: includeWithdrawn === 'true',
      onlyPassed: onlyPassed === 'true',
      onlyCompleted: onlyCompleted === 'true'
    });

    res.status(200).json({
      success: true,
      studentId,
      student: {
        name: studentExists.name,
        rollNumber: studentExists.rollNumber
      },
      academicYear: academicYear || 'All',
      term: term || 'All',
      program: program || 'All',
      gpaScale,
      gpaData
    });
  } catch (error) {
    console.error("Get GPA Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to calculate GPA", 
      error: error.message 
    });
  }
};

/**
 * GET: Class Statistics for a Course
 */
export const getClassStatistics = async (req, res) => {
  try {
    const { courseId, term, academicYear } = req.query;
    const { includeDistribution = true, includePercentiles = true, section = null } = req.query;

    if (!courseId || !term || !academicYear) {
      return res.status(400).json({
        success: false,
        message: "courseId, term, and academicYear are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid course ID format" 
      });
    }

    // Use the enhanced getClassStatistics static method from Grade model
    const statistics = await Grade.getClassStatistics(courseId, term, academicYear, {
      includeDistribution: includeDistribution === 'true',
      includePercentiles: includePercentiles === 'true',
      section
    });

    res.status(200).json({
      success: true,
      courseId,
      term,
      academicYear,
      statistics
    });
  } catch (error) {
    console.error("Class Statistics Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get class statistics", 
      error: error.message 
    });
  }
};

/**
 * GET: Department Statistics for an Academic Year
 */
export const getDepartmentStatistics = async (req, res) => {
  try {
    const { departmentId, academicYear } = req.query;
    const { 
      term = null,
      includeCourseBreakdown = true,
      includeInstructorBreakdown = true,
      includeProgramBreakdown = true
    } = req.query;

    if (!departmentId || !academicYear) {
      return res.status(400).json({
        success: false,
        message: "departmentId and academicYear are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid department ID format" 
      });
    }

    // Use the enhanced getDepartmentStatistics static method from Grade model
    const statistics = await Grade.getDepartmentStatistics(departmentId, academicYear, {
      term,
      includeCourseBreakdown: includeCourseBreakdown === 'true',
      includeInstructorBreakdown: includeInstructorBreakdown === 'true',
      includeProgramBreakdown: includeProgramBreakdown === 'true'
    });

    res.status(200).json({
      success: true,
      departmentId,
      academicYear,
      statistics
    });
  } catch (error) {
    console.error("Department Statistics Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get department statistics", 
      error: error.message 
    });
  }
};

/**
 * GET: Honor Roll
 */
export const getHonorRoll = async (req, res) => {
  try {
    const { 
      academicYear = null,
      term = null,
      program = null,
      minGPA = 3.5,
      minCredits = 12,
      honorRollType = "Dean's List"
    } = req.query;

    // Use the getHonorRoll static method from Grade model
    const honorRollStudents = await Grade.getHonorRoll({
      academicYear,
      term,
      program,
      minGPA: parseFloat(minGPA),
      minCredits: parseInt(minCredits),
      honorRollType
    });

    res.status(200).json({
      success: true,
      honorRollType,
      minGPA,
      minCredits,
      honorRollStudents
    });
  } catch (error) {
    console.error("Get Honor Roll Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get honor roll", 
      error: error.message 
    });
  }
};

/**
 * GET: Graduation Requirements Status
 */
export const getGraduationRequirementsStatus = async (req, res) => {
  try {
    const { studentId, programId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid student ID format" 
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(programId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid program ID format" 
      });
    }

    // Use the getGraduationRequirementsStatus static method from Grade model
    const graduationStatus = await Grade.getGraduationRequirementsStatus(studentId, programId);

    res.status(200).json({
      success: true,
      graduationStatus
    });
  } catch (error) {
    console.error("Get Graduation Requirements Status Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get graduation requirements status", 
      error: error.message 
    });
  }
};

/**
 * POST: Lock Grade for Editing
 */
export const lockGrade = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid grade ID format" 
      });
    }

    const grade = await Grade.findOne({ _id: id, isActive: true });
    if (!grade) {
      return res.status(404).json({ 
        success: false,
        message: "Grade not found" 
      });
    }

    // Check if grade is already locked
    if (grade.isLocked) {
      return res.status(409).json({
        success: false,
        message: "Grade is already locked",
        error: "ALREADY_LOCKED"
      });
    }

    // Lock the grade using the instance method
    await grade.lock(req.user?.id);

    // Get updated grade with populated fields
    const updatedGrade = await Grade.findById(id)
      .populate("lockedBy", "name")
      .populate("lastUpdatedBy", "name");

    res.status(200).json({
      success: true,
      message: "Grade locked successfully",
      grade: updatedGrade
    });
  } catch (error) {
    console.error("Lock Grade Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to lock grade", 
      error: error.message 
    });
  }
};

/**
 * POST: Unlock Grade for Editing
 */
export const unlockGrade = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid grade ID format" 
      });
    }

    const grade = await Grade.findOne({ _id: id, isActive: true });
    if (!grade) {
      return res.status(404).json({ 
        success: false,
        message: "Grade not found" 
      });
    }

    // Check if grade is already unlocked
    if (!grade.isLocked) {
      return res.status(409).json({
        success: false,
        message: "Grade is already unlocked",
        error: "ALREADY_UNLOCKED"
      });
    }

    // Unlock the grade using the instance method
    await grade.unlock();

    // Get updated grade with populated fields
    const updatedGrade = await Grade.findById(id)
      .populate("lastUpdatedBy", "name");

    res.status(200).json({
      success: true,
      message: "Grade unlocked successfully",
      grade: updatedGrade
    });
  } catch (error) {
    console.error("Unlock Grade Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to unlock grade", 
      error: error.message 
    });
  }
};

/**
 * POST: Submit Grade for Moderation
 */
export const submitForModeration = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid grade ID format" 
      });
    }

    const grade = await Grade.findOne({ _id: id, isActive: true });
    if (!grade) {
      return res.status(404).json({ 
        success: false,
        message: "Grade not found" 
      });
    }

    // Check if grade is already submitted for moderation
    if (grade.moderationStatus !== 'None') {
      return res.status(409).json({
        success: false,
        message: `Grade is already ${grade.moderationStatus.toLowerCase()}`,
        error: "ALREADY_SUBMITTED"
      });
    }

    // Submit for moderation using the instance method
    await grade.submitForModeration(req.user?.id, notes);

    // Get updated grade with populated fields
    const updatedGrade = await Grade.findById(id)
       
      .populate("lastUpdatedBy", "name");

    res.status(200).json({
      success: true,
      message: "Grade submitted for moderation successfully",
      grade: updatedGrade
    });
  } catch (error) {
    console.error("Submit for Moderation Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to submit grade for moderation", 
      error: error.message 
    });
  }
};

/**
 * POST: Approve Moderated Grade
 */
export const approveModeration = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid grade ID format" 
      });
    }

    const grade = await Grade.findOne({ _id: id, isActive: true });
    if (!grade) {
      return res.status(404).json({ 
        success: false,
        message: "Grade not found" 
      });
    }

    // Check if grade is pending moderation
    if (grade.moderationStatus !== 'Pending') {
      return res.status(409).json({
        success: false,
        message: `Grade is not pending moderation (current status: ${grade.moderationStatus})`,
        error: "NOT_PENDING"
      });
    }

    // Approve moderation using the instance method
    await grade.approveModeration(req.user?.id, notes);

    // Get updated grade with populated fields
    const updatedGrade = await Grade.findById(id)
      
      .populate("lastUpdatedBy", "name");

    res.status(200).json({
      success: true,
      message: "Grade moderation approved successfully",
      grade: updatedGrade
    });
  } catch (error) {
    console.error("Approve Moderation Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to approve grade moderation", 
      error: error.message 
    });
  }
};

/**
 * POST: Reject Moderated Grade
 */
export const rejectModeration = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid grade ID format" 
      });
    }

    const grade = await Grade.findOne({ _id: id, isActive: true });
    if (!grade) {
      return res.status(404).json({ 
        success: false,
        message: "Grade not found" 
      });
    }

    // Check if grade is pending moderation
    if (grade.moderationStatus !== 'Pending') {
      return res.status(409).json({
        success: false,
        message: `Grade is not pending moderation (current status: ${grade.moderationStatus})`,
        error: "NOT_PENDING"
      });
    }

    // Reject moderation using the instance method
    await grade.rejectModeration(req.user?.id, notes);

    // Get updated grade with populated fields
    const updatedGrade = await Grade.findById(id)
      
      .populate("lastUpdatedBy", "name");

    res.status(200).json({
      success: true,
      message: "Grade moderation rejected successfully",
      grade: updatedGrade
    });
  } catch (error) {
    console.error("Reject Moderation Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to reject grade moderation", 
      error: error.message 
    });
  }
};

/**
 * POST: Submit Grade Appeal
 */
export const submitAppeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid grade ID format" 
      });
    }

    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Appeal reason is required"
      });
    }

    const grade = await Grade.findOne({ _id: id, isActive: true });
    if (!grade) {
      return res.status(404).json({ 
        success: false,
        message: "Grade not found" 
      });
    }

    // Check if grade can be appealed using the instance method
    if (!grade.canAppeal()) {
      return res.status(409).json({
        success: false,
        message: "This grade cannot be appealed",
        error: "CANNOT_APPEAL"
      });
    }

    // Update grade with appeal information
    const updatedGrade = await Grade.findByIdAndUpdate(
      id,
      {
        appealStatus: 'Requested',
        appealReason: reason.trim(),
        lastUpdatedBy: req.user?.id
      },
      { new: true, runValidators: true }
    )
      .populate("student", "name rollNumber")
      .populate("course", "name code")
      .populate("lastUpdatedBy", "name");

    res.status(200).json({
      success: true,
      message: "Grade appeal submitted successfully",
      grade: updatedGrade
    });
  } catch (error) {
    console.error("Submit Appeal Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to submit grade appeal", 
      error: error.message 
    });
  }
};

/**
 * POST: Decide Grade Appeal
 */
export const decideAppeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, newGrade, newGradePoint, newPercentage } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid grade ID format" 
      });
    }

    if (!decision || !['Approved', 'Rejected'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Valid decision (Approved or Rejected) is required"
      });
    }

    const grade = await Grade.findOne({ _id: id, isActive: true });
    if (!grade) {
      return res.status(404).json({ 
        success: false,
        message: "Grade not found" 
      });
    }

    // Check if grade has an active appeal
    if (grade.appealStatus !== 'Requested' && grade.appealStatus !== 'Under Review') {
      return res.status(409).json({
        success: false,
        message: `Grade does not have an active appeal (current status: ${grade.appealStatus})`,
        error: "NO_ACTIVE_APPEAL"
      });
    }

    // Prepare update data
    const updateData = {
      appealStatus: decision,
      appealDecision: req.body.decisionReason || '',
      appealDecidedBy: req.user?.id,
      appealDecidedDate: new Date(),
      lastUpdatedBy: req.user?.id
    };

    // If appeal is approved and new grade details are provided, update them
    if (decision === 'Approved' && newGrade) {
      updateData.finalGrade = newGrade;
      if (newGradePoint !== undefined) updateData.gradePoint = parseFloat(newGradePoint);
      if (newPercentage !== undefined) updateData.percentage = parseFloat(newPercentage);
      
      // Update quality points
      const creditHours = grade.creditHours || 0;
      updateData.qualityPoints = (newGradePoint || 0) * creditHours;
      
      // Update result status based on new grade
      if (['F', 'NP', 'NC'].includes(newGrade)) {
        updateData.resultStatus = 'Fail';
      } else if (['I', 'W', 'IP'].includes(newGrade)) {
        updateData.resultStatus = 'Incomplete';
      } else if (['P', 'CR', 'AU'].includes(newGrade)) {
        updateData.resultStatus = 'Pass';
      } else if (newGradePoint >= 2.0) {
        updateData.resultStatus = 'Pass';
      } else {
        updateData.resultStatus = 'Fail';
      }
      
      // Update academic standing based on new grade point
      if (newGradePoint >= 3.5) {
        updateData.academicStanding = 'Excellent';
      } else if (newGradePoint >= 3.0) {
        updateData.academicStanding = 'Good';
      } else if (newGradePoint >= 2.0) {
        updateData.academicStanding = 'Satisfactory';
      } else if (newGradePoint >= 1.0) {
        updateData.academicStanding = 'Probation';
      } else {
        updateData.academicStanding = 'Suspension';
      }
    }

    // Update grade with appeal decision
    const updatedGrade = await Grade.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("student", "name rollNumber")
      .populate("course", "name code")
      .populate("appealDecidedBy", "name")
      .populate("lastUpdatedBy", "name");

    res.status(200).json({
      success: true,
      message: `Grade appeal ${decision.toLowerCase()} successfully`,
      grade: updatedGrade
    });
  } catch (error) {
    console.error("Decide Appeal Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to decide grade appeal", 
      error: error.message 
    });
  }
};

/**
 * POST: Verify Grade
 */
export const verifyGrade = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid grade ID format" 
      });
    }

    const grade = await Grade.findOne({ _id: id, isActive: true });
    if (!grade) {
      return res.status(404).json({ 
        success: false,
        message: "Grade not found" 
      });
    }

    // Check if grade is already verified
    if (grade.isVerified) {
      return res.status(409).json({
        success: false,
        message: "Grade is already verified",
        error: "ALREADY_VERIFIED"
      });
    }

    // Verify the grade using the instance method
    await grade.verify(req.user?.id);

    // Get updated grade with populated fields
    const updatedGrade = await Grade.findById(id)
      .populate("verifiedBy", "name")
      .populate("lastUpdatedBy", "name");

    res.status(200).json({
      success: true,
      message: "Grade verified successfully",
      grade: updatedGrade
    });
  } catch (error) {
    console.error("Verify Grade Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to verify grade", 
      error: error.message 
    });
  }
};

/**
 * POST: Bulk Create Grades
 */
export const bulkCreateGrades = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { grades } = req.body;
    
    if (!grades || !Array.isArray(grades) || grades.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Grades array is required and must not be empty"
      });
    }

    const results = {
      successful: [],
      failed: []
    };

    // Process each grade
    for (let i = 0; i < grades.length; i++) {
      try {
        const gradeData = grades[i];
        
        // Validate required fields
        const requiredFields = [
          "student", "department", "course", "instructor", "program", "section",
          "year", "semester", "term", "academicYear", "creditHours"
        ];
        
        const missingFields = requiredFields.filter(field => {
          const value = gradeData[field];
          return value === undefined || value === null || value === '';
        });
        
        if (missingFields.length > 0) {
          results.failed.push({
            index: i,
            data: gradeData,
            error: `Missing required fields: ${missingFields.join(', ')}`
          });
          continue;
        }

        // Validate ObjectId formats
        const objectIdFields = { 
          student: gradeData.student, 
          department: gradeData.department, 
          course: gradeData.course, 
          instructor: gradeData.instructor 
        };
        
        for (const [field, value] of Object.entries(objectIdFields)) {
          if (!mongoose.Types.ObjectId.isValid(value)) {
            results.failed.push({
              index: i,
              data: gradeData,
              error: `Invalid ${field} ID format`
            });
            continue;
          }
        }

        // Check for existing grade with the same unique combination
        const existingGrade = await Grade.findOne({ 
          student: gradeData.student, 
          course: gradeData.course, 
          term: gradeData.term, 
          academicYear: gradeData.academicYear,
          isActive: true 
        }).session(session);

        if (existingGrade) {
          results.failed.push({
            index: i,
            data: gradeData,
            error: "Grade already exists for this student, course, term, and academic year"
          });
          continue;
        }

        // Validate assessments
        const assessments = gradeData.assessments || [];
        const validatedAssessments = assessments.map(assessment => ({
          ...assessment,
          score: Math.max(0, parseFloat(assessment.score || 0)),
          maxScore: Math.max(1, parseFloat(assessment.maxScore || 100)),
          weight: Math.max(0, Math.min(100, parseFloat(assessment.weight || 0))),
          isAbsent: Boolean(assessment.isAbsent),
          isExcused: Boolean(assessment.isExcused),
          isExtraCredit: Boolean(assessment.isExtraCredit),
          status: assessment.status || "Pending"
        }));

        // Get GPA scale or default to 4.0
        const gpaScale = gradeData.gpaScale || 4.0;

        // Calculate final grade based on assessments
        const { grade, gradePoint, percentage, resultStatus } = calculateFinalGrade(validatedAssessments, gpaScale);

        // Calculate quality points
        const creditHours = parseFloat(gradeData.creditHours);
        const qualityPoints = gradePoint * creditHours;

        // Determine academic standing based on grade point
        let academicStanding = "Good";
        if (gradePoint >= 3.5) {
          academicStanding = "Excellent";
        } else if (gradePoint >= 3.0) {
          academicStanding = "Good";
        } else if (gradePoint >= 2.0) {
          academicStanding = "Satisfactory";
        } else if (gradePoint >= 1.0) {
          academicStanding = "Probation";
        } else {
          academicStanding = "Suspension";
        }

        // Create the new grade
        const newGrade = new Grade({
          student: gradeData.student,
          department: gradeData.department,
          course: gradeData.course,
          instructor: gradeData.instructor,
          program: gradeData.program.trim(),
          specialization: gradeData.specialization?.trim(),
          section: gradeData.section.trim(),
          year: parseInt(gradeData.year),
          semester: parseInt(gradeData.semester),
          term: gradeData.term.trim(),
          academicYear: gradeData.academicYear.trim(),
          creditHours: creditHours,
          gpaScale: parseFloat(gpaScale),
          assessments: validatedAssessments,
          finalGrade: grade,
          gradePoint,
          percentage,
          qualityPoints,
          resultStatus,
          academicStanding,
          isAudit: Boolean(gradeData.isAudit),
          isRepeat: Boolean(gradeData.isRepeat),
          repeatCount: parseInt(gradeData.repeatCount || 0),
          attendanceRate: gradeData.attendanceRate ? parseFloat(gradeData.attendanceRate) : undefined,
          remarks: gradeData.remarks?.trim(),
          tags: gradeData.tags || [],
          metadata: gradeData.metadata || {},
          createdBy: req.user?.id,
          lastUpdatedBy: req.user?.id
        });

        await newGrade.save({ session });
        
        // Populate the created grade for response
        const populatedGrade = await Grade.findById(newGrade._id)
          .populate("student", "name rollNumber email")
          .populate("course", "name code creditHours")
          .populate("department", "name")
          .populate("instructor", "name email")
          .populate("createdBy", "name")
          .populate("lastUpdatedBy", "name")
          .session(session);
        
        results.successful.push({
          index: i,
          grade: populatedGrade
        });
      } catch (error) {
        results.failed.push({
          index: i,
          data: grades[i],
          error: error.message
        });
      }
    }

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: `Bulk grade creation completed. ${results.successful.length} successful, ${results.failed.length} failed`,
      results
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Bulk Create Grades Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to bulk create grades",
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

/**
 * POST: Bulk Update Grades
 */
/**
 * POST: Bulk Update Grades (continued)
 */
export const bulkUpdateGrades = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { gradeIds, updates } = req.body;
    
    if (!gradeIds || !Array.isArray(gradeIds) || gradeIds.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Grade IDs array is required and must not be empty"
      });
    }

    if (!updates || typeof updates !== 'object') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Updates object is required"
      });
    }

    const results = {
      successful: [],
      failed: []
    };

    // Process each grade ID
    for (let i = 0; i < gradeIds.length; i++) {
      try {
        const gradeId = gradeIds[i];
        
        if (!mongoose.Types.ObjectId.isValid(gradeId)) {
          results.failed.push({
            index: i,
            gradeId,
            error: "Invalid grade ID format"
          });
          continue;
        }

        const gradeRecord = await Grade.findOne({ _id: gradeId, isActive: true }).session(session);
        if (!gradeRecord) {
          results.failed.push({
            index: i,
            gradeId,
            error: "Grade not found"
          });
          continue;
        }

        // Check if grade is locked
        if (gradeRecord.isLocked) {
          results.failed.push({
            index: i,
            gradeId,
            error: "Cannot update locked grade"
          });
          continue;
        }

        // If grade is published, restrict updates
        if (gradeRecord.isPublished && !updates.forceUpdate) {
          results.failed.push({
            index: i,
            gradeId,
            error: "Cannot update published grade without forceUpdate flag"
          });
          continue;
        }

        // Prepare update data
        let updateData = { 
          ...updates, 
          updatedBy: req.user?.id,
          lastUpdatedBy: req.user?.id
        };

        // Remove forceUpdate from actual update data
        delete updateData.forceUpdate;

        // Ensure numeric fields are properly typed
        if (updates.year) updateData.year = parseInt(updates.year);
        if (updates.semester) updateData.semester = parseInt(updates.semester);
        if (updates.creditHours) updateData.creditHours = parseFloat(updates.creditHours);
        if (updates.gpaScale) updateData.gpaScale = parseFloat(updates.gpaScale);
        if (updates.attendanceRate) updateData.attendanceRate = parseFloat(updates.attendanceRate);
        if (updates.repeatCount) updateData.repeatCount = parseInt(updates.repeatCount);

        if (updates.assessments) {
          const validatedAssessments = updates.assessments.map(assessment => ({
            ...assessment,
            score: Math.max(0, parseFloat(assessment.score || 0)),
            maxScore: Math.max(1, parseFloat(assessment.maxScore || 100)),
            weight: Math.max(0, Math.min(100, parseFloat(assessment.weight || 0))),
            isAbsent: Boolean(assessment.isAbsent),
            isExcused: Boolean(assessment.isExcused),
            isExtraCredit: Boolean(assessment.isExtraCredit),
            status: assessment.status || "Pending"
          }));

          const gpaScale = updateData.gpaScale || gradeRecord.gpaScale;
          const { grade, gradePoint, percentage, resultStatus } = calculateFinalGrade(validatedAssessments, gpaScale);
          
          // Calculate quality points
          const creditHours = updateData.creditHours || gradeRecord.creditHours;
          const qualityPoints = gradePoint * creditHours;
          
          // Determine academic standing based on grade point
          let academicStanding = "Good";
          if (gradePoint >= 3.5) {
            academicStanding = "Excellent";
          } else if (gradePoint >= 3.0) {
            academicStanding = "Good";
          } else if (gradePoint >= 2.0) {
            academicStanding = "Satisfactory";
          } else if (gradePoint >= 1.0) {
            academicStanding = "Probation";
          } else {
            academicStanding = "Suspension";
          }
          
          updateData.finalGrade = grade;
          updateData.gradePoint = gradePoint;
          updateData.percentage = percentage;
          updateData.qualityPoints = qualityPoints;
          updateData.resultStatus = resultStatus;
          updateData.academicStanding = academicStanding;
          updateData.assessments = validatedAssessments;
        }

        const updatedGrade = await Grade.findByIdAndUpdate(
          gradeId, 
          updateData, 
          { new: true, runValidators: true, session }
        )
          .populate("student", "name rollNumber email")
          .populate("course", "name code creditHours")
          .populate("department", "name")
          .populate("instructor", "name email")
          .populate("updatedBy", "name")
          .populate("lastUpdatedBy", "name")
          .session(session);
        
        results.successful.push({
          index: i,
          grade: updatedGrade
        });
      } catch (error) {
        results.failed.push({
          index: i,
          gradeId: gradeIds[i],
          error: error.message
        });
      }
    }

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `Bulk grade update completed. ${results.successful.length} successful, ${results.failed.length} failed`,
      results
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Bulk Update Grades Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to bulk update grades",
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

/**
 * GET: Grade Audit History
 */
export const getGradeAuditHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid grade ID format" 
      });
    }

    const grade = await Grade.findOne({ _id: id, isActive: true });
    if (!grade) {
      return res.status(404).json({ 
        success: false,
        message: "Grade not found" 
      });
    }

    // Get audit history (this would require an audit log collection in a real implementation)
    // For now, we'll return the current version information
    const auditHistory = {
      currentVersion: grade.version,
      createdAt: grade.createdAt,
      createdBy: await User.findById(grade.createdBy).select('name email'),
      updatedAt: grade.updatedAt,
      updatedBy: await User.findById(grade.updatedBy).select('name email'),
      lastUpdatedBy: await User.findById(grade.lastUpdatedBy).select('name email'),
      // In a real implementation, you would fetch historical versions from an audit collection
      historicalVersions: []
    };

    res.status(200).json({
      success: true,
      gradeId: id,
      auditHistory
    });
  } catch (error) {
    console.error("Get Grade Audit History Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get grade audit history", 
      error: error.message 
    });
  }
};

/**
 * GET: Grades Pending Moderation
 */
export const getGradesPendingModeration = async (req, res) => {
  try {
    const { page = 1, limit = 20, departmentId, academicYear } = req.query;
    const skip = (page - 1) * limit;

    const filter = { 
      isActive: true, 
      moderationStatus: 'Pending'
    };
    
    if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) {
      filter.department = departmentId;
    }
    
    if (academicYear) {
      filter.academicYear = academicYear;
    }

    const [grades, total] = await Promise.all([
      Grade.find(filter)
        .populate("student", "name rollNumber email")
        .populate("course", "name code creditHours")
        .populate("department", "name")
        .populate("instructor", "name email")
         
        .sort({ createdAt: 1 }) // Oldest first
        .skip(skip)
        .limit(Number(limit)),
      Grade.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      grades
    });
  } catch (error) {
    console.error("Get Grades Pending Moderation Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get grades pending moderation", 
      error: error.message 
    });
  }
};

/**
 * GET: Grades with Active Appeals
 */
export const getGradesWithAppeals = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, departmentId, academicYear } = req.query;
    const skip = (page - 1) * limit;

    const filter = { 
      isActive: true,
      appealStatus: { $in: ['Requested', 'Under Review'] }
    };
    
    if (status && ['Requested', 'Under Review'].includes(status)) {
      filter.appealStatus = status;
    }
    
    if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) {
      filter.department = departmentId;
    }
    
    if (academicYear) {
      filter.academicYear = academicYear;
    }

    const [grades, total] = await Promise.all([
      Grade.find(filter)
        .populate("student", "name rollNumber email")
        .populate("course", "name code creditHours")
        .populate("department", "name")
        .populate("instructor", "name email")
        .populate("appealDecidedBy", "name")
        .sort({ appealStatus: 1, createdAt: 1 }) // By status, then oldest first
        .skip(skip)
        .limit(Number(limit)),
      Grade.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      grades
    });
  } catch (error) {
    console.error("Get Grades With Appeals Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to get grades with appeals", 
      error: error.message 
    });
  }
};