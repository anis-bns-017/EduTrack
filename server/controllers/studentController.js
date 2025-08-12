import Student from "../models/Student.js";

// GET all students
export const getAllStudents = async (req, res) => {
  try {
    // No need to populate 'class' because it's now a string field, not a reference
    const students = await Student.find();
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE student
export const createStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      program,
      rollNumber,
      dateOfBirth,
      gender,
      address,
      guardianName,
      guardianPhone,
      enrollmentDate,
      status,
      profilePicture,
      department,
      facultyAdvisor,
      yearOfStudy,
      cgpa,
    } = req.body;

    if (!name || !email || !program) {
      return res
        .status(400)
        .json({ message: "Name, email, and program are required" });
    }

    const emailExists = await Student.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (rollNumber) {
      const rollExists = await Student.findOne({ rollNumber });
      if (rollExists) {
        return res.status(400).json({ message: "Roll number already exists" });
      }
    }

    const newStudent = await Student.create({
      name,
      email,
      phone,
      program,
      rollNumber,
      dateOfBirth,
      gender,
      address,
      guardianName,
      guardianPhone,
      enrollmentDate,
      status,
      profilePicture,
      department,
      facultyAdvisor,
      yearOfStudy,
      cgpa,
    });

    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE student
export const updateStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      program,
      rollNumber,
      dateOfBirth,
      gender,
      address,
      guardianName,
      guardianPhone,
      enrollmentDate,
      status,
      profilePicture,
      department,
      facultyAdvisor,
      yearOfStudy,
      cgpa,
    } = req.body;

    if (!name || !email || !program) {
      return res
        .status(400)
        .json({ message: "Name, email, and program are required" });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (email !== student.email) {
      const emailExists = await Student.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    if (rollNumber && rollNumber !== student.rollNumber) {
      const rollExists = await Student.findOne({ rollNumber });
      if (rollExists) {
        return res.status(400).json({ message: "Roll number already exists" });
      }
    }

    // update fields
    student.name = name;
    student.email = email;
    student.phone = phone;
    student.program = program;
    student.rollNumber = rollNumber;
    student.dateOfBirth = dateOfBirth;
    student.gender = gender;
    student.address = address;
    student.guardianName = guardianName;
    student.guardianPhone = guardianPhone;
    student.enrollmentDate = enrollmentDate;
    student.status = status;
    student.profilePicture = profilePicture;
    student.department = department;
    student.facultyAdvisor = facultyAdvisor;
    student.yearOfStudy = yearOfStudy;
    student.cgpa = cgpa;

    await student.save();
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE student
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await student.deleteOne();
    res.json({ message: "Student deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
