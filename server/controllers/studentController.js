import Student from "../models/Student.js";
import mongoose from "mongoose";

// Helper function for building search queries
const buildStudentQuery = (filters) => {
  const {
    search,
    status,
    programType,
    department,
    yearOfStudy,
    semester,
    academicStanding,
    minGPA,
    maxGPA,
    hasFinancialAid,
  } = filters;

  const query = {};

  // Text search across multiple fields
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { studentId: { $regex: search, $options: "i" } },
      { rollNumber: { $regex: search, $options: "i" } },
    ];
  }

  // Exact match filters
  if (status) query.status = status;
  if (programType) query.programType = programType;
  if (department && mongoose.Types.ObjectId.isValid(department)) {
    query.department = department;
  }
  if (yearOfStudy) query.yearOfStudy = parseInt(yearOfStudy);
  if (semester) query.semester = parseInt(semester);
  if (academicStanding) query.academicStanding = academicStanding;
  if (hasFinancialAid !== undefined) {
    query["financialInformation.financialAid"] = hasFinancialAid === "true";
  }

  // Range filters
  if (minGPA || maxGPA) {
    query.gpa = {};
    if (minGPA) query.gpa.$gte = parseFloat(minGPA);
    if (maxGPA) query.gpa.$lte = parseFloat(maxGPA);
  }

  return query;
};

// @desc    Get all students with advanced filtering
// @route   GET /api/students
export const getAllStudents = async (req, res) => {
  try {
    const { sort = "-createdAt", page = 1, limit = 20 } = req.query;

    const query = buildStudentQuery(req.query);
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [students, total] = await Promise.all([
      Student.find(query)
        .populate("department", "name code")
        .populate("facultyAdvisor", "name email")
        .populate("currentCourses", "code title credits")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Student.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: students.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
export const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("department", "name code")
      .populate("facultyAdvisor", "name email phone")
      .populate("currentCourses", "code title credits")
      .populate("completedCourses.course", "code title credits");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Create new student with comprehensive validation
// @route   POST /api/students
export const createStudent = async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = [
      "name",
      "email",
      "program",
      "programType",
      "studentId",
      "department",
      "dateOfBirth",
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Check for existing studentId and email
    const [existingId, existingEmail] = await Promise.all([
      Student.findOne({ studentId: req.body.studentId }),
      Student.findOne({ email: req.body.email.toLowerCase() }),
    ]);

    if (existingId) {
      return res.status(400).json({
        success: false,
        message: "Student ID already exists",
      });
    }

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Set default values for nested objects if not provided
    const studentData = {
      ...req.body,
      email: req.body.email.toLowerCase(),
      emergencyContacts: req.body.emergencyContacts || [],
      currentCourses: req.body.currentCourses || [],
      completedCourses: req.body.completedCourses || [],
      disabilities: req.body.disabilities || [],
      financialInformation: {
        tuitionBalance: req.body.financialInformation?.tuitionBalance || 0,
        financialAid: req.body.financialInformation?.financialAid || false,
        scholarships: req.body.financialInformation?.scholarships || [],
      },
      identification: req.body.identification || {
        type: "",
        number: "",
      },
      metadata: {
        createdBy: req.user?._id || null,
        updatedBy: req.user?._id || null,
      },
    };

    const student = await Student.create(studentData);

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student,
    });
  } catch (error) {
    console.error("Error creating student:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Update student with comprehensive validation
// @route   PUT /api/students/:id
export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Check for email change
    if (req.body.email && req.body.email !== student.email) {
      const emailExists = await Student.findOne({
        email: req.body.email.toLowerCase(),
        _id: { $ne: student._id },
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use by another student",
        });
      }
    }

    // Check for studentId change
    if (req.body.studentId && req.body.studentId !== student.studentId) {
      const idExists = await Student.findOne({
        studentId: req.body.studentId,
        _id: { $ne: student._id },
      });
      if (idExists) {
        return res.status(400).json({
          success: false,
          message: "Student ID already in use by another student",
        });
      }
    }

    // Update fields
    const updatableFields = [
      "name",
      "email",
      "phone",
      "program",
      "programType",
      "rollNumber",
      "dateOfBirth",
      "gender",
      "address",
      "emergencyContacts",
      "enrollmentDate",
      "expectedGraduationDate",
      "status",
      "academicStanding",
      "profilePicture",
      "department",
      "facultyAdvisor",
      "yearOfStudy",
      "semester",
      "currentCourses",
      "completedCourses",
      "gpa",
      "totalCreditsEarned",
      "financialInformation",
      "nationality",
      "identification",
      "disabilities",
      "lastLogin",
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    });

    // Update metadata
    student.metadata.updatedBy = req.user?._id || null;
    student.metadata.updatedAt = new Date();

    const updatedStudent = await student.save();

    res.json({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent,
    });
  } catch (error) {
    console.error("Error updating student:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Prevent deletion if student has active courses
    if (student.currentCourses.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete student with active courses",
      });
    }

    await student.deleteOne();

    res.json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get student statistics
// @route   GET /api/students/stats
export const getStudentStats = async (req, res) => {
  try {
    const stats = await Student.aggregate([
      {
        $facet: {
          totalStudents: [{ $count: "count" }],
          byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          byProgramType: [
            { $group: { _id: "$programType", count: { $sum: 1 } } },
          ],
          byDepartment: [
            {
              $lookup: {
                from: "departments",
                localField: "department",
                foreignField: "_id",
                as: "dept",
              },
            },
            { $unwind: "$dept" },
            { $group: { _id: "$dept.name", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
          ],
          gpaStats: [
            {
              $group: {
                _id: null,
                average: { $avg: "$gpa" },
                highest: { $max: "$gpa" },
                lowest: { $min: "$gpa" },
              },
            },
          ],
          financialAidStats: [
            {
              $group: {
                _id: "$financialInformation.financialAid",
                count: { $sum: 1 },
                avgTuitionBalance: {
                  $avg: "$financialInformation.tuitionBalance",
                },
              },
            },
          ],
        },
      },
    ]);

    res.json({
      success: true,
      data: stats[0],
    });
  } catch (error) {
    console.error("Error fetching student statistics:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get students by department
// @route   GET /api/students/department/:departmentId
export const getStudentsByDepartment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.departmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department ID",
      });
    }

    const students = await Student.find({
      department: req.params.departmentId,
    })
      .populate("department", "name code")
      .select(
        "name email studentId program programType yearOfStudy gpa status"
      );

    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error("Error fetching students by department:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
