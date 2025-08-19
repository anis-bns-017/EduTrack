import Teacher from "../models/Teacher.js";
import mongoose from "mongoose";
import Department from "../models/Department.js";

// GET all teachers with advanced filtering, sorting, and pagination
export const getAllTeachers = async (req, res) => {
  try {
    const { 
      search, 
      department, 
      faculty,
      designation, 
      status,
      gender,
      specialization,
      sortBy = '-createdAt', 
      page = 1, 
      limit = 20,
      populate 
    } = req.query;
    
    const query = {};
    
    // Search filter - updated to search firstName and lastName
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Additional filters
    if (department) query.department = department;
    if (faculty) query.faculty = faculty;
    if (designation) query.designation = designation;
    if (status) query.status = status;
    if (gender) query.gender = gender;
    if (specialization) query.specialization = { $in: [specialization] };
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build the query with population
    let teacherQuery = Teacher.find(query);
    
    // Handle population if requested
    if (populate) {
      const populateFields = populate.split(',');
      
      if (populateFields.includes('department')) {
        teacherQuery = teacherQuery.populate('department', 'name code');
      }
      
      if (populateFields.includes('faculty')) {
        teacherQuery = teacherQuery.populate('faculty', 'name code');
      }
      
      if (populateFields.includes('coursesTeaching')) {
        teacherQuery = teacherQuery.populate('coursesTeaching', 'code title');
      }
    }
    
    const [teachers, total] = await Promise.all([
      teacherQuery
        .sort(sortBy)
        .skip(skip)
        .limit(parseInt(limit)),
      Teacher.countDocuments(query)
    ]);
    
    res.status(200).json({
      success: true,
      data: teachers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
};

// GET single teacher with comprehensive populated data
export const getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('department', 'name code')
      .populate('faculty', 'name code')
      .populate('coursesTeaching', 'code title credits')
      .populate('userAccountId', 'username email');
    
    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        message: "Teacher not found" 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: teacher 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
};

// CREATE new teacher with comprehensive validation
export const createTeacher = async (req, res) => {
  try {
    // Comprehensive validation checks
    const validationErrors = [];
    
    // Email uniqueness check
    if (await Teacher.exists({ email: req.body.email.toLowerCase() })) {
      validationErrors.push({ field: 'email', message: 'Email already exists' });
    }
    
    // Employee ID uniqueness check
    if (req.body.employeeId && 
        await Teacher.exists({ employeeId: req.body.employeeId })) {
      validationErrors.push({ field: 'employeeId', message: 'Employee ID already exists' });
    }
    
    // Department existence check
    if (req.body.department && 
        !(await Department.exists({ _id: req.body.department }))) {
      validationErrors.push({ field: 'department', message: 'Invalid department specified' });
    }
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: validationErrors
      });
    }

    // Prepare teacher data with defaults
    const teacherData = {
      ...req.body,
      email: req.body.email.toLowerCase(),
      joiningDate: req.body.joiningDate || new Date(),
      status: req.body.status || 'active',
      isActive: req.body.status !== 'inactive'
    };

    const teacher = await Teacher.create(teacherData);
    
    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: teacher
    });
  } catch (error) {
    console.error("Create Teacher Error:", error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => ({ 
        field: val.path, 
        message: val.message 
      }));
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// UPDATE teacher with comprehensive validation
export const updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        message: "Teacher not found" 
      });
    }
    
    // Validate changes
    const validationErrors = [];
    
    // Email uniqueness check (excluding self)
    if (req.body.email && 
        req.body.email.toLowerCase() !== teacher.email &&
        await Teacher.exists({ email: req.body.email.toLowerCase(), _id: { $ne: teacher._id } })) {
      validationErrors.push({ field: 'email', message: 'Email already in use by another teacher' });
    }
    
    // Employee ID uniqueness check (excluding self)
    if (req.body.employeeId && 
        req.body.employeeId !== teacher.employeeId &&
        await Teacher.exists({ employeeId: req.body.employeeId, _id: { $ne: teacher._id } })) {
      validationErrors.push({ field: 'employeeId', message: 'Employee ID already in use by another teacher' });
    }
    
    // Department existence check
    if (req.body.department && 
        !(await Department.exists({ _id: req.body.department }))) {
      validationErrors.push({ field: 'department', message: 'Invalid department specified' });
    }
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: validationErrors
      });
    }
    
    // Update allowed fields
    const updatableFields = [
      'firstName', 'lastName', 'email', 'phone', 'department', 'faculty', 
      'designation', 'gender', 'address', 'qualifications', 'specialization',
      'experience', 'joiningDate', 'status', 'officeRoom', 'officeHours',
      'profilePhoto', 'bio', 'socialMedia', 'employeeId', 'isActive'
    ];
    
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        teacher[field] = req.body[field];
      }
    });
    
    // Handle status and isActive sync
    if (req.body.status) {
      teacher.isActive = req.body.status === 'active';
    }
    
    const updatedTeacher = await teacher.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Teacher updated successfully',
      data: updatedTeacher 
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => ({ 
        field: val.path, 
        message: val.message 
      }));
      return res.status(400).json({ 
        success: false, 
        message: "Validation error",
        errors: messages 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
};

// DELETE teacher with additional checks
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        message: "Teacher not found" 
      });
    }
    
    // Prevent deletion if teacher has active courses
    const hasActiveCourses = teacher.coursesTeaching && teacher.coursesTeaching.length > 0;
    
    if (hasActiveCourses) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete teacher with assigned courses"
      });
    }
    
    await teacher.deleteOne();
    
    res.status(200).json({ 
      success: true, 
      message: "Teacher deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
};

// Get teachers by department
export const getTeachersByDepartment = async (req, res) => {
  try {
    const teachers = await Teacher.find({ department: req.params.departmentId })
      .populate('department', 'name code')
      .select('firstName lastName email designation status')
      .sort('firstName lastName');
      
    res.status(200).json({ 
      success: true, 
      data: teachers 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
};

// Get teacher statistics
export const getTeacherStats = async (req, res) => {
  try {
    const stats = await Teacher.aggregate([
      {
        $facet: {
          totalTeachers: [{ $count: "count" }],
          byDepartment: [
            { $lookup: {
                from: "departments",
                localField: "department",
                foreignField: "_id",
                as: "dept"
              }
            },
            { $unwind: "$dept" },
            { $group: { _id: "$dept.name", count: { $sum: 1 } } }
          ],
          byDesignation: [
            { $group: { _id: "$designation", count: { $sum: 1 } } }
          ],
          byStatus: [
            { $group: { _id: "$status", count: { $sum: 1 } } }
          ],
          genderDistribution: [
            { $group: { _id: "$gender", count: { $sum: 1 } } }
          ]
        }
      }
    ]);
    
    res.status(200).json({ 
      success: true, 
      data: stats[0] 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
};