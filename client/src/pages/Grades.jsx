import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import { toast } from "react-hot-toast";

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    student: "",
    department: "",
    course: "",
    term: "",
    semester: "",
    academicYear: "",
    creditHours: "",
    assessments: [],
    finalGrade: "",
    gradePoint: "",
    resultStatus: "Pass",
    remarks: "",
  });
  const [editId, setEditId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    student: "",
    department: "",
    course: "",
    term: "",
    academicYear: "",
    resultStatus: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gradesRes, studentsRes, departmentsRes, coursesRes] = await Promise.all([
        axios.get("/grades"),
        axios.get("/students"),
        axios.get("/departments"),
        axios.get("/courses"),
      ]);

      console.log("Here is grade: ", gradesRes);
      
      setGrades(Array.isArray(gradesRes.data.grades) ? gradesRes.data.grades : []);
      setStudents(Array.isArray(studentsRes.data.students) ? studentsRes.data.students : []);
      setDepartments(Array.isArray(departmentsRes.data.data) ? departmentsRes.data.data : []);
      setCourses(Array.isArray(coursesRes.data.data) ? coursesRes.data.data : []);
    } catch (error) {
      console.error("Fetch error:", error.response?.data || error.message);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      student: "",
      department: "",
      course: "",
      term: "",
      academicYear: "",
      resultStatus: ""
    });
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  // Apply filters to grades
  const filteredGrades = grades.filter(grade => {
    return (
      (!filters.student || 
        (grade.student?.name?.toLowerCase().includes(filters.student.toLowerCase()) ||
         grade.student?._id?.toLowerCase().includes(filters.student.toLowerCase()))) &&
      (!filters.department || 
        grade.department?._id === filters.department || 
        grade.department?.name === filters.department) &&
      (!filters.course || 
        grade.course?._id === filters.course || 
        grade.course?.name === filters.course) &&
      (!filters.term || grade.term?.toLowerCase().includes(filters.term.toLowerCase())) &&
      (!filters.academicYear || grade.academicYear?.toLowerCase().includes(filters.academicYear.toLowerCase())) &&
      (!filters.resultStatus || grade.resultStatus === filters.resultStatus)
    );
  });

  // Rest of the functions remain the same...
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssessmentChange = (index, field, value) => {
    const updatedAssessments = [...formData.assessments];
    updatedAssessments[index] = {
      ...updatedAssessments[index],
      [field]: value,
    };
    setFormData((prev) => ({ ...prev, assessments: updatedAssessments }));
  };

  const addAssessment = () => {
    setFormData((prev) => ({
      ...prev,
      assessments: [
        ...prev.assessments,
        { title: "", score: "", maxScore: "", weight: "" },
      ],
    }));
  };

  const removeAssessment = (index) => {
    const updated = formData.assessments.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, assessments: updated }));
  };

  const openAddModal = () => {
    setFormData({
      student: "",
      department: "",
      course: "",
      term: "",
      semester: "",
      academicYear: "",
      creditHours: "",
      assessments: [{ title: "", score: "", maxScore: "", weight: "" }],
      finalGrade: "",
      gradePoint: "",
      resultStatus: "Incomplete",
      remarks: "",
    });
    setEditId(null);
    setModalOpen(true);
  };

  const validateAssessments = () => {
    for (const assessment of formData.assessments) {
      if (!assessment.title || !assessment.score || !assessment.maxScore || !assessment.weight) {
        toast.error("Please fill all assessment fields");
        return false;
      }
      
      const score = parseFloat(assessment.score);
      const maxScore = parseFloat(assessment.maxScore);
      const weight = parseFloat(assessment.weight);
      
      if (isNaN(score) || isNaN(maxScore) || isNaN(weight)) {
        toast.error("Assessment fields must be numbers");
        return false;
      }
      
      if (score < 0 || maxScore <= 0 || weight < 0) {
        toast.error("Invalid assessment values");
        return false;
      }
      
      if (score > maxScore) {
        toast.error("Score cannot exceed max score");
        return false;
      }
    }
    
    const totalWeight = formData.assessments.reduce((sum, a) => sum + parseFloat(a.weight), 0);
    if (totalWeight > 100) {
      toast.error("Total assessment weight cannot exceed 100%");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (
      !formData.student ||
      !formData.department ||
      !formData.course ||
      !formData.term ||
      !formData.academicYear ||
      !formData.creditHours
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    
    if (!validateAssessments()) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      const submitData = {
        ...formData,
        creditHours: parseFloat(formData.creditHours),
        gradePoint: formData.gradePoint ? parseFloat(formData.gradePoint) : null,
        assessments: formData.assessments.map(a => ({
          ...a,
          score: parseFloat(a.score),
          maxScore: parseFloat(a.maxScore),
          weight: parseFloat(a.weight)
        }))
      };
      
      if (editId) {
        await axios.put(`/grades/${editId}`, submitData);
        toast.success("Grade updated successfully");
      } else {
        await axios.post("/grades", submitData);
        toast.success("Grade added successfully");
      }
      
      setModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Save error:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || "Failed to save grade";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (grade) => {
    const assessments = grade.assessments && grade.assessments.length > 0 
      ? grade.assessments.map(a => ({
          title: a.title || "",
          score: a.score?.toString() || "",
          maxScore: a.maxScore?.toString() || "",
          weight: a.weight?.toString() || ""
        }))
      : [{ title: "", score: "", maxScore: "", weight: "" }];
    
    setFormData({
      student: grade.student?._id || "",
      department: grade.department?._id || "",
      course: grade.course?._id || "",
      term: grade.term || "",
      semester: grade.semester || "",
      academicYear: grade.academicYear || "",
      creditHours: grade.creditHours?.toString() || "",
      assessments,
      finalGrade: grade.finalGrade || "",
      gradePoint: grade.gradePoint?.toString() || "",
      resultStatus: grade.resultStatus || "Incomplete",
      remarks: grade.remarks || "",
    });
    setEditId(grade._id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this grade?")) {
      try {
        await axios.delete(`/grades/${id}`);
        toast.success("Grade deleted");
        fetchData();
      } catch (error) {
        console.error("Delete error:", error.response?.data || error.message);
        toast.error("Failed to delete grade");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pass": return "bg-green-100 text-green-800";
      case "Fail": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  const getGradeColor = (grade) => {
    if (!grade) return "text-gray-500";
    const upperGrade = grade.toUpperCase();
    if (upperGrade.startsWith("A")) return "text-green-700 font-bold";
    if (upperGrade.startsWith("B")) return "text-blue-700 font-semibold";
    if (upperGrade.startsWith("C")) return "text-yellow-700 font-semibold";
    return "text-red-700 font-semibold";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-2 rounded-lg">📊</span>
              University Grades
            </h1>
            <p className="text-gray-600 mt-2">Manage student grades and academic performance</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-300 flex items-center gap-2"
          >
            <span className="text-lg">+</span> Add Grade
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600 mr-4">
                <span className="text-xl">📈</span>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Grades</p>
                <p className="text-2xl font-bold text-gray-900">{grades.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 text-green-600 mr-4">
                <span className="text-xl">👨‍🎓</span>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Students</p>
                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 text-purple-600 mr-4">
                <span className="text-xl">🏛️</span>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Departments</p>
                <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-100 text-yellow-600 mr-4">
                <span className="text-xl">📚</span>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Courses</p>
                <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow mb-8 overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
            <div className="flex space-x-2">
              {hasActiveFilters && (
                <button 
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <span className="mr-1">×</span> Clear Filters
                </button>
              )}
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="text-gray-600 hover:text-gray-900"
              >
                {showFilters ? "Hide" : "Show"} Filters
              </button>
            </div>
          </div>
          
          {showFilters && (
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <input
                  type="text"
                  placeholder="Search by name or ID"
                  value={filters.student}
                  onChange={(e) => handleFilterChange("student", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={filters.department}
                  onChange={(e) => handleFilterChange("department", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select
                  value={filters.course}
                  onChange={(e) => handleFilterChange("course", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Courses</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                <input
                  type="text"
                  placeholder="e.g. Fall, Spring"
                  value={filters.term}
                  onChange={(e) => handleFilterChange("term", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  placeholder="e.g. 2024-2025"
                  value={filters.academicYear}
                  onChange={(e) => handleFilterChange("academicYear", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Result Status</label>
                <select
                  value={filters.resultStatus}
                  onChange={(e) => handleFilterChange("resultStatus", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                  <option value="Incomplete">Incomplete</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-700">
            Showing <span className="font-semibold">{filteredGrades.length}</span> of <span className="font-semibold">{grades.length}</span> grades
            {hasActiveFilters && <span className="text-blue-600 ml-2">(filtered)</span>}
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Grades Records</h2>
            <p className="text-gray-600 text-sm mt-1">All student grades in the system</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Term</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Academic Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600 border-opacity-50"></div>
                      </div>
                      <p className="mt-4 text-gray-600">Loading grades...</p>
                    </td>
                  </tr>
                ) : filteredGrades.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-5xl text-gray-300 mb-4">📋</span>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {hasActiveFilters ? "No grades match your filters" : "No grades found"}
                        </h3>
                        <p className="text-gray-500">
                          {hasActiveFilters 
                            ? "Try adjusting your filters" 
                            : "Add a new grade to get started"}
                        </p>
                        {!hasActiveFilters && (
                          <button
                            onClick={openAddModal}
                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Add Grade
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredGrades.map((g) => (
                    <tr key={g._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                            {g.student?.name?.charAt(0)?.toUpperCase() || 'S'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{g.student?.name || "N/A"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {g.department?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {g.course?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {g.term || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {g.academicYear || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-lg font-bold ${getGradeColor(g.finalGrade)}`}>
                          {g.finalGrade || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(g.resultStatus)}`}>
                          {g.resultStatus || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(g)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(g._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 text-white">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">
                    {editId ? "Edit Grade" : "Add New Grade"}
                  </h3>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="text-white hover:text-gray-200 text-2xl font-bold transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              {/* Modal Body */}
              <div className="overflow-y-auto flex-1 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                        <select
                          name="student"
                          value={formData.student}
                          onChange={handleInputChange}
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Student</option>
                          {students.map((s) => (
                            <option key={s._id} value={s._id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Department</option>
                          {departments.map((d) => (
                            <option key={d._id} value={d._id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
                        <select
                          name="course"
                          value={formData.course}
                          onChange={handleInputChange}
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Course</option>
                          {courses.map((c) => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Academic Details */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Academic Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Term *</label>
                        <input
                          type="text"
                          name="term"
                          value={formData.term}
                          onChange={handleInputChange}
                          placeholder="e.g. Fall, Spring"
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Semester (1-12)</label>
                        <input
                          type="number"
                          name="semester"
                          value={formData.semester}
                          onChange={handleInputChange}
                          min={1}
                          max={12}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
                        <input
                          type="text"
                          name="academicYear"
                          value={formData.academicYear}
                          onChange={handleInputChange}
                          placeholder="e.g. 2024-2025"
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Credit Hours *</label>
                        <input
                          type="number"
                          name="creditHours"
                          value={formData.creditHours}
                          onChange={handleInputChange}
                          min={0}
                          step="0.1"
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Assessments */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-800">Assessments</h4>
                      <button
                        type="button"
                        onClick={addAssessment}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        + Add Assessment
                      </button>
                    </div>
                    
                    {formData.assessments.length === 0 ? (
                      <p className="text-gray-500 italic text-center py-4">No assessments added yet</p>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-12 gap-2 font-medium text-sm text-gray-700 px-2">
                          <div className="col-span-4">Title</div>
                          <div className="col-span-2">Score</div>
                          <div className="col-span-2">Max Score</div>
                          <div className="col-span-2">Weight (%)</div>
                          <div className="col-span-2 text-center">Actions</div>
                        </div>
                        
                        {formData.assessments.map((a, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-4">
                              <input
                                type="text"
                                placeholder="Assessment title"
                                value={a.title}
                                onChange={(e) => handleAssessmentChange(idx, "title", e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                placeholder="Score"
                                value={a.score}
                                onChange={(e) => handleAssessmentChange(idx, "score", e.target.value)}
                                min={0}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                placeholder="Max"
                                value={a.maxScore}
                                onChange={(e) => handleAssessmentChange(idx, "maxScore", e.target.value)}
                                min={1}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                placeholder="Weight %"
                                value={a.weight}
                                onChange={(e) => handleAssessmentChange(idx, "weight", e.target.value)}
                                min={0}
                                max={100}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                            <div className="col-span-2 flex justify-center">
                              <button
                                type="button"
                                onClick={() => removeAssessment(idx)}
                                className="text-red-600 hover:text-red-800 font-bold text-xl transition-colors"
                                title="Remove assessment"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        <div className="text-right text-sm text-gray-600 mt-2">
                          Total Weight: {formData.assessments.reduce((sum, a) => sum + (parseFloat(a.weight) || 0), 0).toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Grade Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Grade Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Final Grade</label>
                        <input
                          type="text"
                          name="finalGrade"
                          value={formData.finalGrade}
                          onChange={handleInputChange}
                          placeholder="e.g. A+, B"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Grade Point (0 - 4)</label>
                        <input
                          type="number"
                          name="gradePoint"
                          value={formData.gradePoint}
                          onChange={handleInputChange}
                          min={0}
                          max={4}
                          step="0.01"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Result Status *</label>
                        <select
                          name="resultStatus"
                          value={formData.resultStatus}
                          onChange={handleInputChange}
                          required
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Pass">Pass</option>
                          <option value="Fail">Fail</option>
                          <option value="Incomplete">Incomplete</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                        <textarea
                          name="remarks"
                          value={formData.remarks}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="Optional remarks"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 disabled:opacity-70"
                    >
                      {submitting ? "Saving..." : (editId ? "Update Grade" : "Save Grade")}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Grades;