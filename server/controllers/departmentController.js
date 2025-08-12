import Department from "../models/Department.js";

 
// Create one or multiple departments
export const createDepartment = async (req, res) => {
  try {
    let data = req.body;

    // If a single object is sent, wrap it in an array for consistency
    if (!Array.isArray(data)) {
      data = [data];
    }

    // Insert all at once
    const departments = await Department.insertMany(data, { ordered: false });

    res.status(201).json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error) {
    console.error("Error creating departments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create departments",
      error: error.message,
    });
  }
};

// Get all departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 }); // Sorted alphabetically
    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
      error: error.message,
    });
  }
};
