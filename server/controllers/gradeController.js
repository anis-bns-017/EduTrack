import mongoose from "mongoose";
import Grade from "../models/Grade.js";
import Student from "../models/Student.js";
 
import Course from "../models/Course.js";
import Department from "../models/Department.js";

/**
 * Utility: Calculate final grade and grade point
 */
const calculateFinalGrade = (assessments) => {
  if (!assessments || !assessments.length) return { grade: null, gradePoint: null, percentage: null };

  let totalWeightedScore = 0;
  let totalWeight = 0;

  assessments.forEach(a => {
    totalWeightedScore += (a.score / a.maxScore) * a.weight;
    totalWeight += a.weight;
  });

  const percentage = (totalWeightedScore / totalWeight) * 100;

  let grade, gradePoint;
  if (percentage >= 90) { grade = "A+"; gradePoint = 4.0; }
  else if (percentage >= 85) { grade = "A"; gradePoint = 4.0; }
  else if (percentage >= 80) { grade = "B+"; gradePoint = 3.5; }
  else if (percentage >= 75) { grade = "B"; gradePoint = 3.0; }
  else if (percentage >= 70) { grade = "C"; gradePoint = 2.5; }
  else if (percentage >= 60) { grade = "D"; gradePoint = 2.0; }
  else { grade = "F"; gradePoint = 0.0; }

  return { grade, gradePoint, percentage };
};

/**
 * GET: Department / Course / Student Grade Report
 */
export const getGradesReport = async (req, res) => {
  try {
    const { departmentId, courseId, studentId, term, academicYear } = req.query;

    const filter = {};
    if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) filter.department = departmentId;
    if (courseId && mongoose.Types.ObjectId.isValid(courseId)) filter.course = courseId;
    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) filter.student = studentId;
    if (term) filter.term = term;
    if (academicYear) filter.academicYear = academicYear;

    const grades = await Grade.find(filter)
      .populate("student", "name rollNumber email")
      .populate("course", "courseName code creditHours")
      .populate("department", "name faculty")
      .sort({ term: 1, finalGrade: 1 });

    if (!grades.length) {
      return res.status(404).json({ message: "No grades found matching criteria" });
    }

    res.json({ total: grades.length, grades });
  } catch (error) {
    console.error("Grades Report Error:", error);
    res.status(500).json({ message: "Failed to generate grades report", error: error.message });
  }
};

/**
 * GET: All Grades (Paginated)
 */
export const getAllGrades = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [grades, total] = await Promise.all([
      Grade.find()
        .populate("student", "name rollNumber email")
        .populate("course", "courseName code creditHours")
        .populate("department", "name faculty")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Grade.countDocuments()
    ]);

    res.status(200).json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      grades
    });
  } catch (error) {
    console.error("Get All Grades Error:", error);
    res.status(500).json({ message: "Failed to fetch grades", error: error.message });
  }
};

/**
 * POST: Create New Grade Record
 */
export const createGrade = async (req, res) => {
  try {
    const { student, department, course, term, academicYear, assessments, remarks, creditHours } = req.body;

    if (!student || !department || !course || !term || !academicYear || !creditHours) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const studentExists = await Student.findById(student);
    if (!studentExists) return res.status(404).json({ message: "Student not found" });

    const departmentExists = await Department.findById(department);
    if (!departmentExists) return res.status(404).json({ message: "Department not found" });

    const courseExists = await Course.findById(course);
    if (!courseExists) return res.status(404).json({ message: "Course not found" });

    const existingGrade = await Grade.findOne({ student, course, term, academicYear });
    if (existingGrade) {
      return res.status(409).json({ message: "Grade already exists for this course and term", existingGrade });
    }

    const { grade, gradePoint, percentage } = calculateFinalGrade(assessments);

    const newGrade = await Grade.create({
      student,
      department,
      course,
      term,
      academicYear,
      assessments,
      finalGrade: grade,
      gradePoint,
      percentage,
      creditHours,
      remarks
    });

    res.status(201).json({ message: "Grade created successfully", grade: newGrade });
  } catch (error) {
    console.error("Create Grade Error:", error);
    res.status(500).json({ message: "Failed to create grade", error: error.message });
  }
};

/**
 * PUT: Update Existing Grade
 */
export const updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const gradeRecord = await Grade.findById(id);
    if (!gradeRecord) return res.status(404).json({ message: "Grade not found" });

    const { assessments } = req.body;
    let updates = { ...req.body };

    if (assessments) {
      const { grade, gradePoint, percentage } = calculateFinalGrade(assessments);
      updates.finalGrade = grade;
      updates.gradePoint = gradePoint;
      updates.percentage = percentage;
    }

    const updatedGrade = await Grade.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      .populate("student", "name rollNumber")
      .populate("course", "courseName");

    res.status(200).json({ message: "Grade updated successfully", grade: updatedGrade });
  } catch (error) {
    console.error("Update Grade Error:", error);
    res.status(500).json({ message: "Failed to update grade", error: error.message });
  }
};

/**
 * DELETE: Remove Grade
 */
export const deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid grade ID" });

    const deletedGrade = await Grade.findByIdAndDelete(id);
    if (!deletedGrade) return res.status(404).json({ message: "Grade not found" });

    res.status(200).json({ message: "Grade deleted successfully", deletedGrade });
  } catch (error) {
    console.error("Delete Grade Error:", error);
    res.status(500).json({ message: "Failed to delete grade", error: error.message });
  }
};

/**
 * GET: Transcript for a Student
 */
export const getStudentTranscript = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const grades = await Grade.find({ student: studentId })
      .populate("course", "courseName creditHours")
      .sort({ academicYear: 1, term: 1 });

    if (!grades.length) return res.status(404).json({ message: "No grades found for this student" });

    const totalCredits = grades.reduce((sum, g) => sum + g.creditHours, 0);
    const totalGradePoints = grades.reduce((sum, g) => sum + (g.gradePoint * g.creditHours), 0);
    const GPA = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : null;

    res.status(200).json({
      studentId,
      totalCredits,
      GPA,
      grades
    });
  } catch (error) {
    console.error("Transcript Error:", error);
    res.status(500).json({ message: "Failed to get transcript", error: error.message });
  }
};
