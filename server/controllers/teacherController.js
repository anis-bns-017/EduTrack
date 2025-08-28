import Teacher from "../models/Teacher.js";
import mongoose from "mongoose";
import Department from "../models/Department.js";
import Faculty from "../models/Faculty.js"; // Added Faculty import

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
      qualification,
      employmentType,
      specialization,
      sortBy = '-createdAt', 
      page = 1, 
      limit = 20,
      populate 
    } = req.query;

    const query = {};
    
    // Search filter - comprehensive search across multiple fields
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { 'address.street': { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.state': { $regex: search, $options: 'i' } },
        { specialization: { $in: [new RegExp(search, 'i')] } },
        { researchInterests: { $in: [new RegExp(search, 'i')] } },
        { areasOfExpertise: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Additional filters
    if (department) query.department = department;
    if (faculty) query.faculty = faculty;
    if (designation) query.designation = designation;
    if (status) query.status = status;
    if (gender) query.gender = gender;
    if (qualification) query.qualification = qualification;
    if (employmentType) query.employmentType = employmentType;
    if (specialization) query.specialization = { $in: [specialization] };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build the query with population
    let teacherQuery = Teacher.find(query);
    
    // Handle population if requested
    if (populate) {
      const populateFields = populate.split(',');
      
      if (populateFields.includes('department')) {
        teacherQuery = teacherQuery.populate('department', 'name code description');
      }
      
      if (populateFields.includes('faculty')) {
        teacherQuery = teacherQuery.populate('faculty', 'name code description');
      }
      
      if (populateFields.includes('coursesTeaching')) {
        teacherQuery = teacherQuery.populate('coursesTeaching', 'code title credits description');
      }
      
      if (populateFields.includes('reportsTo')) {
        teacherQuery = teacherQuery.populate('reportsTo', 'firstName lastName email designation');
      }
    } else {
      // Default population
      teacherQuery = teacherQuery
        .populate('department', 'name code')
        .populate('faculty', 'name code');
    }
    
    const [teachers, total] = await Promise.all([
      teacherQuery
        .sort(sortBy)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-password -passwordResetToken -passwordResetExpires -loginAttempts -lockUntil'), // Exclude sensitive fields
      Teacher.countDocuments(query)
    ]);

    // Format response data
    const formattedTeachers = teachers.map(teacher => {
      const teacherObj = teacher.toObject();
      
      // Calculate total experience if it's an object
      if (teacherObj.experience && typeof teacherObj.experience === 'object') {
        const { teaching = 0, industry = 0, research = 0 } = teacherObj.experience;
        teacherObj.totalExperience = teaching + industry + research;
      } else {
        teacherObj.totalExperience = teacherObj.experience || 0;
      }
      
      // Ensure all object fields are properly formatted
      if (!teacherObj.address) teacherObj.address = {};
      if (!teacherObj.emergencyContact) teacherObj.emergencyContact = {};
      if (!teacherObj.socialMedia) teacherObj.socialMedia = {};
      if (!teacherObj.leaveBalance) teacherObj.leaveBalance = {};
      
      return teacherObj;
    });
    
    res.status(200).json({
      success: true,
      data: formattedTeachers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get All Teachers Error:", error);
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
      .populate('department', 'name code description')
      .populate('faculty', 'name code description')
      .populate('coursesTeaching', 'code title credits description')
      .populate('reportsTo', 'firstName lastName email designation profilePhoto')
      .select('-password -passwordResetToken -passwordResetExpires -loginAttempts -lockUntil');
    
    if (!teacher) {
      return res.status(404).json({ 
        success: false, 
        message: "Teacher not found" 
      });
    }
    
    // Format experience and ensure all fields are present
    const teacherObj = teacher.toObject();
    
    if (teacherObj.experience && typeof teacherObj.experience === 'object') {
      const { teaching = 0, industry = 0, research = 0 } = teacherObj.experience;
      teacherObj.totalExperience = teaching + industry + research;
    }
    
    // Ensure nested objects exist
    if (!teacherObj.address) teacherObj.address = {};
    if (!teacherObj.emergencyContact) teacherObj.emergencyContact = {};
    if (!teacherObj.socialMedia) teacherObj.socialMedia = {};
    if (!teacherObj.leaveBalance) teacherObj.leaveBalance = {};
    if (!teacherObj.publications) teacherObj.publications = [];
    if (!teacherObj.previousInstitutions) teacherObj.previousInstitutions = [];
    if (!teacherObj.awards) teacherObj.awards = [];
    if (!teacherObj.officeHours) teacherObj.officeHours = [];
    
    res.status(200).json({ 
      success: true, 
      data: teacherObj 
    });
  } catch (error) {
    console.error("Get Teacher By ID Error:", error);
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
        await Teacher.exists({ employeeId: req.body.employeeId.toUpperCase() })) {
      validationErrors.push({ field: 'employeeId', message: 'Employee ID already exists' });
    }
    
    // Department existence check
    if (req.body.department && 
        !(await Department.exists({ _id: req.body.department }))) {
      validationErrors.push({ field: 'department', message: 'Invalid department specified' });
    }
    
    // Faculty existence check
    if (req.body.faculty && 
        !(await Faculty.exists({ _id: req.body.faculty }))) {
      validationErrors.push({ field: 'faculty', message: 'Invalid faculty specified' });
    }
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: validationErrors
      });
    }

    // Prepare teacher data with defaults and proper formatting
    const teacherData = {
      ...req.body,
      email: req.body.email.toLowerCase(),
      employeeId: req.body.employeeId?.toUpperCase(),
      joiningDate: req.body.joiningDate || new Date(),
      status: req.body.status || 'Active',
      isActive: req.body.status !== 'Inactive' && req.body.status !== 'Retired' && req.body.status !== 'Resigned' && req.body.status !== 'Terminated',
      
      // Ensure nested objects have proper structure
      address: req.body.address || {},
      emergencyContact: req.body.emergencyContact || {},
      socialMedia: req.body.socialMedia || {},
      leaveBalance: req.body.leaveBalance || { annual: 20, sick: 12, personal: 5 },
      experience: req.body.experience || { teaching: 0, industry: 0, research: 0 },
      publications: req.body.publications || [],
      previousInstitutions: req.body.previousInstitutions || [],
      awards: req.body.awards || [],
      officeHours: req.body.officeHours || []
    };

    // Handle experience field conversion if it's a number
    if (typeof teacherData.experience === 'number') {
      teacherData.experience = {
        teaching: teacherData.experience,
        industry: 0,
        research: 0
      };
    }

    const teacher = await Teacher.create(teacherData);
    
    // Populate the created teacher for response
    const populatedTeacher = await Teacher.findById(teacher._id)
      .populate('department', 'name code')
      .populate('faculty', 'name code')
      .populate('reportsTo', 'firstName lastName designation')
      .select('-password -passwordResetToken -passwordResetExpires -loginAttempts -lockUntil');
    
    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: populatedTeacher
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
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
        field: field
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
        req.body.employeeId.toUpperCase() !== teacher.employeeId &&
        await Teacher.exists({ employeeId: req.body.employeeId.toUpperCase(), _id: { $ne: teacher._id } })) {
      validationErrors.push({ field: 'employeeId', message: 'Employee ID already in use by another teacher' });
    }
    
    // Department existence check
    if (req.body.department && 
        !(await Department.exists({ _id: req.body.department }))) {
      validationErrors.push({ field: 'department', message: 'Invalid department specified' });
    }
    
    // Faculty existence check
    if (req.body.faculty && 
        !(await Faculty.exists({ _id: req.body.faculty }))) {
      validationErrors.push({ field: 'faculty', message: 'Invalid faculty specified' });
    }
    
    // ReportsTo existence check (if provided)
    if (req.body.reportsTo && 
        !(await Teacher.exists({ _id: req.body.reportsTo }))) {
      validationErrors.push({ field: 'reportsTo', message: 'Invalid supervisor specified' });
    }
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: validationErrors
      });
    }
    
    // Update allowed fields - comprehensive list from model
    const updatableFields = [
      'firstName', 'lastName', 'middleName', 'title', 'email', 'phone', 
      'department', 'faculty', 'designation', 'gender', 'address', 
      'qualification', 'specialization', 'experience', 'joiningDate', 
      'status', 'officeLocation', 'officeHours', 'officeExtension',
      'profilePhoto', 'bio', 'socialMedia', 'employeeId', 'isActive',
      'employmentType', 'contractEndDate', 'dateOfBirth', 'nationality',
      'bloodGroup', 'emergencyContact', 'researchInterests', 'areasOfExpertise',
      'publications', 'teachingLoad', 'previousInstitutions', 'awards',
      'salaryGrade', 'bankAccount', 'leaveBalance', 'reportsTo'
    ];
    
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        teacher[field] = req.body[field];
      }
    });
    
    // Handle status and isActive sync
    if (req.body.status) {
      teacher.isActive = req.body.status === 'Active';
    }
    
    // Handle experience field conversion
    if (typeof req.body.experience === 'number') {
      teacher.experience = {
        teaching: req.body.experience,
        industry: teacher.experience?.industry || 0,
        research: teacher.experience?.research || 0
      };
    }
    
    // Uppercase employeeId if provided
    if (req.body.employeeId) {
      teacher.employeeId = req.body.employeeId.toUpperCase();
    }
    
    // Lowercase email if provided
    if (req.body.email) {
      teacher.email = req.body.email.toLowerCase();
    }
    
    const updatedTeacher = await teacher.save();
    
    // Populate the updated teacher for response
    const populatedTeacher = await Teacher.findById(updatedTeacher._id)
      .populate('department', 'name code')
      .populate('faculty', 'name code')
      .populate('coursesTeaching', 'code title')
      .populate('reportsTo', 'firstName lastName designation')
      .select('-password -passwordResetToken -passwordResetExpires -loginAttempts -lockUntil');
    
    res.status(200).json({ 
      success: true, 
      message: 'Teacher updated successfully',
      data: populatedTeacher 
    });
  } catch (error) {
    console.error("Update Teacher Error:", error);
    
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
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
        field: field
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
    console.error("Delete Teacher Error:", error);
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
      .populate('faculty', 'name code')
      .populate('reportsTo', 'firstName lastName')
      .select('firstName lastName email designation status employeeId phone officeLocation')
      .sort('firstName lastName');
      
    res.status(200).json({ 
      success: true, 
      data: teachers 
    });
  } catch (error) {
    console.error("Get Teachers By Department Error:", error);
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
            { $group: { _id: "$dept.name", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          byFaculty: [
            { $lookup: {
                from: "faculties",
                localField: "faculty",
                foreignField: "_id",
                as: "fac"
              }
            },
            { $unwind: "$fac" },
            { $group: { _id: "$fac.name", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          byDesignation: [
            { $group: { _id: "$designation", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          byStatus: [
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          byGender: [
            { $group: { _id: "$gender", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          byEmploymentType: [
            { $group: { _id: "$employmentType", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          byQualification: [
            { $group: { _id: "$qualification", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          averageExperience: [
            {
              $project: {
                totalExp: {
                  $add: [
                    { $ifNull: ["$experience.teaching", 0] },
                    { $ifNull: ["$experience.industry", 0] },
                    { $ifNull: ["$experience.research", 0] }
                  ]
                }
              }
            },
            { $group: { _id: null, average: { $avg: "$totalExp" } } }
          ],
          experienceDistribution: [
            {
              $project: {
                totalExp: {
                  $add: [
                    { $ifNull: ["$experience.teaching", 0] },
                    { $ifNull: ["$experience.industry", 0] },
                    { $ifNull: ["$experience.research", 0] }
                  ]
                }
              }
            },
            {
              $bucket: {
                groupBy: "$totalExp",
                boundaries: [0, 5, 10, 15, 20, 25, 30],
                default: "30+",
                output: {
                  count: { $sum: 1 }
                }
              }
            }
          ]
        }
      }
    ]);
    
    res.status(200).json({ 
      success: true, 
      data: stats[0] 
    });
  } catch (error) {
    console.error("Get Teacher Stats Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
};

// Search teachers with advanced filters
export const searchTeachers = async (req, res) => {
  try {
    const { query, field = 'all' } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }
    
    const searchConditions = {};
    
    switch (field) {
      case 'name':
        searchConditions.$or = [
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } }
        ];
        break;
      case 'email':
        searchConditions.email = { $regex: query, $options: 'i' };
        break;
      case 'employeeId':
        searchConditions.employeeId = { $regex: query, $options: 'i' };
        break;
      case 'specialization':
        searchConditions.specialization = { $in: [new RegExp(query, 'i')] };
        break;
      case 'research':
        searchConditions.researchInterests = { $in: [new RegExp(query, 'i')] };
        break;
      case 'expertise':
        searchConditions.areasOfExpertise = { $in: [new RegExp(query, 'i')] };
        break;
      default:
        searchConditions.$or = [
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { employeeId: { $regex: query, $options: 'i' } },
          { specialization: { $in: [new RegExp(query, 'i')] } },
          { researchInterests: { $in: [new RegExp(query, 'i')] } },
          { areasOfExpertise: { $in: [new RegExp(query, 'i')] } }
        ];
    }
    
    const teachers = await Teacher.find(searchConditions)
      .populate('department', 'name')
      .populate('faculty', 'name')
      .populate('reportsTo', 'firstName lastName')
      .select('firstName lastName email designation department faculty employeeId phone officeLocation')
      .limit(25);
    
    res.status(200).json({
      success: true,
      data: teachers
    });
  } catch (error) {
    console.error("Search Teachers Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Get teachers by status
export const getTeachersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['Active', 'Inactive', 'On Leave', 'Retired', 'Resigned', 'Terminated', 'Sabbatical'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status provided'
      });
    }
    
    const teachers = await Teacher.find({ status })
      .populate('department', 'name')
      .populate('faculty', 'name')
      .select('firstName lastName email designation employeeId phone department faculty')
      .sort('firstName lastName');
    
    res.status(200).json({
      success: true,
      data: teachers,
      count: teachers.length
    });
  } catch (error) {
    console.error("Get Teachers By Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};