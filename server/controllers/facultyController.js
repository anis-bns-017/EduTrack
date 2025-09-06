import mongoose from "mongoose";
import Faculty from "../models/Faculty.js";
import Department from "../models/Department.js";

const { isValidObjectId } = mongoose;

/* ----------------------------- helpers ----------------------------- */
const toArray = (val) => {
  if (val === undefined || val === null) return [];
  return Array.isArray(val) ? val : [val];
};

const normalizeObjectIds = (arr) =>
  [...new Set(toArray(arr).map(String))].filter((id) => isValidObjectId(id));

const duplicateKeyResponder = (error, res) => {
  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "field";
    return res.status(409).json({
      message: `Duplicate value for "${field}". It must be unique.`,
      field,
    });
  }
  return null;
};

/* ----------------------------- CREATE ------------------------------ */
// POST /api/faculties
export const createFaculty = async (req, res) => {
  try {
    const {
      name,
      code,
      dean,
      departments,
      establishedYear,
      contactEmail,
      contactPhone,
      officeLocation,
      description,
      status,
    } = req.body;
    // console.log("Creating faculty:", name, code, dean);

    if (!name || !code || !dean) {
      return res
        .status(400)
        .json({ message: "Name, code, and dean are required fields." });
    }

    // Validate departments if provided
    const departmentIds = normalizeObjectIds(departments);
    if (departmentIds.length) {
      const found = await Department.find({ _id: { $in: departmentIds } })
        .select("_id")
        .lean();
      if (found.length !== departmentIds.length) {
        return res
          .status(400)
          .json({ message: "One or more departments were not found." });
      }
    }

    const faculty = await Faculty.create({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      dean: dean.trim(),
      departments: departmentIds,
      establishedYear,
      contactEmail: contactEmail ? contactEmail.toLowerCase().trim() : undefined,
      contactPhone: contactPhone ? contactPhone.trim() : undefined,
      officeLocation: officeLocation ? officeLocation.trim() : undefined,
      description: description ? description.trim() : undefined,
      status,
    });

    const populated = await Faculty.findById(faculty._id)
      .populate("departments", "name code headOfDepartment");

    return res
      .status(201)
      .json({ message: "Faculty created successfully", faculty: populated });
  } catch (error) {
    if (duplicateKeyResponder(error, res)) return;
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ------------------------------ LIST ------------------------------- */
// GET /api/faculties
export const getFaculties = async (req, res) => {
  try {
    const { q, status } = req.query;
 
    const filter = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { code: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { dean: { $regex: q, $options: "i" } },
        { officeLocation: { $regex: q, $options: "i" } }, // Added search by office location
      ];
    }

    if (status) {
      filter.status = new RegExp(`^${status}$`, "i");
    }

    const faculties = await Faculty.find()
      .sort({ name: 1 })
      .populate("departments", "name code headOfDepartment")
      .lean();


    return res.json(faculties);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

/* --------------------------- GET BY ID ----------------------------- */
// GET /api/faculties/:id
export const getFacultyById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid faculty ID." });
    }

    const faculty = await Faculty.findById(id)
      .populate("departments", "name code headOfDepartment");

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found." });
    }

    return res.json(faculty);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ----------------------------- UPDATE ------------------------------ */
// PUT /api/faculties/:id
export const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid faculty ID." });
    }

    const payload = { ...req.body };

    // Apply schema-defined transformations
    if (payload.name) payload.name = payload.name.trim();
    if (payload.code) payload.code = payload.code.toUpperCase().trim();
    if (payload.dean) payload.dean = payload.dean.trim();
    if (payload.contactEmail) payload.contactEmail = payload.contactEmail.toLowerCase().trim();
    if (payload.contactPhone) payload.contactPhone = payload.contactPhone.trim();
    if (payload.officeLocation) payload.officeLocation = payload.officeLocation.trim();
    if (payload.description) payload.description = payload.description.trim();

    // Normalize departments field
    if (payload.hasOwnProperty("departments")) {
      const departmentIds = normalizeObjectIds(payload.departments);
      if (departmentIds.length) {
        const found = await Department.find({ _id: { $in: departmentIds } })
          .select("_id")
          .lean();
        if (found.length !== departmentIds.length) {
          return res
            .status(400)
            .json({ message: "One or more departments were not found." });
        }
      }
      payload.departments = departmentIds;
    }

    const updated = await Faculty.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    })
      .populate("departments", "name code headOfDepartment");

    if (!updated) {
      return res.status(404).json({ message: "Faculty not found." });
    }

    return res.json({ message: "Faculty updated successfully", faculty: updated });
  } catch (error) {
    if (duplicateKeyResponder(error, res)) return;
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ----------------------------- DELETE ------------------------------ */
// DELETE /api/faculties/:id
export const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid faculty ID." });
    }

    // Check if faculty has departments before deletion
    const faculty = await Faculty.findById(id);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found." });
    }
    
    if (faculty.departments && faculty.departments.length > 0) {
      return res.status(400).json({ 
        message: "Cannot delete faculty with associated departments. Please remove departments first." 
      });
    }

    const deleted = await Faculty.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Faculty not found." });
    }

    return res.json({ message: "Faculty deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};