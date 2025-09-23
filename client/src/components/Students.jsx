import React, { useState, useEffect, useCallback } from "react";
import StudentFormModal from "../components/StudentFormModal";
import axios from "../../api/axios";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import facultyList from "../helper/Faculties";
import {
  Plus,
  Search,
  Filter,
  X,
  Download,
  Frown,
  Eye,
  Edit,
  Trash2,
  Users,
  UserCheck,
  TrendingUp,
  Building2,
  ChevronDown,
  Star,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Award,
  Clock,
  BookOpen,
  ShieldAlert,
} from "lucide-react";
import StudentDetailsModal from "./StudentDetailsModal";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedStudentForDetails, setSelectedStudentForDetails] =
    useState(null);
  const [departments, setDepartments] = useState([]);
  const [facultyAdvisors, setFacultyAdvisors] = useState([]);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    program: "",
    programType: "",
    department: "",
    gender: "",
    status: "Active",
    yearOfStudy: "",
    semester: "",
    academicStanding: "",
    minGPA: "",
    maxGPA: "",
    hasFinancialAid: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Statistics state
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    averageGPA: 0,
    departments: 0,
    byProgram: {},
    byStatus: {},
    byYear: {},
    byGender: {},
    growthRate: 0,
    totalCredits: 0,
  });

  // Calculate statistics
  const calculateStatistics = useCallback((studentData) => {
    const stats = {
      total: studentData.length,
      active: studentData.filter((s) => s.status === "Active").length,
      averageGPA:
        studentData.length > 0
          ? studentData.reduce((sum, s) => sum + (s.gpa || 0), 0) /
            studentData.length
          : 0,
      departments: new Set(
        studentData
          .map((s) => s.department?.name || s.department)
          .filter(Boolean)
      ).size,
      totalCredits: studentData.reduce(
        (sum, s) => sum + (s.totalCreditsEarned || 0),
        0
      ),
      byProgram: {},
      byStatus: {},
      byYear: {},
      byGender: {},
      growthRate: Math.floor(Math.random() * 20) + 8, // Mock growth rate
    };

    // Count by various categories
    studentData.forEach((student) => {
      // By program
      if (student.program) {
        stats.byProgram[student.program] =
          (stats.byProgram[student.program] || 0) + 1;
      }
      // By status
      if (student.status) {
        stats.byStatus[student.status] =
          (stats.byStatus[student.status] || 0) + 1;
      }
      // By year
      if (student.yearOfStudy) {
        stats.byYear[student.yearOfStudy] =
          (stats.byYear[student.yearOfStudy] || 0) + 1;
      }
      // By gender
      if (student.gender) {
        stats.byGender[student.gender] =
          (stats.byGender[student.gender] || 0) + 1;
      }
    });

    setStatistics(stats);
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [studentsRes, deptsRes] = await Promise.all([
          axios.get("/students?limit=1000"),
          axios.get("/departments"),
        ]);
        const studentData = studentsRes.data.data || [];
        setStudents(studentData);
        setFilteredStudents(studentData);
        setDepartments(deptsRes.data.data || []);
        setFacultyAdvisors(facultyList);
        calculateStatistics(studentData);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [calculateStatistics]);

  // Apply filters
  useEffect(() => {
    let result = [...students];

    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(term) ||
          s.email?.toLowerCase().includes(term) ||
          s.studentId?.toLowerCase().includes(term) ||
          s.rollNumber?.toLowerCase().includes(term)
      );
    }

    // Apply each filter
    Object.entries(filters).forEach(([key, value]) => {
      if (!value) return;
      switch (key) {
        case "department":
          result = result.filter(
            (s) => s.department?._id === value || s.department === value
          );
          break;
        case "facultyAdvisor":
          result = result.filter(
            (s) => s.facultyAdvisor?._id === value || s.facultyAdvisor === value
          );
          break;
        case "minGPA":
          result = result.filter((s) => s.gpa >= parseFloat(value));
          break;
        case "maxGPA":
          result = result.filter((s) => s.gpa <= parseFloat(value));
          break;
        case "hasFinancialAid":
          result = result.filter(
            (s) => s.financialInformation?.financialAid === (value === "true")
          );
          break;
        default:
          result = result.filter((s) => s[key] === value);
      }
    });

    setFilteredStudents(result);
  }, [searchTerm, filters, students]);

  // Calculate active filters count
  useEffect(() => {
    const count =
      Object.values(filters).filter(
        (value) => value !== "" && value !== null && value !== undefined
      ).length + (searchTerm ? 1 : 0);
    setActiveFiltersCount(count);
  }, [filters, searchTerm]);

  const handleAddClick = () => {
    setEditStudent(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (student) => {
    setEditStudent(student);
    setIsModalOpen(true);
  };

  const handleViewDetails = (student) => {
    setSelectedStudentForDetails(student);
    setDetailsModalOpen(true);
  };

  const handleSaveStudent = async (studentData) => {
    try {
      let res;
      if (editStudent) {
        res = await axios.put(`/students/${editStudent._id}`, studentData);
        setStudents((prev) =>
          prev.map((s) => (s._id === editStudent._id ? res.data.data : s))
        );
        toast.success("Student updated successfully");
      } else {
        res = await axios.post("/students", studentData);
        setStudents((prev) => [...prev, res.data.data]);
        toast.success("Student added successfully");
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving student");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;
    try {
      await axios.delete(`/students/${id}`);
      setStudents((prev) => prev.filter((s) => s._id !== id));
      toast.success("Student deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting student");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({
      program: "",
      programType: "",
      department: "",
      gender: "",
      status: "",
      yearOfStudy: "",
      semester: "",
      academicStanding: "",
      minGPA: "",
      maxGPA: "",
      hasFinancialAid: "",
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Extract unique values for filters
  const uniqueValues = (field) => [
    ...new Set(students.map((s) => s[field]).filter(Boolean)),
  ];

  const statusOptions = [
    "Active",
    "Inactive",
    "Graduated",
    "Transferred",
    "Suspended",
    "On Leave",
  ];

  const programTypeOptions = [
    "Undergraduate",
    "Graduate",
    "PhD",
    "Diploma",
    "Certificate",
  ];

  const academicStandingOptions = ["Good", "Probation", "Warning", "Suspended"];

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gradient-to-r from-indigo-500 to-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading students...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center max-w-md">
          import {ShieldAlert} from "lucide-react";
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <ShieldAlert className="h-10 w-10 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Students
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 md:p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <Users className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-indigo-700 bg-clip-text text-transparent">
                  Student Management
                </h1>
                <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600 font-medium hidden md:block">
                  Comprehensive student information and academic tracking system
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={handleAddClick}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add New Student
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-3 sm:px-4 lg:px-6 mt-4 md:mt-8">
        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Total Students Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full opacity-10 blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
                    Total Students
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {statistics.total}
                  </p>
                  <div className="flex items-center mt-2 text-xs md:text-sm text-green-600">
                    <TrendingUp className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span>+{statistics.growthRate}% from last semester</span>
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                  <Users className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Students Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full opacity-10 blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
                    Active Students
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {statistics.active}
                  </p>
                  <div className="flex items-center mt-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (statistics.active / statistics.total) * 100 || 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs md:text-sm text-gray-600">
                      {Math.round(
                        (statistics.active / statistics.total) * 100 || 0
                      )}
                      %
                    </span>
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-lg">
                  <UserCheck className="h-6 w-6 md:h-8 md:w-8 text-white" />
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
                    {statistics.averageGPA.toFixed(2)}
                  </p>
                  <div className="flex items-center mt-2 text-xs md:text-sm text-purple-600">
                    <Award className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span>Academic excellence</span>
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl shadow-lg">
                  <GraduationCap className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Departments Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full opacity-10 blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
                    Departments
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {statistics.departments}
                  </p>
                  <div className="flex items-center mt-2 text-xs md:text-sm text-orange-600">
                    <Building2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span>Academic units</span>
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg">
                  <Target className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Status Distribution */}
          <div className="lg:col-span-2 bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                Status Distribution
              </h3>
              <PieChart className="h-5 w-5 md:h-6 md:w-6 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              {Object.entries(statistics.byStatus).map(([status, count]) => (
                <div
                  key={status}
                  className="text-center p-3 md:p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 rounded-full flex items-center justify-center ${
                      status === "Active"
                        ? "bg-emerald-100 text-emerald-600"
                        : status === "Inactive"
                        ? "bg-gray-100 text-gray-600"
                        : status === "Graduated"
                        ? "bg-blue-100 text-blue-600"
                        : status === "Transferred"
                        ? "bg-purple-100 text-purple-600"
                        : status === "Suspended"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    <Users className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <p className="text-lg md:text-xl font-bold text-gray-900">
                    {count}
                  </p>
                  <p className="text-xs md:text-sm text-gray-600">{status}</p>
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
                onClick={handleAddClick}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Student
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? "Hide" : "Show"} Filters
              </button>
              <button className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg">
                <Download className="h-4 w-4 mr-2" />
                Export Data
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
                    Search & Filter Students
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    {activeFiltersCount > 0
                      ? `${activeFiltersCount} filter${
                          activeFiltersCount > 1 ? "s" : ""
                        } applied`
                      : "Search by name, ID, email, or apply filters"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3">
                {activeFiltersCount > 0 && (
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

          {/* Animated Search Content */}
          <div
            className={`transition-all duration-300 ease-in-out ${
              showFilters ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
            } overflow-hidden`}
          >
            <div className="p-4 md:p-6">
              {/* Search Bar */}
              <div className="relative max-w-3xl mx-auto mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search students by name, ID, email, or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-10 md:pl-12 md:pr-16 py-3 md:py-4 text-base md:text-lg border-2 border-gray-200 rounded-xl md:rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-4 w-4 md:h-5 md:w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              {/* Filter Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {/* Program Filter */}
                <div className="space-y-2">
                  <label
                    htmlFor="program"
                    className="block text-xs md:text-sm font-semibold text-gray-700"
                  >
                    Program
                  </label>
                  <select
                    id="program"
                    name="program"
                    value={filters.program}
                    onChange={handleFilterChange}
                    className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="">All Programs</option>
                    {uniqueValues("program").map((program) => (
                      <option key={program} value={program}>
                        {program}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Program Type Filter */}
                <div className="space-y-2">
                  <label
                    htmlFor="programType"
                    className="block text-xs md:text-sm font-semibold text-gray-700"
                  >
                    Program Type
                  </label>
                  <select
                    id="programType"
                    name="programType"
                    value={filters.programType}
                    onChange={handleFilterChange}
                    className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="">All Types</option>
                    {programTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department Filter */}
                <div className="space-y-2">
                  <label
                    htmlFor="department"
                    className="block text-xs md:text-sm font-semibold text-gray-700"
                  >
                    Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={filters.department}
                    onChange={handleFilterChange}
                    className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label
                    htmlFor="status"
                    className="block text-xs md:text-sm font-semibold text-gray-700"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="">All Statuses</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year of Study Filter */}
                <div className="space-y-2">
                  <label
                    htmlFor="yearOfStudy"
                    className="block text-xs md:text-sm font-semibold text-gray-700"
                  >
                    Year of Study
                  </label>
                  <select
                    id="yearOfStudy"
                    name="yearOfStudy"
                    value={filters.yearOfStudy}
                    onChange={handleFilterChange}
                    className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="">All Years</option>
                    {[1, 2, 3, 4, 5, 6].map((year) => (
                      <option key={year} value={year}>
                        Year {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Academic Standing Filter */}
                <div className="space-y-2">
                  <label
                    htmlFor="academicStanding"
                    className="block text-xs md:text-sm font-semibold text-gray-700"
                  >
                    Academic Standing
                  </label>
                  <select
                    id="academicStanding"
                    name="academicStanding"
                    value={filters.academicStanding}
                    onChange={handleFilterChange}
                    className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                  >
                    <option value="">All Standings</option>
                    {academicStandingOptions.map((standing) => (
                      <option key={standing} value={standing}>
                        {standing}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min GPA Filter */}
                <div className="space-y-2">
                  <label
                    htmlFor="minGPA"
                    className="block text-xs md:text-sm font-semibold text-gray-700"
                  >
                    Min GPA
                  </label>
                  <input
                    type="number"
                    id="minGPA"
                    name="minGPA"
                    min="0"
                    max="4"
                    step="0.01"
                    placeholder="0.00"
                    value={filters.minGPA}
                    onChange={handleFilterChange}
                    className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Max GPA Filter */}
                <div className="space-y-2">
                  <label
                    htmlFor="maxGPA"
                    className="block text-xs md:text-sm font-semibold text-gray-700"
                  >
                    Max GPA
                  </label>
                  <input
                    type="number"
                    id="maxGPA"
                    name="maxGPA"
                    min="0"
                    max="4"
                    step="0.01"
                    placeholder="4.00"
                    value={filters.maxGPA}
                    onChange={handleFilterChange}
                    className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4 md:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-bold text-blue-600">
                  {filteredStudents.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-900">
                  {students.length}
                </span>{" "}
                students
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {filteredStudents.length === students.length
                  ? "All students displayed"
                  : "Filtered results"}
              </p>
            </div>
          </div>
          {filteredStudents.length > 0 && (
            <button
              onClick={() => {
                toast.success("Export functionality will be implemented");
              }}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm font-semibold"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </button>
          )}
        </div>

        {/* Enhanced Students Table */}
        <div className="bg-white shadow-lg rounded-xl md:rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 md:px-6 py-3 md:py-5 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="p-1.5 md:p-2 bg-indigo-100 rounded-lg">
                  <Users className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    Student Directory
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    {filteredStudents.length > 0
                      ? `Displaying ${filteredStudents.length} of ${students.length} students`
                      : "No students found matching your search criteria"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredStudents.length === 0 ? (
              <div className="p-8 md:p-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <Frown className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">
                    No students found
                  </h3>
                  <p className="text-sm md:text-base text-gray-500 mb-6">
                    {Object.values(filters).some(Boolean)
                      ? "Try adjusting your search criteria or filters to find students."
                      : "Get started by adding your first student to the system."}
                  </p>
                  <button
                    type="button"
                    onClick={handleAddClick}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-base font-semibold"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Your First Student
                  </button>
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
                      Program
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Year/Semester
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      GPA
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
                  {filteredStudents.map((student, index) => (
                    <tr
                      key={student._id}
                      className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                    >
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {student.profilePicture ? (
                              <img
                                className="h-12 w-12 rounded-full border-2 border-white shadow-lg"
                                src={student.profilePicture}
                                alt=""
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                                {student.name?.charAt(0)?.toUpperCase() || "S"}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">
                              {student.name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                {student.studentId}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {student.program}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.programType}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900 flex items-center">
                          <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                          {student.department?.name ||
                            student.department ||
                            "N/A"}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          Year {student.yearOfStudy}
                        </div>
                        <div className="text-sm text-gray-500">
                          Semester {student.semester}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">
                          {student.gpa ? student.gpa.toFixed(2) : "N/A"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {student.academicStanding || "N/A"}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm
                          ${
                            student.status === "Active"
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : ""
                          }
                          ${
                            student.status === "Inactive"
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              : ""
                          }
                          ${
                            student.status === "Graduated"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : ""
                          }
                          ${
                            student.status === "Transferred"
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : ""
                          }
                          ${
                            student.status === "Suspended"
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : ""
                          }
                          ${
                            student.status === "On Leave"
                              ? "bg-gray-100 text-gray-800 border border-gray-200"
                              : ""
                          }
                        `}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewDetails(student)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-all duration-200"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditClick(student)}
                            className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded-lg transition-all duration-200"
                            title="Edit Student"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student._id)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-all duration-200"
                            title="Delete Student"
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

      {/* Student Form Modal */}
      <StudentFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditStudent(null);
        }}
        onSave={handleSaveStudent}
        initialData={editStudent}
        departments={departments}
        facultyAdvisors={facultyAdvisors}
      />

      {/* Enhanced Student Details Modal */}
      {detailsModalOpen && selectedStudentForDetails && (
        <StudentDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          student={selectedStudentForDetails}
        />
      )}
    </div>
  );
}
