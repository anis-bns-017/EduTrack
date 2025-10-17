"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  X,
  Plus,
  Trash2,
  Calendar,
  User,
  BookOpen,
  Clock,
  Percent,
  Hash,
  AlertCircle,
  Calculator,
  CheckCircle,
  Info,
  GraduationCap,
  School,
  FileText,
  Award,
  Users,
  ChevronDown,
  ChevronUp,
  Edit3,
  Save,
  Loader2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  MessageSquare,
  Shield,
  History,
  Settings
} from "lucide-react";
import axios from "../../api/axios";
import React from "react";

const GradeFormModal = ({
  open,
  onClose,
  onSave,
  initialData,
  students = [],
  courses = [],
  departments = [],
  teachers = [],
  currentUser = null,
}) => {
  const isEditing = !!initialData;
  
  // Initial state management
  const initialFormState = useMemo(() => ({
    student: "",
    department: "",
    program: "",
    course: "",
    section: "",
    instructor: "",
    term: "",
    year: "",
    semester: "",
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    creditHours: 0,
    isAudit: false,
    isRepeat: false,
    previousGrade: "",
    remarks: "",
    assessments: [],
    // NEW: Additional fields from the model
    createdBy: currentUser?.id || "",
    updatedBy: currentUser?.id || "",
    isLocked: false,
    lockedBy: "",
    lockedAt: null,
    moderationStatus: "None",
    moderatedBy: "",
    moderatedAt: null,
    moderationNotes: "",
    appealStatus: "None",
    appealReason: "",
    appealDecision: "",
    appealDecidedBy: "",
    appealDecidedDate: null,
    isPublished: false,
    publishedBy: "",
    publishedDate: null,
    version: 1,
  }), [currentUser]);

  const initialAssessmentState = useMemo(() => ({
    title: "",
    description: "",
    assessmentType: "Assignment",
    score: 0,
    maxScore: 100,
    weight: 0,
    dueDate: "",
    submittedDate: "",
    gradedDate: "",
    gradedBy: "",
    feedback: "",
    isAbsent: false,
    isExcused: false,
    status: "Pending",
    // NEW: Additional fields from the model
    attachments: [],
    rubricScores: [],
  }), []);

  const [formData, setFormData] = useState(initialFormState);
  const [newAssessment, setNewAssessment] = useState(initialAssessmentState);
  const [errors, setErrors] = useState({});
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [hoveredAssessment, setHoveredAssessment] = useState(null);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedAssessment, setExpandedAssessment] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showModerationOptions, setShowModerationOptions] = useState(false);
  const [showAppealOptions, setShowAppealOptions] = useState(false);

  const programs = [
    "Undergraduate",
    "Graduate",
    "PhD",
    "Diploma",
    "Certificate",
  ];
  const sections = ["Section A", "Section B", "Section C", "Section D"];
  const terms = ["Fall", "Spring", "Summer", "Winter"];
  const assessmentTypes = [
    "Assignment",
    "Quiz",
    "Midterm",
    "Final",
    "Project",
    "Presentation",
    "Lab Work",
    "Participation",
    "Attendance",
  ];
  const statusOptions = ["Pending", "Graded", "Appealed", "Regraded"];
  const moderationStatusOptions = ["None", "Pending", "Approved", "Rejected"];
  const appealStatusOptions = ["None", "Requested", "Under Review", "Approved", "Rejected"];

  // Use teachers from prop if available, otherwise use fetched teachers
  const allTeachers = useMemo(() => {
    return teachers?.length > 0 ? teachers : availableTeachers;
  }, [teachers, availableTeachers]);

  // Improved teacher filtering
  const filteredTeachers = useMemo(() => {
    const teacherList = Array.isArray(allTeachers) ? allTeachers : [];
    
    if (!formData.department) {
      return teacherList;
    }

    return teacherList.filter((teacher) => {
      if (!teacher) return false;
      
      const teacherDeptId = teacher.department?._id || teacher.department?.id || teacher.department;
      return teacherDeptId === formData.department;
    });
  }, [formData.department, allTeachers]);

  // Improved course filtering
  const filteredCourses = useMemo(() => {
    if (!formData.department || !Array.isArray(courses)) {
      return courses || [];
    }
    
    return courses.filter((course) => {
      if (!course) return false;
      
      const courseDeptId = course.department?._id || course.department?.id || course.department;
      return courseDeptId === formData.department;
    });
  }, [formData.department, courses]);

  // Calculate total weight and grade
  const gradeSummary = useMemo(() => {
    const totalWeight = formData.assessments.reduce((sum, assessment) => sum + (assessment.weight || 0), 0);
    const weightedScore = formData.assessments.reduce((sum, assessment) => {
      if (!assessment.maxScore || assessment.maxScore === 0) return sum;
      return sum + ((assessment.score / assessment.maxScore) * assessment.weight);
    }, 0);
    
    let letterGrade = "F";
    if (totalWeight > 0) {
      const percentage = (weightedScore / totalWeight) * 100;
      if (percentage >= 90) letterGrade = "A+";
      else if (percentage >= 85) letterGrade = "A";
      else if (percentage >= 80) letterGrade = "A-";
      else if (percentage >= 75) letterGrade = "B+";
      else if (percentage >= 70) letterGrade = "B";
      else if (percentage >= 65) letterGrade = "B-";
      else if (percentage >= 60) letterGrade = "C+";
      else if (percentage >= 55) letterGrade = "C";
      else if (percentage >= 50) letterGrade = "C-";
      else if (percentage >= 45) letterGrade = "D";
      else letterGrade = "F";
    }
    
    let gradePoint = 0.00;
    if (letterGrade === "A+") gradePoint = 4.00;
    else if (letterGrade === "A") gradePoint = 3.75;
    else if (letterGrade === "A-") gradePoint = 3.50;
    else if (letterGrade === "B+") gradePoint = 3.25;
    else if (letterGrade === "B") gradePoint = 3.00;
    else if (letterGrade === "B-") gradePoint = 2.75;
    else if (letterGrade === "C+") gradePoint = 2.50;
    else if (letterGrade === "C") gradePoint = 2.25;
    else if (letterGrade === "C-") gradePoint = 2.00;
    else if (letterGrade === "D") gradePoint = 1.00;
    
    let resultStatus = "Fail";
    if (['F', 'NP'].includes(letterGrade)) {
      resultStatus = 'Fail';
    } else if (['I', 'W'].includes(letterGrade)) {
      resultStatus = 'Incomplete';
    } else if (letterGrade === 'P') {
      resultStatus = 'Pass';
    } else if (gradePoint >= 2.0) {
      resultStatus = 'Pass';
    }
    
    return {
      totalWeight,
      weightedScore,
      percentage: totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0,
      letterGrade,
      gradePoint,
      resultStatus
    };
  }, [formData.assessments]);

  // Fetch teachers
  const fetchTeachers = useCallback(async () => {
    if (teachers?.length > 0) {
      setAvailableTeachers(teachers);
      return;
    }

    try {
      setLoadingTeachers(true);
      const response = await axios.get("/teachers");
      
      let teachersArray = [];
      if (Array.isArray(response.data?.data)) {
        teachersArray = response.data.data;
      } else if (Array.isArray(response.data)) {
        teachersArray = response.data;
      }
      
      setAvailableTeachers(teachersArray);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      setAvailableTeachers([]);
      setErrors((prev) => ({
        ...prev,
        teachers: "Failed to load teachers. Please try again.",
      }));
    } finally {
      setLoadingTeachers(false);
    }
  }, [teachers]);

  useEffect(() => {
    if (open) {
      fetchTeachers();
    }
  }, [open, fetchTeachers]);

  // Reset instructor when department changes
  useEffect(() => {
    if (formData.department && formData.instructor && filteredTeachers.length > 0) {
      const instructorExists = filteredTeachers.some(
        (teacher) => teacher?._id === formData.instructor
      );
      if (!instructorExists) {
        setFormData((prev) => ({ ...prev, instructor: "" }));
      }
    }
  }, [formData.department, formData.instructor, filteredTeachers]);

  // Reset course when department changes
  useEffect(() => {
    if (formData.department && formData.course && filteredCourses.length > 0) {
      const courseExists = filteredCourses.some(
        (course) => course?._id === formData.course
      );
      if (!courseExists) {
        setFormData((prev) => ({ ...prev, course: "" }));
      }
    }
  }, [formData.department, formData.course, filteredCourses]);

  // Validate form
  useEffect(() => {
    const requiredFields = ['student', 'department', 'program', 'section', 'instructor', 'term', 'academicYear'];
    const isValid = requiredFields.every(field => formData[field]);
    setIsFormValid(isValid);
  }, [formData]);

  // Improved form reset and initialization
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          ...initialFormState,
          student: initialData.student?._id || initialData.student || "",
          department: initialData.department?._id || initialData.department || "",
          program: initialData.program || "",
          course: initialData.course?._id || initialData.course || "",
          section: initialData.section || "",
          instructor: initialData.instructor?._id || initialData.instructor || "",
          term: initialData.term || "",
          year: initialData.year || "",
          semester: initialData.semester || "",
          academicYear: initialData.academicYear || initialFormState.academicYear,
          creditHours: initialData.creditHours || 0,
          isAudit: initialData.isAudit || false,
          isRepeat: initialData.isRepeat || false,
          previousGrade: initialData.previousGrade || "",
          remarks: initialData.remarks || "",
          assessments: initialData.assessments || [],
          // NEW: Additional fields from the model
          createdBy: initialData.createdBy || currentUser?.id || "",
          updatedBy: initialData.updatedBy || currentUser?.id || "",
          isLocked: initialData.isLocked || false,
          lockedBy: initialData.lockedBy || "",
          lockedAt: initialData.lockedAt || null,
          moderationStatus: initialData.moderationStatus || "None",
          moderatedBy: initialData.moderatedBy || "",
          moderatedAt: initialData.moderatedAt || null,
          moderationNotes: initialData.moderationNotes || "",
          appealStatus: initialData.appealStatus || "None",
          appealReason: initialData.appealReason || "",
          appealDecision: initialData.appealDecision || "",
          appealDecidedBy: initialData.appealDecidedBy || "",
          appealDecidedDate: initialData.appealDecidedDate || null,
          isPublished: initialData.isPublished || false,
          publishedBy: initialData.publishedBy || "",
          publishedDate: initialData.publishedDate || null,
          version: initialData.version || 1,
        });
      } else {
        setFormData(initialFormState);
      }
      setErrors({});
      setShowAssessmentForm(false);
      setActiveTab("basic");
      setNewAssessment(initialAssessmentState);
      setExpandedAssessment(null);
      setShowAdvancedOptions(false);
      setShowModerationOptions(false);
      setShowAppealOptions(false);
    }
  }, [initialData, open, initialFormState, initialAssessmentState, currentUser]);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = value;
    if (type === "number") {
      processedValue = value === "" ? "" : parseFloat(value);
    } else if (type === "checkbox") {
      processedValue = checked;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
      updatedBy: currentUser?.id || "",
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors, currentUser]);

  const handleAssessmentChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = value;
    if (type === "number") {
      processedValue = value === "" ? "" : parseFloat(value);
    } else if (type === "checkbox") {
      processedValue = checked;
    }

    setNewAssessment((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear assessment errors
    if (errors.assessment) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.assessment;
        return newErrors;
      });
    }
  }, [errors]);

  const handleAddAssessment = useCallback(() => {
    const assessmentErrors = {};

    if (!newAssessment.title?.trim()) {
      assessmentErrors.title = "Title is required";
    }

    if (!newAssessment.assessmentType) {
      assessmentErrors.type = "Assessment type is required";
    }

    const score = parseFloat(newAssessment.score) || 0;
    const maxScore = parseFloat(newAssessment.maxScore) || 0;
    const weight = parseFloat(newAssessment.weight) || 0;

    if (score < 0) {
      assessmentErrors.score = "Score cannot be negative";
    }

    if (maxScore <= 0) {
      assessmentErrors.maxScore = "Max score must be greater than 0";
    }

    if (score > maxScore) {
      assessmentErrors.score = "Score cannot be greater than max score";
    }

    if (weight < 0 || weight > 100) {
      assessmentErrors.weight = "Weight must be between 0 and 100";
    }

    if (Object.keys(assessmentErrors).length > 0) {
      setErrors({ assessment: assessmentErrors });
      return;
    }

    const assessmentWithId = {
      ...newAssessment,
      id: Date.now() + Math.random(), // Simple unique ID for frontend
      score,
      maxScore,
      weight,
      gradedBy: newAssessment.status === "Graded" ? currentUser?.id : "",
    };

    setFormData((prev) => ({
      ...prev,
      assessments: [...prev.assessments, assessmentWithId],
      updatedBy: currentUser?.id || "",
    }));

    setNewAssessment(initialAssessmentState);
    setShowAssessmentForm(false);
    setErrors({});
  }, [newAssessment, initialAssessmentState, currentUser]);

  const handleRemoveAssessment = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      assessments: prev.assessments.filter((_, i) => i !== index),
      updatedBy: currentUser?.id || "",
    }));
  }, [currentUser]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    // Required field validation
    if (!formData.student) newErrors.student = "Please select a student";
    if (!formData.department) newErrors.department = "Please select a department";
    if (!formData.course) newErrors.course = "Please select a course";
    if (!formData.instructor) newErrors.instructor = "Please select an instructor";
    if (!formData.program) newErrors.program = "Please select a program";
    if (!formData.section) newErrors.section = "Please select a section";
    if (!formData.term?.trim()) newErrors.term = "Term is required";
    if (!formData.academicYear?.trim()) newErrors.academicYear = "Academic year is required";

    // Credit hours validation
    if (!formData.creditHours || parseFloat(formData.creditHours) <= 0) {
      newErrors.creditHours = "Credit hours must be greater than 0";
    }

    // Year and semester validation
    const year = parseInt(formData.year);
    const semester = parseInt(formData.semester);
    
    if (!year || year < 1 || year > 5) {
      newErrors.year = "Year must be between 1 and 5";
    }
    
    if (!semester || semester < 1 || semester > 12) {
      newErrors.semester = "Semester must be between 1 and 12";
    }

    // Assessment validation
    formData.assessments.forEach((assessment, index) => {
      const score = parseFloat(assessment.score) || 0;
      const maxScore = parseFloat(assessment.maxScore) || 0;
      
      if (score > maxScore) {
        newErrors[`assessment-${index}`] = `Score cannot exceed max score in "${assessment.title}"`;
      }
      if (maxScore <= 0) {
        newErrors[`assessment-${index}`] = `Max score must be greater than 0 in "${assessment.title}"`;
      }
    });

    // Weight validation
    if (gradeSummary.totalWeight > 100) {
      newErrors.totalWeight = "Total assessment weight cannot exceed 100%";
    }

    // Check if total weight is reasonable when assessments exist
    if (formData.assessments.length > 0 && gradeSummary.totalWeight === 0) {
      newErrors.totalWeight = "Assessment weights must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, gradeSummary.totalWeight]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const hasBasicErrors = Object.keys(errors).some(
        (key) => !key.startsWith("assessment-") && key !== "totalWeight"
      );
      if (hasBasicErrors) {
        setActiveTab("basic");
      } else {
        setActiveTab("assessments");
      }
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare data for backend
      const submitData = {
        ...formData,
        year: parseInt(formData.year) || 1,
        semester: parseInt(formData.semester) || 1,
        creditHours: parseFloat(formData.creditHours) || 0,
        assessments: formData.assessments.map(({ id, ...assessment }) => ({
          ...assessment,
          score: parseFloat(assessment.score) || 0,
          maxScore: parseFloat(assessment.maxScore) || 100,
          weight: parseFloat(assessment.weight) || 0,
        })),
        // Include calculated fields
        totalScore: gradeSummary.weightedScore,
        maxTotalScore: gradeSummary.totalWeight,
        percentage: gradeSummary.percentage,
        finalGrade: gradeSummary.letterGrade,
        gradePoint: gradeSummary.gradePoint,
        resultStatus: gradeSummary.resultStatus,
        // Ensure user fields are set
        createdBy: formData.createdBy || currentUser?.id,
        updatedBy: currentUser?.id,
      };

      await onSave(submitData);
    } catch (error) {
      console.error("Error saving grade:", error);
      setErrors({ 
        submit: error.response?.data?.message || error.message || "Failed to save grade. Please try again." 
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onSave, errors, gradeSummary, currentUser]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && open && !isSubmitting) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open, onClose, isSubmitting]);

  // Don't render if not open
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-indigo-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-500 bg-opacity-20 p-2 rounded-lg">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {isEditing ? "Edit Grade" : "Add New Grade"}
                </h2>
                <p className="text-indigo-200 text-sm">
                  {isEditing
                    ? "Update grade information"
                    : "Create a new grade record"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-red-500 bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all duration-200 disabled:opacity-50"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Global Errors */}
        {(errors.submit || errors.teachers || errors.totalWeight) && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <div className="text-sm text-red-700">
                {errors.submit || errors.teachers || errors.totalWeight}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setActiveTab("basic")}
            className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
              activeTab === "basic"
                ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            aria-selected={activeTab === "basic"}
          >
            <div className="flex items-center justify-center space-x-2">
              <User className="h-4 w-4" />
              <span>Basic Information</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("assessments")}
            className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
              activeTab === "assessments"
                ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            aria-selected={activeTab === "assessments"}
          >
            <div className="flex items-center justify-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Assessments</span>
              {formData.assessments.length > 0 && (
                <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded-full">
                  {formData.assessments.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab("advanced")}
            className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
              activeTab === "advanced"
                ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            aria-selected={activeTab === "advanced"}
          >
            <div className="flex items-center justify-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Advanced Options</span>
            </div>
          </button>
        </div>

        {/* Form Content */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]"
        >
          {/* Basic Information Tab */}
          {activeTab === "basic" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                    <School className="h-5 w-5 text-indigo-600" />
                  </div>
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Student Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student *
                    </label>
                    <select
                      name="student"
                      value={formData.student}
                      onChange={handleInputChange}
                      disabled={isEditing || isSubmitting}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                      aria-describedby={errors.student ? "student-error" : undefined}
                    >
                      <option value="">Select Student</option>
                      {students.map((student) => (
                        <option key={student._id} value={student._id}>
                          {student.name} ({student.rollNumber})
                        </option>
                      ))}
                    </select>
                    {errors.student && (
                      <p id="student-error" className="text-red-500 text-xs mt-1">
                        {errors.student}
                      </p>
                    )}
                  </div>

                  {/* Department Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white disabled:bg-gray-50"
                      aria-describedby={errors.department ? "department-error" : undefined}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    {errors.department && (
                      <p id="department-error" className="text-red-500 text-xs mt-1">
                        {errors.department}
                      </p>
                    )}
                  </div>

                  {/* Program Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Program *
                    </label>
                    <select
                      name="program"
                      value={formData.program}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white disabled:bg-gray-50"
                      aria-describedby={errors.program ? "program-error" : undefined}
                    >
                      <option value="">Select Program</option>
                      {programs.map((program) => (
                        <option key={program} value={program}>
                          {program}
                        </option>
                      ))}
                    </select>
                    {errors.program && (
                      <p id="program-error" className="text-red-500 text-xs mt-1">
                        {errors.program}
                      </p>
                    )}
                  </div>

                  {/* Section Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section *
                    </label>
                    <select
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white disabled:bg-gray-50"
                      aria-describedby={errors.section ? "section-error" : undefined}
                    >
                      <option value="">Select Section</option>
                      {sections.map((section) => (
                        <option key={section} value={section}>
                          {section}
                        </option>
                      ))}
                    </select>
                    {errors.section && (
                      <p id="section-error" className="text-red-500 text-xs mt-1">
                        {errors.section}
                      </p>
                    )}
                  </div>

                  {/* Instructor Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructor *
                    </label>
                    <select
                      name="instructor"
                      value={formData.instructor}
                      onChange={handleInputChange}
                      disabled={loadingTeachers || isSubmitting}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white disabled:bg-gray-50"
                      aria-describedby={errors.instructor ? "instructor-error" : undefined}
                    >
                      <option value="">
                        {loadingTeachers ? "Loading..." : "Select Instructor"}
                      </option>
                      {formData.department ? (
                        filteredTeachers.length > 0 ? (
                          filteredTeachers.map((teacher) => (
                            <option key={teacher._id} value={teacher._id}>
                              {teacher.name || teacher.formalName}
                              {teacher.department?.name && ` - (${teacher.department.name})`}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            No teachers found in this department
                          </option>
                        )
                      ) : (
                        allTeachers.map((teacher) => (
                          <option key={teacher._id} value={teacher._id}>
                            {teacher.name || teacher.formalName}
                            {teacher.department?.name && ` - (${teacher.department.name})`}
                          </option>
                        ))
                      )}
                    </select>
                    {loadingTeachers && (
                      <p className="text-blue-500 text-xs mt-1">
                        Loading teachers...
                      </p>
                    )}
                    {errors.instructor && (
                      <p id="instructor-error" className="text-red-500 text-xs mt-1">
                        {errors.instructor}
                      </p>
                    )}
                    {formData.department && filteredTeachers.length === 0 && !loadingTeachers && (
                      <p className="text-yellow-600 text-xs mt-1">
                        No teachers available in the selected department
                      </p>
                    )}
                  </div>

                  {/* Course Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course *
                    </label>
                    <select
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white disabled:bg-gray-50"
                      aria-describedby={errors.course ? "course-error" : undefined}
                    >
                      <option value="">Select Course</option>
                      {formData.department ? (
                        filteredCourses.length > 0 ? (
                          filteredCourses.map((course) => (
                            <option key={course._id} value={course._id}>
                              {course.code} - {course.name}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            No courses found in this department
                          </option>
                        )
                      ) : (
                        courses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.code} - {course.name}
                          </option>
                        ))
                      )}
                    </select>
                    {errors.course && (
                      <p id="course-error" className="text-red-500 text-xs mt-1">
                        {errors.course}
                      </p>
                    )}
                    {formData.department && filteredCourses.length === 0 && (
                      <p className="text-yellow-600 text-xs mt-1">
                        No courses available in the selected department
                      </p>
                    )}
                  </div>

                  {/* Term Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Term *
                    </label>
                    <select
                      name="term"
                      value={formData.term}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white disabled:bg-gray-50"
                      aria-describedby={errors.term ? "term-error" : undefined}
                    >
                      <option value="">Select Term</option>
                      {terms.map((term) => (
                        <option key={term} value={term}>
                          {term}
                        </option>
                      ))}
                    </select>
                    {errors.term && (
                      <p id="term-error" className="text-red-500 text-xs mt-1">
                        {errors.term}
                      </p>
                    )}
                  </div>

                  {/* Academic Year Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Academic Year *
                    </label>
                    <input
                      type="text"
                      name="academicYear"
                      value={formData.academicYear}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 disabled:bg-gray-50"
                      placeholder="e.g., 2023-2024"
                      aria-describedby={errors.academicYear ? "academic-year-error" : undefined}
                    />
                    {errors.academicYear && (
                      <p id="academic-year-error" className="text-red-500 text-xs mt-1">
                        {errors.academicYear}
                      </p>
                    )}
                  </div>

                  {/* Year Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year *
                    </label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white disabled:bg-gray-50"
                      aria-describedby={errors.year ? "year-error" : undefined}
                    >
                      <option value="">Select Year</option>
                      {[1, 2, 3, 4, 5].map((year) => (
                        <option key={year} value={year}>
                          Year {year}
                        </option>
                      ))}
                    </select>
                    {errors.year && (
                      <p id="year-error" className="text-red-500 text-xs mt-1">
                        {errors.year}
                      </p>
                    )}
                  </div>

                  {/* Semester Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Semester *
                    </label>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white disabled:bg-gray-50"
                      aria-describedby={errors.semester ? "semester-error" : undefined}
                    >
                      <option value="">Select Semester</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((sem) => (
                        <option key={sem} value={sem}>
                          Semester {sem}
                        </option>
                      ))}
                    </select>
                    {errors.semester && (
                      <p id="semester-error" className="text-red-500 text-xs mt-1">
                        {errors.semester}
                      </p>
                    )}
                  </div>

                  {/* Credit Hours Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Credit Hours *
                    </label>
                    <input
                      type="number"
                      name="creditHours"
                      value={formData.creditHours}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      min="0"
                      step="0.5"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 disabled:bg-gray-50"
                      aria-describedby={errors.creditHours ? "credit-hours-error" : undefined}
                    />
                    {errors.creditHours && (
                      <p id="credit-hours-error" className="text-red-500 text-xs mt-1">
                        {errors.creditHours}
                      </p>
                    )}
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex flex-wrap gap-6 mt-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isAudit"
                      name="isAudit"
                      checked={formData.isAudit}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <label
                      htmlFor="isAudit"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Audit Course
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isRepeat"
                      name="isRepeat"
                      checked={formData.isRepeat}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <label
                      htmlFor="isRepeat"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Repeat Course
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPublished"
                      name="isPublished"
                      checked={formData.isPublished}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                    />
                    <label
                      htmlFor="isPublished"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Published
                    </label>
                  </div>
                </div>

                {/* Previous Grade (conditional) */}
                {formData.isRepeat && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Previous Grade Reference
                    </label>
                    <input
                      type="text"
                      name="previousGrade"
                      value={formData.previousGrade}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 disabled:bg-gray-50"
                      placeholder="Previous grade ID"
                    />
                  </div>
                )}

                {/* Remarks */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows={3}
                    disabled={isSubmitting}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 disabled:bg-gray-50"
                    placeholder="Any additional remarks..."
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Assessments Tab */}
          {activeTab === "assessments" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                      <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                        <BookOpen className="h-5 w-5 text-indigo-600" />
                      </div>
                      Assessments
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Manage assessments and calculate final grades
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAssessmentForm(!showAssessmentForm)}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-md disabled:opacity-50"
                  >
                    <Plus size={16} />
                    <span>Add Assessment</span>
                  </button>
                </div>

                {/* Grade Summary */}
                {formData.assessments.length > 0 && (
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-5 text-white mb-6 shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white bg-opacity-20 p-2 rounded-full">
                          <Calculator className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm opacity-80">Total Score</div>
                          <div className="text-lg font-bold">
                            {gradeSummary.weightedScore.toFixed(1)}/{gradeSummary.totalWeight.toFixed(1)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="bg-white bg-opacity-20 p-2 rounded-full">
                          <Percent className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm opacity-80">Percentage</div>
                          <div className="text-lg font-bold">
                            {gradeSummary.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="bg-white bg-opacity-20 p-2 rounded-full">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm opacity-80">Final Grade</div>
                          <div className="text-lg font-bold">
                            {gradeSummary.letterGrade} (GPA: {gradeSummary.gradePoint.toFixed(2)})
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="bg-white bg-opacity-20 p-2 rounded-full">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm opacity-80">Status</div>
                          <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                            gradeSummary.resultStatus === "Pass" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {gradeSummary.resultStatus}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Grade Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span>0%</span>
                        <span>Progress</span>
                        <span>100%</span>
                      </div>
                      <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            gradeSummary.percentage >= 80 
                              ? "bg-green-400" 
                              : gradeSummary.percentage >= 60 
                              ? "bg-yellow-400" 
                              : "bg-red-400"
                          }`}
                          style={{ width: `${Math.min(gradeSummary.percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Weight Warning */}
                    {gradeSummary.totalWeight > 100 && (
                      <div className="mt-3 p-2 bg-red-500 bg-opacity-20 rounded-lg flex items-center">
                        <AlertCircle size={16} className="mr-2" />
                        <span className="text-sm">Total assessment weight exceeds 100%</span>
                      </div>
                    )}
                  </div>
                )}

                {/* New Assessment Form */}
                {showAssessmentForm && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 mb-6 border-2 border-dashed border-indigo-200">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                      <Plus className="h-4 w-4 mr-2 text-indigo-600" />
                      New Assessment
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Title *
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={newAssessment.title}
                          onChange={handleAssessmentChange}
                          disabled={isSubmitting}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white disabled:bg-gray-50"
                          placeholder="Assessment title"
                        />
                        {errors.assessment?.title && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.assessment.title}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type *
                        </label>
                        <select
                          name="assessmentType"
                          value={newAssessment.assessmentType}
                          onChange={handleAssessmentChange}
                          disabled={isSubmitting}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white disabled:bg-gray-50"
                        >
                          {assessmentTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        {errors.assessment?.type && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.assessment.type}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          name="status"
                          value={newAssessment.status}
                          onChange={handleAssessmentChange}
                          disabled={isSubmitting}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white disabled:bg-gray-50"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Hash size={16} className="mr-1" />
                          Score
                        </label>
                        <input
                          type="number"
                          name="score"
                          value={newAssessment.score}
                          onChange={handleAssessmentChange}
                          disabled={isSubmitting}
                          min="0"
                          step="0.1"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white disabled:bg-gray-50"
                        />
                        {errors.assessment?.score && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.assessment.score}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Score
                        </label>
                        <input
                          type="number"
                          name="maxScore"
                          value={newAssessment.maxScore}
                          onChange={handleAssessmentChange}
                          disabled={isSubmitting}
                          min="1"
                          step="0.1"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white disabled:bg-gray-50"
                        />
                        {errors.assessment?.maxScore && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.assessment.maxScore}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Percent size={16} className="mr-1" />
                          Weight (%)
                        </label>
                        <input
                          type="number"
                          name="weight"
                          value={newAssessment.weight}
                          onChange={handleAssessmentChange}
                          disabled={isSubmitting}
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white disabled:bg-gray-50"
                        />
                        {errors.assessment?.weight && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.assessment.weight}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Calendar size={16} className="mr-1" />
                          Due Date
                        </label>
                        <input
                          type="date"
                          name="dueDate"
                          value={newAssessment.dueDate}
                          onChange={handleAssessmentChange}
                          disabled={isSubmitting}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white disabled:bg-gray-50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <Calendar size={16} className="mr-1" />
                          Graded Date
                        </label>
                        <input
                          type="date"
                          name="gradedDate"
                          value={newAssessment.gradedDate}
                          onChange={handleAssessmentChange}
                          disabled={isSubmitting}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white disabled:bg-gray-50"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={newAssessment.description}
                          onChange={handleAssessmentChange}
                          rows={2}
                          disabled={isSubmitting}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 disabled:bg-gray-50"
                          placeholder="Assessment description..."
                        ></textarea>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Feedback
                        </label>
                        <textarea
                          name="feedback"
                          value={newAssessment.feedback}
                          onChange={handleAssessmentChange}
                          rows={2}
                          disabled={isSubmitting}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 disabled:bg-gray-50"
                          placeholder="Assessment feedback..."
                        ></textarea>
                      </div>

                      <div className="md:col-span-2 flex flex-wrap gap-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isAbsent"
                            name="isAbsent"
                            checked={newAssessment.isAbsent}
                            onChange={handleAssessmentChange}
                            disabled={isSubmitting}
                            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                          />
                          <label
                            htmlFor="isAbsent"
                            className="ml-2 block text-sm text-gray-700"
                          >
                            Student Absent
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="isExcused"
                            name="isExcused"
                            checked={newAssessment.isExcused}
                            onChange={handleAssessmentChange}
                            disabled={isSubmitting}
                            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                          />
                          <label
                            htmlFor="isExcused"
                            className="ml-2 block text-sm text-gray-700"
                          >
                            Excused
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Display specific assessment errors */}
                    {errors.assessment && typeof errors.assessment === "object" && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        {Object.values(errors.assessment).map((error, index) => (
                          <p key={index} className="text-red-700 text-sm flex items-center">
                            <AlertCircle size={14} className="mr-2" />
                            {error}
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end mt-6 space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowAssessmentForm(false)}
                        disabled={isSubmitting}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddAssessment}
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                      >
                        <Plus size={16} />
                        <span>Add Assessment</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Assessments List */}
                {formData.assessments.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {formData.assessments.map((assessment, index) => {
                      const score = parseFloat(assessment.score) || 0;
                      const maxScore = parseFloat(assessment.maxScore) || 100;
                      const weight = parseFloat(assessment.weight) || 0;
                      
                      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

                      return (
                        <div
                          key={assessment.id || index}
                          className={`bg-white rounded-xl p-5 border transition-all duration-200 ${
                            hoveredAssessment === index
                              ? "border-indigo-300 shadow-md"
                              : "border-gray-200"
                          }`}
                          onMouseEnter={() => setHoveredAssessment(index)}
                          onMouseLeave={() => setHoveredAssessment(null)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <h4 className="font-bold text-gray-800">
                                  {assessment.title}
                                </h4>
                                <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded-full">
                                  {assessment.assessmentType}
                                </span>
                                <span
                                  className={`text-xs font-bold px-2 py-1 rounded-full ${
                                    assessment.status === "Graded"
                                      ? "bg-green-100 text-green-800"
                                      : assessment.status === "Appealed"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : assessment.status === "Regraded"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {assessment.status}
                                </span>
                                {assessment.isExcused && (
                                  <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2 py-1 rounded-full">
                                    Excused
                                  </span>
                                )}
                                {assessment.isAbsent && (
                                  <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                                    Absent
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <div className="text-xs text-gray-500">
                                    Score
                                  </div>
                                  <div className="font-bold text-gray-800">
                                    {score.toFixed(1)}/{maxScore.toFixed(1)}
                                  </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <div className="text-xs text-gray-500">
                                    Weight
                                  </div>
                                  <div className="font-bold text-gray-800">
                                    {weight.toFixed(1)}%
                                  </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <div className="text-xs text-gray-500">
                                    Percentage
                                  </div>
                                  <div
                                    className={`font-bold ${
                                      percentage >= 80 
                                        ? "text-green-600" 
                                        : percentage >= 60 
                                        ? "text-yellow-600" 
                                        : "text-red-600"
                                    }`}
                                  >
                                    {percentage}%
                                  </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <div className="text-xs text-gray-500">
                                    Contribution
                                  </div>
                                  <div
                                    className={`font-bold ${
                                      percentage >= 80 
                                        ? "text-green-600" 
                                        : percentage >= 60 
                                        ? "text-yellow-600" 
                                        : "text-red-600"
                                    }`}
                                  >
                                    {((percentage * weight) / 100).toFixed(1)}%
                                  </div>
                                </div>
                              </div>

                              {assessment.dueDate && (
                                <div className="flex items-center mt-3 text-sm text-gray-600">
                                  <Clock size={14} className="mr-1" />
                                  Due:{" "}
                                  {new Date(
                                    assessment.dueDate
                                  ).toLocaleDateString()}
                                </div>
                              )}

                              {errors[`assessment-${index}`] && (
                                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center">
                                  <AlertCircle
                                    size={14}
                                    className="text-red-500 mr-2"
                                  />
                                  <p className="text-red-700 text-xs">
                                    {errors[`assessment-${index}`]}
                                  </p>
                                </div>
                              )}
                            </div>

                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => setExpandedAssessment(
                                  expandedAssessment === index ? null : index
                                )}
                                disabled={isSubmitting}
                                className="text-indigo-500 hover:text-indigo-700 p-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 disabled:opacity-50"
                                aria-label={`Toggle details for ${assessment.title} assessment`}
                              >
                                {expandedAssessment === index ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveAssessment(index)}
                                disabled={isSubmitting}
                                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all duration-200 disabled:opacity-50"
                                aria-label={`Remove ${assessment.title} assessment`}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>

                          {/* Expanded Assessment Details */}
                          {expandedAssessment === index && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                {assessment.description && (
                                  <div className="md:col-span-2">
                                    <div className="font-medium text-gray-700 mb-1">Description</div>
                                    <div className="text-gray-600">{assessment.description}</div>
                                  </div>
                                )}
                                
                                {assessment.feedback && (
                                  <div className="md:col-span-2">
                                    <div className="font-medium text-gray-700 mb-1">Feedback</div>
                                    <div className="text-gray-600">{assessment.feedback}</div>
                                  </div>
                                )}
                                
                                {assessment.gradedDate && (
                                  <div>
                                    <div className="font-medium text-gray-700 mb-1">Graded Date</div>
                                    <div className="text-gray-600">
                                      {new Date(assessment.gradedDate).toLocaleDateString()}
                                    </div>
                                  </div>
                                )}
                                
                                {assessment.gradedBy && (
                                  <div>
                                    <div className="font-medium text-gray-700 mb-1">Graded By</div>
                                    <div className="text-gray-600">{assessment.gradedBy}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                    <BookOpen
                      size={48}
                      className="mx-auto mb-4 text-gray-400"
                    />
                    <p className="text-gray-500 mb-4">
                      No assessments added yet
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAssessmentForm(true)}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 mx-auto disabled:opacity-50"
                    >
                      <Plus size={16} />
                      <span>Add First Assessment</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Advanced Options Tab */}
          {activeTab === "advanced" && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                      <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                        <Settings className="h-5 w-5 text-indigo-600" />
                      </div>
                      Advanced Options
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Manage advanced grade settings
                    </p>
                  </div>
                </div>

                {/* Lock Status */}
                <div className="mb-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      {formData.isLocked ? (
                        <Lock className="h-5 w-5 text-red-500 mr-2" />
                      ) : (
                        <Unlock className="h-5 w-5 text-green-500 mr-2" />
                      )}
                      <div>
                        <div className="font-medium text-gray-800">
                          Grade Status: {formData.isLocked ? "Locked" : "Unlocked"}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formData.isLocked 
                            ? `Locked by ${formData.lockedBy} on ${new Date(formData.lockedAt).toLocaleDateString()}`
                            : "Grade can be edited"
                          }
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        isLocked: !prev.isLocked,
                        lockedBy: !prev.isLocked ? currentUser?.id : "",
                        lockedAt: !prev.isLocked ? new Date() : null,
                        updatedBy: currentUser?.id || ""
                      }))}
                      disabled={isSubmitting}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                        formData.isLocked
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      } disabled:opacity-50`}
                    >
                      {formData.isLocked ? (
                        <>
                          <Unlock size={16} />
                          <span>Unlock</span>
                        </>
                      ) : (
                        <>
                          <Lock size={16} />
                          <span>Lock</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Moderation Status */}
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => setShowModerationOptions(!showModerationOptions)}
                    className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-indigo-500 mr-2" />
                      <div>
                        <div className="font-medium text-gray-800">
                          Moderation Status: {formData.moderationStatus}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formData.moderationStatus !== "None" 
                            ? `Moderated by ${formData.moderatedBy} on ${new Date(formData.moderatedAt).toLocaleDateString()}`
                            : "Not submitted for moderation"
                          }
                        </div>
                      </div>
                    </div>
                    {showModerationOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {showModerationOptions && (
                    <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Moderation Status
                          </label>
                          <select
                            name="moderationStatus"
                            value={formData.moderationStatus}
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white disabled:bg-gray-50"
                          >
                            {moderationStatusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Moderated By
                          </label>
                          <input
                            type="text"
                            name="moderatedBy"
                            value={formData.moderatedBy}
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white disabled:bg-gray-50"
                            placeholder="Moderator ID"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Moderation Notes
                          </label>
                          <textarea
                            name="moderationNotes"
                            value={formData.moderationNotes}
                            onChange={handleInputChange}
                            rows={3}
                            disabled={isSubmitting}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 disabled:bg-gray-50"
                            placeholder="Moderation notes..."
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Appeal Status */}
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => setShowAppealOptions(!showAppealOptions)}
                    className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <MessageSquare className="h-5 w-5 text-amber-500 mr-2" />
                      <div>
                        <div className="font-medium text-gray-800">
                          Appeal Status: {formData.appealStatus}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formData.appealStatus !== "None" 
                            ? `Decided by ${formData.appealDecidedBy} on ${new Date(formData.appealDecidedDate).toLocaleDateString()}`
                            : "No appeal submitted"
                          }
                        </div>
                      </div>
                    </div>
                    {showAppealOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {showAppealOptions && (
                    <div className="mt-4 p-4 bg-amber-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Appeal Status
                          </label>
                          <select
                            name="appealStatus"
                            value={formData.appealStatus}
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white disabled:bg-gray-50"
                          >
                            {appealStatusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Decided By
                          </label>
                          <input
                            type="text"
                            name="appealDecidedBy"
                            value={formData.appealDecidedBy}
                            onChange={handleInputChange}
                            disabled={isSubmitting}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white disabled:bg-gray-50"
                            placeholder="Decision maker ID"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Appeal Reason
                          </label>
                          <textarea
                            name="appealReason"
                            value={formData.appealReason}
                            onChange={handleInputChange}
                            rows={3}
                            disabled={isSubmitting}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 disabled:bg-gray-50"
                            placeholder="Reason for appeal..."
                          ></textarea>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Appeal Decision
                          </label>
                          <textarea
                            name="appealDecision"
                            value={formData.appealDecision}
                            onChange={handleInputChange}
                            rows={3}
                            disabled={isSubmitting}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 disabled:bg-gray-50"
                            placeholder="Appeal decision details..."
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Version History */}
                <div className="mb-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <History className="h-5 w-5 text-blue-500 mr-2" />
                      <div>
                        <div className="font-medium text-gray-800">
                          Version: {formData.version}
                        </div>
                        <div className="text-sm text-gray-600">
                          Last updated by {formData.updatedBy}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500 flex items-center">
              <Info size={14} className="mr-1" />* Required fields
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    <span>{isEditing ? "Update Grade" : "Create Grade"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GradeFormModal;