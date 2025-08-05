import Teacher from "../models/Teacher.js";

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Public
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ createdAt: -1 });
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new teacher
// @route   POST /api/teachers
// @access  Protected
export const createTeacher = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      department,
      designation,
      gender,
      address,
      experience,
      joiningDate,
      status,
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !department || !designation) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const newTeacher = new Teacher({
      name,
      email,
      phone,
      department,
      designation,
      gender,
      address,
      experience,
      joiningDate,
      status,
    });

    const createdTeacher = await newTeacher.save();
    res.status(201).json(createdTeacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Protected
export const updateTeacher = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      department,
      designation,
      gender,
      address,
      experience,
      joiningDate,
      status,
    } = req.body;

    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Update all fields if provided
    teacher.name = name || teacher.name;
    teacher.email = email || teacher.email;
    teacher.phone = phone || teacher.phone;
    teacher.department = department || teacher.department;
    teacher.designation = designation || teacher.designation;
    teacher.gender = gender || teacher.gender;
    teacher.address = address || teacher.address;
    teacher.experience = experience ?? teacher.experience;
    teacher.joiningDate = joiningDate || teacher.joiningDate;
    teacher.status = status || teacher.status;

    const updatedTeacher = await teacher.save();
    res.status(200).json(updatedTeacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Protected
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    await teacher.deleteOne();
    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
