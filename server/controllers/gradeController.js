import mongoose from "mongoose";
import Grade from "../models/Grade.js";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Course from "../models/Course.js";
import Department from "../models/Department.js";
import User from "../models/User.js";

/**
 * Utility: Calculate final grade and grade point (aligned with Grade model)
 */
const calculateFinalGrade = (assessments) => {
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

  // 🇧🇩 Bangladesh University Grading Scale
  let grade = "F", gradePoint = 0.00;

  if (percentage >= 80) { grade = "A+"; gradePoint = 4.00; }
  else if (percentage >= 75) { grade = "A"; gradePoint = 3.75; }
  else if (percentage >= 70) { grade = "A-"; gradePoint = 3.50; }
  else if (percentage >= 65) { grade = "B+"; gradePoint = 3.25; }
  else if (percentage >= 60) { grade = "B"; gradePoint = 3.00; }
  else if (percentage >= 55) { grade = "B-"; gradePoint = 2.75; }
  else if (percentage >= 50) { grade = "C+"; gradePoint = 2.50; }
  else if (percentage >= 45) { grade = "C"; gradePoint = 2.25; }
  else if (percentage >= 40) { grade = "D"; gradePoint = 2.00; }
  else { grade = "F"; gradePoint = 0.00; }

  // Determine result status
  let resultStatus = "Fail";
  if (grade === "F" || grade === "NP") {
    resultStatus = "Fail";
  } else if (grade === "I" || grade === "W") {
    resultStatus = "Incomplete";
  } else if (grade === "P" || gradePoint >= 2.00) {
    resultStatus = "Pass";
  }

  return { grade, gradePoint, percentage, resultStatus };
};


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
      section,
      year,
      semester,
      appealStatus,
      moderationStatus,
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
    if (section) filter.section = section;
    if (year) filter.year = parseInt(year);
    if (semester) filter.semester = parseInt(semester);
    if (appealStatus) filter.appealStatus = appealStatus;
    if (moderationStatus) filter.moderationStatus = moderationStatus;

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
        { 'resultStatus': { $regex: search, $options: 'i' } }
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
      .populate("moderatedBy", "name")
      .populate("appealDecidedBy", "name");

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
  let session;
  
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const { 
      student, 
      department, 
      course, 
      instructor, 
      program,
      section,
      year, 
      semester, 
      term, 
      academicYear, 
      creditHours,
      assessments = [],
      remarks,
      isAudit = false,
      isRepeat = false
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
      await session.abortTransaction();
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
        await session.abortTransaction();
        return res.status(400).json({ 
          success: false,
          message: `Invalid ${field} ID format` 
        });
      }
    }

    // Validate references exist
    const [studentExists, departmentExists, courseExists, instructorExists] = await Promise.all([
      Student.findById(student).session(session),
      Department.findById(department).session(session),
      Course.findById(course).session(session),
      Teacher.findById(instructor).session(session)
    ]);

    if (!studentExists) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false,
        message: "Student not found" 
      });
    }
    if (!departmentExists) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false,
        message: "Department not found" 
      });
    }
    if (!courseExists) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false,
        message: "Course not found" 
      });
    }
    if (!instructorExists) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false,
        message: "Instructor not found" 
      });
    }

    // Check for existing grade with the same unique combination
    const existingGrade = await Grade.findOne({ 
      student, 
      course, 
      term, 
      academicYear,
      isActive: true 
    }).session(session);

    if (existingGrade) {
      await session.abortTransaction();
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

    // Validate assessments
    const validatedAssessments = assessments.map(assessment => ({
      ...assessment,
      score: Math.max(0, parseFloat(assessment.score || 0)),
      maxScore: Math.max(1, parseFloat(assessment.maxScore || 100)),
      weight: Math.max(0, Math.min(100, parseFloat(assessment.weight || 0))),
      isAbsent: Boolean(assessment.isAbsent),
      isExcused: Boolean(assessment.isExcused),
      status: assessment.status || "Pending"
    }));

    // Calculate final grade based on assessments
    const { grade, gradePoint, percentage, resultStatus } = calculateFinalGrade(validatedAssessments);

    // Create the new grade
    const newGrade = new Grade({
      student,
      department,
      course,
      instructor,
      program: program.trim(),
      section: section.trim(),
      year: parseInt(year),
      semester: parseInt(semester),
      term: term.trim(),
      academicYear: academicYear.trim(),
      creditHours: parseFloat(creditHours),
      assessments: validatedAssessments,
      finalGrade: grade,
      gradePoint,
      percentage,
      resultStatus,
      isAudit: Boolean(isAudit),
      isRepeat: Boolean(isRepeat),
      remarks: remarks?.trim(),
      createdBy: req.user?.id,
      lastUpdatedBy: req.user?.id
    });

    await newGrade.save({ session });
    await session.commitTransaction();

    // Populate the created grade for response WITHOUT session
    const populatedGrade = await Grade.findById(newGrade._id)
      .populate("student", "name rollNumber email")
      .populate("course", "name code creditHours")
      .populate("department", "name")
      .populate("instructor", "name email")
      .populate("createdBy", "name")
      .populate("lastUpdatedBy", "name");

    console.log("New Grade Created:", newGrade._id);

    res.status(201).json({ 
      success: true,
      message: "Grade created successfully", 
      grade: populatedGrade 
    });
  } catch (error) {
    // Only abort transaction if session exists and transaction is in progress
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }
    
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
  } finally {
    // Always end the session if it exists
    if (session) {
      await session.endSession();
    }
  }
};

