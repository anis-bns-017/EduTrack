import Course from "../models/Course.js";
import Department from "../models/Department.js";

// Create one or multiple courses (supports department name lookup)
export const createCourse = async (req, res) => {
  try {
    let data = req.body;

    // Ensure it's always an array
    if (!Array.isArray(data)) {
      data = [data];
    }

    // Map through each course and replace departmentName with department _id
    const coursesData = [];
    for (const course of data) {
      if (!course.department && course.departmentName) {
        const dept = await Department.findOne({ name: course.departmentName });
        if (!dept) {
          return res.status(404).json({
            success: false,
            message: `Department '${course.departmentName}' not found`,
          });
        }
        course.department = dept._id;
        delete course.departmentName;
      }
      coursesData.push(course);
    }

    // Insert many courses
    const courses = await Course.insertMany(coursesData, { ordered: false });

    res.status(201).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error("Error creating courses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create courses",
      error: error.message,
    });
  }
};

// Get all courses (with department populated)
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("department", "name")
      .sort({ code: 1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
      error: error.message,
    });
  }
};
