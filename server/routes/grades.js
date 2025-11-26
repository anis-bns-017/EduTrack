import express from "express";
import {
  getAllGrades,
  createGrade,
  updateGrade,
  deleteGrade,
  getGradesReport,
  getStudentTranscript,
  getStudentGPA,
  getStudentResultsBySemester,
  getDepartmentResultsByYearAndSemester,
  getResultsByYearAndSemester,
  getSectionResults,
  getClassStatistics,
  getDepartmentStatistics,
  getHonorRoll,
  getGraduationRequirementsStatus,
  publishGrade,
  lockGrade,
  unlockGrade,
  submitForModeration,
  approveModeration,
  rejectModeration,
  submitAppeal,
  decideAppeal,
  verifyGrade,
  bulkCreateGrades,
  bulkUpdateGrades,
  getGradesPendingModeration,
  getGradesWithAppeals,
} from "../controllers/gradeController.js";
import protect from "./protect.js";

const router = express.Router();

// Basic CRUD operations
router.get("/", getAllGrades); // Public - add protect here if you want to restrict access
router.post("/", protect, createGrade);
router.put("/:id", protect, updateGrade);
router.delete("/:id", protect, deleteGrade);
router.get("/report", getGradesReport);

// Student-specific endpoints
router.get("/transcript/:studentId", protect, getStudentTranscript);
router.get("/gpa/:studentId", protect, getStudentGPA);
router.get("/student/:studentId/results", protect, getStudentResultsBySemester);

// Department and course endpoints
router.get("/department/:departmentId/results", protect, getDepartmentResultsByYearAndSemester);
router.get("/department-statistics", protect, getDepartmentStatistics);
router.get("/class-statistics", protect, getClassStatistics);

// Section and semester endpoints
router.get("/section/results", protect, getSectionResults);
router.get("/results", protect, getResultsByYearAndSemester);

// Honor roll and graduation requirements
router.get("/honor-roll", protect, getHonorRoll);
router.get("/graduation-requirements/:studentId/:programId", protect, getGraduationRequirementsStatus);

// Grade management endpoints
router.patch("/:id/publish", protect, publishGrade);
router.post("/:id/lock", protect, lockGrade);
router.post("/:id/unlock", protect, unlockGrade);
router.post("/:id/moderate", protect, submitForModeration);
router.post("/:id/moderate/approve", protect, approveModeration);
router.post("/:id/moderate/reject", protect, rejectModeration);
router.post("/:id/appeal", protect, submitAppeal);
router.post("/:id/appeal/decide", protect, decideAppeal);
router.post("/:id/verify", protect, verifyGrade);

// Bulk operations
router.post("/bulk-create", protect, bulkCreateGrades);
router.post("/bulk-update", protect, bulkUpdateGrades);
router.post("/bulk-delete", protect, (req, res) => {
  // This would need to be implemented in the controller
  // For now, we can use the existing delete endpoint in a loop
  const { gradeIds } = req.body;
  // Implementation would go here
});

// Special views
router.get("/pending-moderation", protect, getGradesPendingModeration);
router.get("/with-appeals", protect, getGradesWithAppeals);

// Import/Export endpoints
router.get("/export", protect, (req, res) => {
  // This would need to be implemented in the controller
  // For now, just return a placeholder
  res.status(501).json({ message: "Export functionality not yet implemented" });
});

router.post("/import", protect, (req, res) => {
  // This would need to be implemented in the controller
  // For now, just return a placeholder
  res.status(501).json({ message: "Import functionality not yet implemented" });
});

export default router;