/**
 * PUT: Update Existing Grade
 */
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

    if (assessments) {
      const validatedAssessments = assessments.map(assessment => ({
        ...assessment,
        score: Math.max(0, parseFloat(assessment.score || 0)),
        maxScore: Math.max(1, parseFloat(assessment.maxScore || 100)),
        weight: Math.max(0, Math.min(100, parseFloat(assessment.weight || 0))),
        isAbsent: Boolean(assessment.isAbsent),
        isExcused: Boolean(assessment.isExcused),
        status: assessment.status || "Pending"
      }));

      const { grade, gradePoint, percentage, resultStatus } = calculateFinalGrade(validatedAssessments);
      
      updates.finalGrade = grade;
      updates.gradePoint = gradePoint;
      updates.percentage = percentage;
      updates.resultStatus = resultStatus;
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

    const grades = await Grade.find({ 
      student: studentId, 
      isActive: true,
      isPublished: true
    })
      .populate("course", "name code creditHours")
      .populate("department", "name")
      .populate("instructor", "name")
      .sort({ academicYear: -1, term: 1, createdAt: 1 });

    if (!grades.length) {
      return res.status(404).json({ 
        success: false,
        message: "No published grades found for this student" 
      });
    }

    // Calculate GPA using the static method from Grade model
    const GPA = await Grade.calculateGPA(studentId);

    const totalCredits = grades.reduce((sum, grade) => {
      return sum + (grade.creditHours || 0);
    }, 0);

    // Calculate CGPA (Cumulative GPA for all semesters)
    const totalGradePoints = grades.reduce((sum, grade) => {
      return sum + ((grade.gradePoint || 0) * (grade.creditHours || 0));
    }, 0);

    const CGPA = totalCredits > 0 ? parseFloat((totalGradePoints / totalCredits).toFixed(2)) : 0;

    // Group grades by academic year and term for better transcript organization
    const transcriptByTerm = {};
    grades.forEach(grade => {
      const key = `${grade.academicYear} - ${grade.term}`;
      if (!transcriptByTerm[key]) {
        transcriptByTerm[key] = {
          academicYear: grade.academicYear,
          term: grade.term,
          courses: [],
          termCredits: 0,
          termGradePoints: 0,
          termGPA: 0
        };
      }
      
      transcriptByTerm[key].courses.push({
        course: grade.course,
        department: grade.department,
        instructor: grade.instructor,
        creditHours: grade.creditHours,
        finalGrade: grade.finalGrade,
        gradePoint: grade.gradePoint,
        percentage: grade.percentage,
        resultStatus: grade.resultStatus
      });
      
      transcriptByTerm[key].termCredits += grade.creditHours || 0;
      transcriptByTerm[key].termGradePoints += (grade.gradePoint || 0) * (grade.creditHours || 0);
    });
    
    // Calculate term GPA for each term
    Object.keys(transcriptByTerm).forEach(key => {
      const term = transcriptByTerm[key];
      term.termGPA = term.termCredits > 0 ? 
        parseFloat((term.termGradePoints / term.termCredits).toFixed(2)) : 0;
    });

    res.status(200).json({
      success: true,
      studentId,
      student: {
        name: studentExists.name,
        rollNumber: studentExists.rollNumber,
        email: studentExists.email
      },
      totalCredits,
      GPA,
      CGPA,
      totalCourses: grades.length,
      transcriptByTerm
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
    const { academicYear, term } = req.query;

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

    const GPA = await Grade.calculateGPA(studentId, academicYear || null, term || null);

    res.status(200).json({
      success: true,
      studentId,
      student: {
        name: studentExists.name,
        rollNumber: studentExists.rollNumber
      },
      academicYear: academicYear || 'All',
      term: term || 'All',
      GPA
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

    const statistics = await Grade.getClassStatistics(courseId, term, academicYear);

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

    const statistics = await Grade.getDepartmentStatistics(departmentId, academicYear);

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

    // Lock the grade
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

    // Unlock the grade
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

    // Submit for moderation
    await grade.submitForModeration(req.user?.id, notes);

    // Get updated grade with populated fields
    const updatedGrade = await Grade.findById(id)
      .populate("moderatedBy", "name")
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

    // Approve moderation
    await grade.approveModeration(req.user?.id, notes);

    // Get updated grade with populated fields
    const updatedGrade = await Grade.findById(id)
      .populate("moderatedBy", "name")
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

    // Reject moderation
    await grade.rejectModeration(req.user?.id, notes);

    // Get updated grade with populated fields
    const updatedGrade = await Grade.findById(id)
      .populate("moderatedBy", "name")
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

    // Check if grade can be appealed
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
      
      // Update result status based on new grade
      if (['F', 'NP'].includes(newGrade)) {
        updateData.resultStatus = 'Fail';
      } else if (['I', 'W'].includes(newGrade)) {
        updateData.resultStatus = 'Incomplete';
      } else if (newGrade === 'P') {
        updateData.resultStatus = 'Pass';
      } else if (newGradePoint >= 2.0) {
        updateData.resultStatus = 'Pass';
      } else {
        updateData.resultStatus = 'Fail';
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
          status: assessment.status || "Pending"
        }));

        // Calculate final grade based on assessments
        const { grade, gradePoint, percentage, resultStatus } = calculateFinalGrade(validatedAssessments);

        // Create the new grade
        const newGrade = new Grade({
          student: gradeData.student,
          department: gradeData.department,
          course: gradeData.course,
          instructor: gradeData.instructor,
          program: gradeData.program.trim(),
          section: gradeData.section.trim(),
          year: parseInt(gradeData.year),
          semester: parseInt(gradeData.semester),
          term: gradeData.term.trim(),
          academicYear: gradeData.academicYear.trim(),
          creditHours: parseFloat(gradeData.creditHours),
          assessments: validatedAssessments,
          finalGrade: grade,
          gradePoint,
          percentage,
          resultStatus,
          isAudit: Boolean(gradeData.isAudit),
          isRepeat: Boolean(gradeData.isRepeat),
          remarks: gradeData.remarks?.trim(),
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

        if (updates.assessments) {
          const validatedAssessments = updates.assessments.map(assessment => ({
            ...assessment,
            score: Math.max(0, parseFloat(assessment.score || 0)),
            maxScore: Math.max(1, parseFloat(assessment.maxScore || 100)),
            weight: Math.max(0, Math.min(100, parseFloat(assessment.weight || 0))),
            isAbsent: Boolean(assessment.isAbsent),
            isExcused: Boolean(assessment.isExcused),
            status: assessment.status || "Pending"
          }));

          const { grade, gradePoint, percentage, resultStatus } = calculateFinalGrade(validatedAssessments);
          
          updateData.finalGrade = grade;
          updateData.gradePoint = gradePoint;
          updateData.percentage = percentage;
          updateData.resultStatus = resultStatus;
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
        .populate("moderatedBy", "name")
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