import Grade from "../models/Grade.js";
import Student from "../models/Student.js";
import Class from "../models/Class.js";

// GET all grades
export const getAllGrades = async (req, res) => {
  try {
    const grades = await Grade.find()
      .populate("student", "name roll email")
      .populate("class", "className subject");
    res.status(200).json(grades);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch grades", error });
  }
};

// POST create new grade
export const createGrade = async (req, res) => {
  try {
    const { student, classId, score, grade } = req.body;

    const newGrade = await Grade.create({
      student,
      class: classId,
      score,
      grade,
    });

    res.status(201).json(newGrade);
  } catch (error) {
    res.status(500).json({ message: "Failed to create grade", error });
  }
};

// PUT update a grade
export const updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { student, classId, score, grade } = req.body;

    const updatedGrade = await Grade.findByIdAndUpdate(
      id,
      {
        student,
        class: classId,
        score,
        grade,
      },
      { new: true }
    );

    res.status(200).json(updatedGrade);
  } catch (error) {
    res.status(500).json({ message: "Failed to update grade", error });
  }
};

// DELETE a grade
export const deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;
    await Grade.findByIdAndDelete(id);
    res.status(200).json({ message: "Grade deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete grade", error });
  }
};
