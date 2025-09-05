import React, { useState, useEffect } from "react";
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
  Edit,
  Save,
  Eye,
  Info,
  Award,
} from "lucide-react";

const GradeFormModal = ({
  open,
  onClose,
  onSave,
  initialData,
  students = [],
  courses = [],
  departments = [],
  faculties = [],
}) => {
  const isEditing = !!initialData;
  const [formData, setFormData] = useState({
    student: "",
    department: "",
    program: "",
    course: "",
    section: "",
    instructor: "",
    term: "",
    year: "", 
    semester: "",
    academicYear: "",
    creditHours: 0,
    isAudit: false,
    isRepeat: false,
    previousGrade: "",
    remarks: "",
    assessments: [],
  });

  const [newAssessment, setNewAssessment] = useState({
    title: "",
    description: "",
    assessmentType: "Assignment",
    score: 0,
    maxScore: 100,
    weight: 0,
    dueDate: "",
    submittedDate: "",
    gradedDate: "",
    grader: "",
    feedback: "",
    isAbsent: false,
    isExcused: false,
    status: "Pending",
  });

  const [errors, setErrors] = useState({});
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [hoveredAssessment, setHoveredAssessment] = useState(null);

  const programs = [
    "Undergraduate",
    "Graduate",
    "PhD",
    "Diploma",
    "Certificate",
  ];
  const sections = ["Section A", "Section B", "Section C", "Section D"];

  // Calculate final grade based on assessments
  const calculateFinalGrade = () => {
    if (formData.assessments.length === 0) return 0;

    const totalWeight = formData.assessments.reduce(
      (sum, assessment) => sum + assessment.weight,
      0
    );
    if (totalWeight === 0) return 0;

    const weightedScore = formData.assessments.reduce((sum, assessment) => {
      const percentage =
        assessment.maxScore > 0 ? assessment.score / assessment.maxScore : 0;
      return sum + percentage * assessment.weight;
    }, 0);

    return Math.round((weightedScore / totalWeight) * 100);
  };

  const finalGrade = calculateFinalGrade();
  const totalWeight = formData.assessments.reduce(
    (sum, assessment) => sum + assessment.weight,
    0
  );

  // Get letter grade
  // Get letter grade based on percentage
  const getLetterGrade = (percentage) => {
    if (percentage >= 80) return "A+";
    if (percentage >= 75) return "A";
    if (percentage >= 70) return "A-";
    if (percentage >= 65) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 55) return "B-";
    if (percentage >= 50) return "C+";
    if (percentage >= 45) return "C";
    if (percentage >= 40) return "D";
    return "F";
  };

  // Get grade color based on percentage
  const getGradeColor = (percentage) => {
    if (percentage >= 80)
      return "bg-gradient-to-r from-green-500 to-emerald-500";
    if (percentage >= 70) return "bg-gradient-to-r from-blue-500 to-cyan-500";
    if (percentage >= 60)
      return "bg-gradient-to-r from-yellow-500 to-amber-500";
    if (percentage >= 50)
      return "bg-gradient-to-r from-orange-500 to-yellow-500";
    return "bg-gradient-to-r from-red-500 to-rose-500";
  };

  // Get grade text color based on percentage
  const getGradeTextColor = (percentage) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 70) return "text-blue-600";
    if (percentage >= 60) return "text-yellow-600";
    if (percentage >= 50) return "text-orange-600";
    return "text-red-600";
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        student: initialData.student || "",
        department: initialData.department || "",
        program: initialData.program || "",
        course: initialData.course || "",
        section: initialData.section || "",
        instructor: initialData.instructor || "",
        term: initialData.term || "",
        year: initialData.year || "",
        semester: initialData.semester || "",
        academicYear: initialData.academicYear || "",
        creditHours: initialData.creditHours || 0,
        isAudit: initialData.isAudit || false,
        isRepeat: initialData.isRepeat || false,
        previousGrade: initialData.previousGrade || "",
        remarks: initialData.remarks || "",
        assessments: initialData.assessments || [],
      });
    } else {
      // Reset form when creating a new grade
      setFormData({
        student: "",
        department: "",
        program: "",
        course: "",
        section: "",
        instructor: "",
        term: "",
        semester: "",
        academicYear: "",
        creditHours: 0,
        isAudit: false,
        isRepeat: false,
        previousGrade: "",
        remarks: "",
        assessments: [],
      });
    }
  }, [initialData, open]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAssessmentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAssessment((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddAssessment = () => {
    if (!newAssessment.title || !newAssessment.assessmentType) {
      setErrors({ assessment: "Title and type are required" });
      return;
    }

    if (newAssessment.score > newAssessment.maxScore) {
      setErrors({ assessment: "Score cannot be greater than max score" });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      assessments: [...prev.assessments, { ...newAssessment }],
    }));

    setNewAssessment({
      title: "",
      description: "",
      assessmentType: "Assignment",
      score: 0,
      maxScore: 100,
      weight: 0,
      dueDate: "",
      submittedDate: "",
      gradedDate: "",
      grader: "",
      feedback: "",
      isAbsent: false,
      isExcused: false,
      status: "Pending",
    });

    setShowAssessmentForm(false);
    setErrors({});
  };

  const handleRemoveAssessment = (index) => {
    setFormData((prev) => ({
      ...prev,
      assessments: prev.assessments.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.student) newErrors.student = "Student is required";
    if (!formData.course) newErrors.course = "Course is required";
    if (!formData.instructor) newErrors.instructor = "Instructor is required";
    if (!formData.term) newErrors.term = "Term is required";
    if (!formData.academicYear)
      newErrors.academicYear = "Academic year is required";
    if (!formData.creditHours || formData.creditHours <= 0)
      newErrors.creditHours = "Valid credit hours are required";

    // Validate assessments
    formData.assessments.forEach((assessment, index) => {
      if (assessment.score > assessment.maxScore) {
        newErrors[
          `assessment-${index}`
        ] = `Score cannot exceed max score in ${assessment.title}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSave(formData);
  };

  if (!open) return null;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-indigo-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <BookOpen className="h-6 w-6" />
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
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setActiveTab("basic")}
            className={`flex-1 py-4 px-6 text-center font-medium transition-all duration-200 ${
              activeTab === "basic"
                ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
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
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student *
                    </label>
                    <select
                      name="student"
                      value={formData.student}
                      onChange={handleInputChange}
                      disabled={isEditing}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                    >
                      <option value="">Select Student</option>
                      {students.map((student) => (
                        <option key={student._id} value={student._id}>
                          {student.name}
                        </option>
                      ))}
                    </select>
                    {errors.student && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.student}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course *
                    </label>
                    <select
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                    >
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.code} - {course.name}
                        </option>
                      ))}
                    </select>
                    {errors.course && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.course}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructor *
                    </label>
                    <select
                      name="instructor"
                      value={formData.instructor}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                    >
                      <option value="">Select Instructor</option>
                      {faculties.map((faculty) => (
                        <option key={faculty._id} value={faculty._id}>
                          {faculty.name}
                        </option>
                      ))}
                    </select>
                    {errors.instructor && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.instructor}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Program
                    </label>
                    <select
                      name="program"
                      value={formData.program}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                    >
                      <option value="">Select Program</option>
                      {programs &&
                        programs.map((program) => (
                          <option key={program} value={program}>
                            {program}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section
                    </label>
                    <select
                      name="section"
                      value={sections}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                    >
                      <option value="">Select Section</option>
                      {sections &&
                        sections.map((section) => (
                          <option key={section} value={section}>
                            {section}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Term *
                    </label>
                    <input
                      type="text"
                      name="term"
                      value={formData.term}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="e.g., Fall 2023"
                    />
                    {errors.term && (
                      <p className="text-red-500 text-xs mt-1">{errors.term}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Academic Year *
                    </label>
                    <input
                      type="text"
                      name="academicYear"
                      value={formData.academicYear}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="e.g., 2023-2024"
                    />
                    {errors.academicYear && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.academicYear}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      min="1"
                      max="5"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Semester
                    </label>
                    <input
                      type="number"
                      name="semester"
                      value={formData.semester}
                      onChange={handleInputChange}
                      min="1"
                      max="12"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Credit Hours *
                    </label>
                    <input
                      type="number"
                      name="creditHours"
                      value={formData.creditHours}
                      onChange={handleInputChange}
                      min="0"
                      step="0.5"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                    {errors.creditHours && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.creditHours}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 mt-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isAudit"
                      name="isAudit"
                      checked={formData.isAudit}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
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
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isRepeat"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Repeat Course
                    </label>
                  </div>
                </div>

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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      placeholder="Previous grade ID"
                    />
                  </div>
                )}

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
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
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-md"
                  >
                    <Plus size={16} />
                    <span>Add Assessment</span>
                  </button>
                </div>

                {/* Grade Summary */}
                {formData.assessments.length > 0 && (
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-5 text-white mb-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-white bg-opacity-20 p-3 rounded-full">
                          <Calculator className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="text-sm opacity-80">Final Grade</div>
                          <div className="flex items-center space-x-3">
                            <span className="text-3xl font-bold">
                              {finalGrade}%
                            </span>
                            <span className="text-xl font-semibold">
                              ({getLetterGrade(finalGrade)})
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm opacity-80">Total Weight</div>
                        <div className="text-2xl font-bold">{totalWeight}%</div>
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
                          className={`h-3 rounded-full ${getGradeColor(
                            finalGrade
                          )}`}
                          style={{ width: `${finalGrade}%` }}
                        ></div>
                      </div>
                    </div>
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
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                          placeholder="Assessment title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type *
                        </label>
                        <select
                          name="assessmentType"
                          value={newAssessment.assessmentType}
                          onChange={handleAssessmentChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                        >
                          {assessmentTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          name="status"
                          value={newAssessment.status}
                          onChange={handleAssessmentChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
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
                          min="0"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                        />
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
                          min="1"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                        />
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
                          min="0"
                          max="100"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                        />
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
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
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
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                          placeholder="Assessment description..."
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
                            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
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
                            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
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

                    {errors.assessment && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                        <AlertCircle size={16} className="text-red-500 mr-2" />
                        <p className="text-red-700 text-sm">
                          {errors.assessment}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end mt-6 space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowAssessmentForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddAssessment}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
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
                      const percentage =
                        assessment.maxScore > 0
                          ? Math.round(
                              (assessment.score / assessment.maxScore) * 100
                            )
                          : 0;
                      const weighted =
                        assessment.maxScore > 0
                          ? Math.round(
                              (assessment.score / assessment.maxScore) *
                                assessment.weight
                            )
                          : 0;

                      return (
                        <div
                          key={index}
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
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {assessment.status}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <div className="text-xs text-gray-500">
                                    Score
                                  </div>
                                  <div className="font-bold text-gray-800">
                                    {assessment.score}/{assessment.maxScore}
                                  </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <div className="text-xs text-gray-500">
                                    Weight
                                  </div>
                                  <div className="font-bold text-gray-800">
                                    {assessment.weight}%
                                  </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <div className="text-xs text-gray-500">
                                    Percentage
                                  </div>
                                  <div
                                    className={`font-bold ${getGradeTextColor(
                                      percentage
                                    )}`}
                                  >
                                    {percentage}%
                                  </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <div className="text-xs text-gray-500">
                                    Weighted
                                  </div>
                                  <div
                                    className={`font-bold ${getGradeTextColor(
                                      weighted
                                    )}`}
                                  >
                                    {weighted}%
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

                            <button
                              type="button"
                              onClick={() => handleRemoveAssessment(index)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
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
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 mx-auto"
                    >
                      <Plus size={16} />
                      <span>Add First Assessment</span>
                    </button>
                  </div>
                )}
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
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-md"
              >
                <CheckCircle size={16} />
                <span>{isEditing ? "Update Grade" : "Create Grade"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GradeFormModal;
