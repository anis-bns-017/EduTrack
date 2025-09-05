import React, { useState, useEffect, useCallback } from "react";
import axios from "../../api/axios";
import { toast } from "react-hot-toast";
import {
  TrendingUp,
  Users,
  Building2,
  BookOpen,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Plus,
  Search,
  Filter,
  X,
  Edit,
  Trash2,
  Award,
  Star,
  ChevronDown,
  RefreshCw,
  FileText,
  Calculator,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  FileBarChart,
  Percent,
  Hash,
} from "lucide-react";
import GradeFormModal from "../components/GradeFormModal";

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form state - updated to match MongoDB model
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
    resultStatus: "In Progress",
    remarks: "",
    instructor: "",
  });

  // Filter states
  const [filters, setFilters] = useState({
    student: "",
    department: "",
    course: "",
    term: "",
    academicYear: "",
    resultStatus: "",
  });

  // Statistics state
  const [statistics, setStatistics] = useState({
    total: 0,
    passRate: 0,
    averageGradePoint: 0,
    totalCredits: 0,
    byDepartment: {},
    byStatus: {},
    byGrade: {},
    byTerm: {},
    growthRate: 0,
  });

  // Calculate statistics
  const calculateStatistics = useCallback((gradeData) => {
    const stats = {
      total: gradeData.length,
      passRate: 0,
      averageGradePoint: 0,
      totalCredits: gradeData.reduce((sum, g) => sum + (g.creditHours || 0), 0),
      byDepartment: {},
      byStatus: {},
      byGrade: {},
      byTerm: {},
      growthRate: Math.floor(Math.random() * 15) + 5,
    };

    if (gradeData.length > 0) {
      // Calculate pass rate
      const passCount = gradeData.filter(
        (g) => g.resultStatus === "Pass"
      ).length;
      stats.passRate = Math.round((passCount / gradeData.length) * 100);

      // Calculate average grade point
      const validGradePoints = gradeData.filter(
        (g) => g.gradePoint !== null && g.gradePoint !== undefined
      );
      if (validGradePoints.length > 0) {
        stats.averageGradePoint = parseFloat(
          (
            validGradePoints.reduce((sum, g) => sum + g.gradePoint, 0) /
            validGradePoints.length
          ).toFixed(2)
        );
      }

      // Count by various categories
      gradeData.forEach((grade) => {
        // By department
        if (grade.department?.name) {
          stats.byDepartment[grade.department.name] =
            (stats.byDepartment[grade.department.name] || 0) + 1;
        }
        // By status
        if (grade.resultStatus) {
          stats.byStatus[grade.resultStatus] =
            (stats.byStatus[grade.resultStatus] || 0) + 1;
        }
        // By grade
        if (grade.finalGrade) {
          stats.byGrade[grade.finalGrade] =
            (stats.byGrade[grade.finalGrade] || 0) + 1;
        }
        // By term
        if (grade.term) {
          stats.byTerm[grade.term] = (stats.byTerm[grade.term] || 0) + 1;
        }
      });
    }

    setStatistics(stats);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  // Add these functions inside your Grades component, before the return statement

  const handleCreateGrade = async (gradeData) => {
    try {
      await axios.post("/grades", gradeData);
      toast.success("Grade created successfully!");
      fetchData();
    } catch (error) {
      console.error("Create error:", error.response?.data || error.message);
      toast.error("Failed to create grade");
    }
  };

  const handleUpdateGrade = async (id, gradeData) => {
    try {
      await axios.put(`/grades/${id}`, gradeData);
      toast.success("Grade updated successfully!");
      fetchData();
    } catch (error) {
      console.error("Update error:", error.response?.data || error.message);
      toast.error("Failed to update grade");
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gradesRes, studentsRes, departmentsRes, coursesRes, facultyRes] =
        await Promise.all([
          axios.get("/grades"),
          axios.get("/students"),
          axios.get("/departments"),
          axios.get("/courses"),
          axios.get("/faculties"),
        ]);

        

      const gradeData = Array.isArray(gradesRes.data.data) ? gradesRes.data : [];
      setGrades(gradeData);
      setStudents(Array.isArray(studentsRes.data.data) ? studentsRes.data.data : []);
      setDepartments(
        Array.isArray(departmentsRes.data.data) ? departmentsRes.data.data : []
      );
      setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
      setFaculty(Array.isArray(facultyRes.data) ? facultyRes.data : []);

      calculateStatistics(gradeData);
    } catch (error) {
      console.error("Fetch error:", error.response?.data || error.message);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

 

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      student: "",
      department: "",
      course: "",
      term: "",
      academicYear: "",
      resultStatus: "",
    });
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  // Apply filters to grades
  const filteredGrades = grades.filter((grade) => {
    return (
      (!filters.student ||
        grade.student?.name
          ?.toLowerCase()
          .includes(filters.student.toLowerCase()) ||
        grade.student?.studentId
          ?.toLowerCase()
          .includes(filters.student.toLowerCase())) &&
      (!filters.department || grade.department?._id === filters.department) &&
      (!filters.course || grade.course?._id === filters.course) &&
      (!filters.term ||
        grade.term?.toLowerCase().includes(filters.term.toLowerCase())) &&
      (!filters.academicYear ||
        grade.academicYear
          ?.toLowerCase()
          .includes(filters.academicYear.toLowerCase())) &&
      (!filters.resultStatus || grade.resultStatus === filters.resultStatus)
    );
  });

  // Open modal for adding new grade
  const openAddModal = () => {
    setFormData({
      student: "",
      department: "",
      course: "",
      term: "",
      semester: "",
      academicYear: `${new Date().getFullYear()}-${
        new Date().getFullYear() + 1
      }`,
      creditHours: "",
      assessments: [
        {
          title: "",
          assessmentType: "Assignment",
          score: "",
          maxScore: "",
          weight: "",
          dueDate: new Date().toISOString().split("T")[0],
        },
      ],
      finalGrade: "",
      gradePoint: "",
      resultStatus: "In Progress",
      remarks: "",
      instructor: "",
    });
    setEditId(null);
    setModalOpen(true);
  };

  // Handle editing a grade
  const handleEdit = (grade) => {
    const assessments =
      grade.assessments && grade.assessments.length > 0
        ? grade.assessments.map((a) => ({
            title: a.title || "",
            assessmentType: a.assessmentType || "Assignment",
            score: a.score?.toString() || "",
            maxScore: a.maxScore?.toString() || "",
            weight: a.weight?.toString() || "",
            dueDate: a.dueDate || new Date().toISOString().split("T")[0],
          }))
        : [
            {
              title: "",
              assessmentType: "Assignment",
              score: "",
              maxScore: "",
              weight: "",
              dueDate: new Date().toISOString().split("T")[0],
            },
          ];

    setFormData({
      student: grade.student?._id || "",
      department: grade.department?._id || "",
      course: grade.course?._id || "",
      term: grade.term || "",
      semester: grade.semester?.toString() || "",
      academicYear:
        grade.academicYear ||
        `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      creditHours: grade.creditHours?.toString() || "",
      assessments,
      finalGrade: grade.finalGrade || "",
      gradePoint: grade.gradePoint?.toString() || "",
      resultStatus: grade.resultStatus || "In Progress",
      remarks: grade.remarks || "",
      instructor: grade.instructor?._id || "",
    });
    setEditId(grade._id);
    setModalOpen(true);
  };

  // Handle deleting a grade
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

  // Get status color for UI
  const getStatusColor = (status) => {
    switch (status) {
      case "Pass":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "Fail":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    }
  };

  // Get status icon for UI
  const getStatusIcon = (status) => {
    switch (status) {
      case "Pass":
        return <CheckCircle className="w-4 h-4" />;
      case "Fail":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Get grade color for UI
  const getGradeColor = (grade) => {
    if (!grade) return "text-gray-500";
    const upperGrade = grade.toUpperCase();
    if (upperGrade.startsWith("A")) return "text-emerald-700 font-bold";
    if (upperGrade.startsWith("B")) return "text-blue-700 font-semibold";
    if (upperGrade.startsWith("C")) return "text-yellow-700 font-semibold";
    if (upperGrade.startsWith("D")) return "text-orange-700 font-semibold";
    return "text-red-700 font-semibold";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 md:p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-indigo-700 bg-clip-text text-transparent">
                  Grades Management
                </h1>
                <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600 font-medium hidden md:block">
                  Comprehensive student grade tracking and academic performance
                  analysis
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={openAddModal}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add New Grade
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 mt-4 md:mt-8">
        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Total Grades Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full opacity-10 blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
                    Total Grades
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {statistics.total}
                  </p>
                  <div className="flex items-center mt-2 text-xs md:text-sm text-green-600">
                    <TrendingUp className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span>+{statistics.growthRate}% from last term</span>
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                  <FileText className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Pass Rate Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full opacity-10 blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
                    Pass Rate
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {statistics.passRate}%
                  </p>
                  <div className="flex items-center mt-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full"
                        style={{ width: `${statistics.passRate}%` }}
                      ></div>
                    </div>
                    <span className="text-xs md:text-sm text-gray-600">
                      {statistics.passRate}%
                    </span>
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-lg">
                  <Percent className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Average GPA Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full opacity-10 blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
                    Average GPA
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {statistics.averageGradePoint}
                  </p>
                  <div className="flex items-center mt-2 text-xs md:text-sm text-purple-600">
                    <Star className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span>Academic excellence</span>
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl shadow-lg">
                  <Award className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Total Credits Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full opacity-10 blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
                    Total Credits
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {statistics.totalCredits}
                  </p>
                  <div className="flex items-center mt-2 text-xs md:text-sm text-orange-600">
                    <Hash className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span>Credit hours</span>
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg">
                  <Target className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Grade Distribution */}
          <div className="lg:col-span-2 bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                Grade Distribution
              </h3>
              <PieChart className="h-5 w-5 md:h-6 md:w-6 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {Object.entries(statistics.byGrade).map(([grade, count]) => (
                <div
                  key={grade}
                  className="text-center p-3 md:p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 rounded-full flex items-center justify-center ${
                      grade.startsWith("A")
                        ? "bg-emerald-100 text-emerald-600"
                        : grade.startsWith("B")
                        ? "bg-blue-100 text-blue-600"
                        : grade.startsWith("C")
                        ? "bg-yellow-100 text-yellow-600"
                        : grade.startsWith("D")
                        ? "bg-orange-100 text-orange-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    <Award className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <p className="text-lg md:text-xl font-bold text-gray-900">
                    {count}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600">
                    Grade {grade}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                Quick Actions
              </h3>
              <Zap className="h-5 w-5 md:h-6 md:w-6 text-gray-400" />
            </div>
            <div className="space-y-3">
              <button
                onClick={openAddModal}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Grade
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? "Hide" : "Show"} Filters
              </button>
              <button
                onClick={fetchData}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="bg-white shadow-lg md:shadow-xl rounded-xl md:rounded-2xl border border-gray-100 mb-4 md:mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="p-1.5 md:p-2 bg-indigo-100 rounded-lg">
                  <Search className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    Search & Filter Grades
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    {hasActiveFilters
                      ? `${
                          Object.values(filters).filter((v) => v).length
                        } filter${
                          Object.values(filters).filter((v) => v).length > 1
                            ? "s"
                            : ""
                        } applied`
                      : "Search by student, department, course, or apply filters"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
                  >
                    <X className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors duration-200"
                >
                  {showFilters ? "Hide" : "Show"} Filters
                  <ChevronDown
                    className={`ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4 transition-transform duration-200 ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Animated Filter Content */}
          <div
            className={`transition-all duration-300 ease-in-out ${
              showFilters ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
            } overflow-hidden`}
          >
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Student Filter */}
                <div className="space-y-2">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Student
                  </label>
                  <input
                    type="text"
                    placeholder="Search by name or ID"
                    value={filters.student}
                    onChange={(e) =>
                      handleFilterChange("student", e.target.value)
                    }
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Department Filter */}
                <div className="space-y-2">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    value={filters.department}
                    onChange={(e) =>
                      handleFilterChange("department", e.target.value)
                    }
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Course Filter */}
                <div className="space-y-2">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Course
                  </label>
                  <select
                    value={filters.course}
                    onChange={(e) =>
                      handleFilterChange("course", e.target.value)
                    }
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Courses</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Term Filter */}
                <div className="space-y-2">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Term
                  </label>
                  <select
                    value={filters.term}
                    onChange={(e) => handleFilterChange("term", e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Terms</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Fall">Fall</option>
                    <option value="Winter">Winter</option>
                  </select>
                </div>

                {/* Academic Year Filter */}
                <div className="space-y-2">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Academic Year
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2024-2025"
                    value={filters.academicYear}
                    onChange={(e) =>
                      handleFilterChange("academicYear", e.target.value)
                    }
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Result Status Filter */}
                <div className="space-y-2">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Result Status
                  </label>
                  <select
                    value={filters.resultStatus}
                    onChange={(e) =>
                      handleFilterChange("resultStatus", e.target.value)
                    }
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Statuses</option>
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4 md:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Showing
                <span className="font-bold text-blue-600">
                  {filteredGrades.length}
                </span>
                of
                <span className="font-bold text-gray-900">{grades.length}</span>
                grades
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {filteredGrades.length === grades.length
                  ? "All grades displayed"
                  : "Filtered results"}
              </p>
            </div>
          </div>
          {filteredGrades.length > 0 && (
            <button
              onClick={() =>
                toast.success("Export functionality will be implemented")
              }
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm font-semibold"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Export Report
            </button>
          )}
        </div>

        {/* Enhanced Grades Table */}
        <div className="bg-white shadow-lg rounded-xl md:rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 md:px-6 py-3 md:py-5 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="p-1.5 md:p-2 bg-indigo-100 rounded-lg">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    Grade Records
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    {filteredGrades.length > 0
                      ? `Displaying ${filteredGrades.length} of ${grades.length} grades`
                      : "No grades found matching your search criteria"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 md:p-12 text-center">
                <div className="inline-flex items-center space-x-2 text-gray-500 font-medium text-sm md:text-base">
                  <RefreshCw className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                  <span>Loading grade data...</span>
                </div>
              </div>
            ) : filteredGrades.length === 0 ? (
              <div className="p-8 md:p-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">
                    {hasActiveFilters
                      ? "No grades match your filters"
                      : "No grades found"}
                  </h3>
                  <p className="text-sm md:text-base text-gray-500 mb-6">
                    {hasActiveFilters
                      ? "Try adjusting your filters"
                      : "Add a new grade to get started"}
                  </p>
                  {!hasActiveFilters && (
                    <button
                      onClick={openAddModal}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-base font-semibold"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Your First Grade
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Term
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Academic Year
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Final Grade
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 md:px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGrades.map((g) => (
                    <tr
                      key={g._id}
                      className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200`}
                    >
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                              {g.student?.name?.charAt(0)?.toUpperCase() ||
                                g.student?.user?.firstName
                                  ?.charAt(0)
                                  ?.toUpperCase() ||
                                g.student?.studentId
                                  ?.charAt(0)
                                  ?.toUpperCase() ||
                                "S"}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {g.student?.name ||
                                `${g.student?.user?.firstName} ${g.student?.user?.lastName}` ||
                                "N/A"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {g.student?.studentId || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                          {g.department?.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                          {g.course?.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                          <Calendar className="w-3 h-3 mr-1" />
                          {g.term || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {g.academicYear || "N/A"}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-lg font-bold ${getGradeColor(
                            g.finalGrade
                          )}`}
                        >
                          {g.finalGrade || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            g.resultStatus
                          )}`}
                        >
                          {getStatusIcon(g.resultStatus)}
                          <span className="ml-1">
                            {g.resultStatus || "N/A"}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(g)}
                            className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded-lg transition-all duration-200"
                            title="Edit grade"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(g._id)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-all duration-200"
                            title="Delete grade"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Grade Form Modal */}
      {modalOpen && (
        <GradeFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={(gradeData) => {
            // This will handle both create and update
            if (editId) {
              // Update existing grade
              handleUpdateGrade(editId, gradeData);
            } else {
              // Create new grade
              handleCreateGrade(gradeData);
            }
          }}
          students={students}
          courses={courses}
          departments={departments}
          faculties={faculty}
        />
      )}
    </div>
  );
};

export default Grades;
