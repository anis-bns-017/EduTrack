import { useEffect, useState, useCallback } from "react";
import axios from "../../api/axios";
import { toast } from "react-hot-toast";
import {
  Plus,
  Search,
  Filter,
  RefreshCw,
  FileDown,
  GraduationCap,
  Users,
  ChevronDown,
  X,
  SlidersHorizontal,
  Menu,
  TrendingUp,
  Award,
  Star,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
} from "lucide-react";
import TeacherTable from "../components/TeacherTable";
import TeacherFormModal from "../components/TeacherFormModal";
import TeacherDetailsModal from "../components/TeacherDetailsModal";
import React from "react";
import facultyList from "../helper/Faculties";

const statusColors = {
  Active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Inactive: "bg-gray-100 text-gray-800 border-gray-200",
  "On Leave": "bg-yellow-100 text-yellow-800 border-yellow-200",
  Retired: "bg-red-100 text-red-800 border-red-200",
  Resigned: "bg-purple-100 text-purple-800 border-purple-200",
  Terminated: "bg-red-100 text-red-800 border-red-200",
  Sabbatical: "bg-blue-100 text-blue-800 border-blue-200",
};

const designationColors = {
  Professor: "bg-purple-100 text-purple-800",
  "Associate Professor": "bg-blue-100 text-blue-800",
  "Assistant Professor": "bg-green-100 text-green-800",
  Lecturer: "bg-orange-100 text-orange-800",
  "Senior Lecturer": "bg-yellow-100 text-yellow-800",
  "Visiting Faculty": "bg-gray-100 text-gray-800",
  "Adjunct Professor": "bg-indigo-100 text-indigo-800",
  "Research Fellow": "bg-pink-100 text-pink-800",
  "Teaching Assistant": "bg-teal-100 text-teal-800",
};

const statCardColors = {
  total: "from-blue-500 to-cyan-600",
  active: "from-emerald-500 to-green-600",
  professors: "from-purple-500 to-violet-600",
  departments: "from-orange-500 to-red-600",
};

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [viewingTeacher, setViewingTeacher] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  
  // Filter and pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    department: "",
    faculty: "",
    designation: "",
    gender: "",
    specialization: "",
    status: "",
    employmentType: "",
    qualification: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalTeachers, setTotalTeachers] = useState(0);
  
  // New filter UI states
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Calculate statistics
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    professors: 0,
    departments: 0,
    byStatus: {},
    byDesignation: {},
    byGender: {},
    growthRate: 0,
  });

  // Calculate statistics from teachers data
  const calculateStatistics = useCallback((teacherData) => {
    const stats = {
      total: teacherData.length,
      active: teacherData.filter(t => t.status === 'Active').length,
      professors: teacherData.filter(t => t.designation === 'Professor').length,
      departments: new Set(teacherData.map(t => t.department)).size,
      byStatus: {},
      byDesignation: {},
      byGender: {},
      growthRate: Math.floor(Math.random() * 20) + 5, // Mock growth rate
    };

    // Count by status
    teacherData.forEach(teacher => {
      stats.byStatus[teacher.status] = (stats.byStatus[teacher.status] || 0) + 1;
      stats.byDesignation[teacher.designation] = (stats.byDesignation[teacher.designation] || 0) + 1;
      stats.byGender[teacher.gender] = (stats.byGender[teacher.gender] || 0) + 1;
    });

    setStatistics(stats);
  }, []);

  // Calculate active filters count
  useEffect(() => {
    const count =
      Object.values(filters).filter((value) => value !== "").length +
      (searchTerm ? 1 : 0);
    setActiveFiltersCount(count);
  }, [filters, searchTerm]);

  // Fetch teachers and related data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch departments and faculties first
      const [deptsRes, facultiesRes] = await Promise.all([
        axios.get("/departments"),
        axios.get("/faculties"),
      ]);
      
      setDepartments(deptsRes.data.data || []);
      setFaculties(facultiesRes.data || []);
      
      // Construct query parameters for teachers
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: pageSize,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.department && { department: filters.department }),
        ...(filters.faculty && { faculty: filters.faculty }),
        ...(filters.designation && { designation: filters.designation }),
        ...(filters.gender && { gender: filters.gender }),
        ...(filters.specialization && { specialization: filters.specialization }),
        ...(filters.status && { status: filters.status }),
        ...(filters.employmentType && { employmentType: filters.employmentType }),
        ...(filters.qualification && { qualification: filters.qualification }),
      });
      
      const teachersRes = await axios.get(`/teachers?${queryParams}`);
      const teacherData = teachersRes.data.data || [];
      setTeachers(teacherData);
      setTotalTeachers(teachersRes.data.total || 0);
      
      // Calculate statistics
      calculateStatistics(teacherData);
    } catch (err) {
      setError("Failed to fetch data. Please try again later.");
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, filters, calculateStatistics]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500); // Debounce search by 500ms
    return () => clearTimeout(timer);
  }, [fetchData]);

  // Edit teacher
  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setIsModalOpen(true);
  };

  // View teacher details
  const handleViewDetails = (teacher) => {
    setViewingTeacher(teacher);
    setIsDetailsModalOpen(true);
  };

  // Close details modal
  const handleCloseDetailsModal = () => {
    setViewingTeacher(null);
    setIsDetailsModalOpen(false);
  };

  // Delete teacher
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;
    try {
      await axios.delete(`/teachers/${id}`);
      setTeachers((prev) => prev.filter((teacher) => teacher._id !== id));
      toast.success("Teacher deleted successfully");
      fetchData();
    } catch (err) {
      console.error("Failed to delete teacher:", err);
      toast.error("Failed to delete teacher");
    }
  };

  // Open modal for new teacher
  const handleAddNew = () => {
    setEditingTeacher(null);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setEditingTeacher(null);
    setIsModalOpen(false);
  };

  // Handle form submission success
  const handleFormSuccess = () => {
    fetchData();
    handleCloseModal();
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    e.preventDefault();
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCurrentPage(1);
  };

  // Reset all filters
  const resetFilters = (e) => {
    if (e) e.preventDefault();
    setSearchTerm("");
    setFilters({
      department: "",
      faculty: "",
      designation: "",
      gender: "",
      specialization: "",
      status: "",
      employmentType: "",
      qualification: "",
    });
    setCurrentPage(1);
  };

  // Handle page size change
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center justify-between md:justify-start space-x-4">
              <div className="flex items-center space-x-4">
                <div className="p-2 md:p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <GraduationCap className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-indigo-700 bg-clip-text text-transparent">
                    Teacher Management
                  </h1>
                  <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600 font-medium hidden md:block">
                    Comprehensive academic staff management and professional development tracking
                  </p>
                </div>
              </div>
              <button
                className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
            <div className={`mt-4 md:mt-0 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3 ${isMobileMenuOpen ? 'flex' : 'hidden md:flex'}`}>
              <button
                onClick={() => fetchData()}
                className="inline-flex items-center justify-center px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={handleAddNew}
                className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Teacher
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-8xl mx-auto px-3 sm:px-4 lg:px-6 mt-4 md:mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Total Teachers Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full opacity-10 blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Total Teachers</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">{statistics.total}</p>
                  <div className="flex items-center mt-2 text-xs md:text-sm text-green-600">
                    <TrendingUp className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span>+{statistics.growthRate}% from last month</span>
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                  <Users className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Teachers Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full opacity-10 blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Active Teachers</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">{statistics.active}</p>
                  <div className="flex items-center mt-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full" 
                        style={{ width: `${(statistics.active / statistics.total) * 100 || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs md:text-sm text-gray-600">
                      {Math.round((statistics.active / statistics.total) * 100 || 0)}%
                    </span>
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-lg">
                  <Activity className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Professors Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full opacity-10 blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Professors</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">{statistics.professors}</p>
                  <div className="flex items-center mt-2 text-xs md:text-sm text-purple-600">
                    <Award className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span>Senior faculty members</span>
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl shadow-lg">
                  <Star className="h-6 w-6 md:h-8 md:w-8 text-white" />
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
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Departments</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">{statistics.departments}</p>
                  <div className="flex items-center mt-2 text-xs md:text-sm text-orange-600">
                    <Target className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span>Academic units</span>
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg">
                  <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-white" />
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
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Status Distribution</h3>
              <PieChart className="h-5 w-5 md:h-6 md:w-6 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {Object.entries(statistics.byStatus).map(([status, count]) => (
                <div key={status} className="text-center p-3 md:p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className={`w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    status === 'Active' ? 'bg-emerald-100 text-emerald-600' :
                    status === 'Inactive' ? 'bg-gray-100 text-gray-600' :
                    status === 'On Leave' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    <Users className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <p className="text-lg md:text-xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs md:text-sm text-gray-600">{status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Quick Actions</h3>
              <Zap className="h-5 w-5 md:h-6 md:w-6 text-gray-400" />
            </div>
            <div className="space-y-3">
              <button
                onClick={handleAddNew}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Teacher
              </button>
              <button
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg"
              >
                <Filter className="h-4 w-4 mr-2" />
                {isFilterExpanded ? 'Hide' : 'Show'} Filters
              </button>
              <button className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg">
                <FileDown className="h-4 w-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="mb-4 md:mb-6">
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search teachers by name, email, employee ID, or specialization..."
              value={searchTerm}
              onChange={handleSearchChange}
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
        </div>

        {/* Enhanced Filter Panel */}
        <div className="bg-white shadow-lg md:shadow-xl rounded-xl md:rounded-2xl border border-gray-100 mb-4 md:mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="p-1.5 md:p-2 bg-indigo-100 rounded-lg">
                  <SlidersHorizontal className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    Filters
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    {activeFiltersCount > 0
                      ? `${activeFiltersCount} filter${activeFiltersCount > 1 ? "s" : ""} applied`
                      : "No filters applied"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
                  >
                    <X className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors duration-200"
                >
                  {isFilterExpanded ? "Hide" : "Show"} Filters
                  <ChevronDown
                    className={`ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4 transition-transform duration-200 ${isFilterExpanded ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
            </div>
          </div>
          
          {/* Animated Filter Content */}
          <div className={`transition-all duration-300 ease-in-out ${isFilterExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}>
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {/* Department Filter */}
                <div className="relative">
                  <label htmlFor="department" className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Department
                    {filters.department && (
                      <span className="ml-1 md:ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800">
                        Active
                      </span>
                    )}
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={filters.department}
                    onChange={(e) => handleFilterChange("department", e.target.value)}
                    className="block w-full px-3 py-2 md:px-4 md:py-3 text-sm border-2 border-gray-200 rounded-lg md:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-300"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Faculty Filter */}
                <div className="relative">
                  <label htmlFor="faculty" className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Faculty
                    {filters.faculty && (
                      <span className="ml-1 md:ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800">
                        Active
                      </span>
                    )}
                  </label>
                  <select
                    id="faculty"
                    name="faculty"
                    value={filters.faculty}
                    onChange={(e) => handleFilterChange("faculty", e.target.value)}
                    className="block w-full px-3 py-2 md:px-4 md:py-3 text-sm border-2 border-gray-200 rounded-lg md:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-300"
                  >
                    <option value="">All Faculties</option>
                    {faculties.map((faculty) => (
                      <option key={faculty._id} value={faculty._id}>
                        {faculty.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Designation Filter */}
                <div className="relative">
                  <label htmlFor="designation" className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Designation
                    {filters.designation && (
                      <span className="ml-1 md:ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800">
                        Active
                      </span>
                    )}
                  </label>
                  <select
                    id="designation"
                    name="designation"
                    value={filters.designation}
                    onChange={(e) => handleFilterChange("designation", e.target.value)}
                    className="block w-full px-3 py-2 md:px-4 md:py-3 text-sm border-2 border-gray-200 rounded-lg md:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-300"
                  >
                    <option value="">All Designations</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Senior Lecturer">Senior Lecturer</option>
                    <option value="Visiting Faculty">Visiting Faculty</option>
                    <option value="Adjunct Professor">Adjunct Professor</option>
                    <option value="Research Fellow">Research Fellow</option>
                    <option value="Teaching Assistant">Teaching Assistant</option>
                  </select>
                </div>

                {/* Gender Filter */}
                <div className="relative">
                  <label htmlFor="gender" className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Gender
                    {filters.gender && (
                      <span className="ml-1 md:ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800">
                        Active
                      </span>
                    )}
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={filters.gender}
                    onChange={(e) => handleFilterChange("gender", e.target.value)}
                    className="block w-full px-3 py-2 md:px-4 md:py-3 text-sm border-2 border-gray-200 rounded-lg md:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-300"
                  >
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <label htmlFor="status" className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Employment Status
                    {filters.status && (
                      <span className="ml-1 md:ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800">
                        Active
                      </span>
                    )}
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    className="block w-full px-3 py-2 md:px-4 md:py-3 text-sm border-2 border-gray-200 rounded-lg md:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-300"
                  >
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Sabbatical">Sabbatical</option>
                    <option value="Retired">Retired</option>
                    <option value="Resigned">Resigned</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>

                {/* Employment Type Filter */}
                <div className="relative">
                  <label htmlFor="employmentType" className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Employment Type
                    {filters.employmentType && (
                      <span className="ml-1 md:ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800">
                        Active
                      </span>
                    )}
                  </label>
                  <select
                    id="employmentType"
                    name="employmentType"
                    value={filters.employmentType}
                    onChange={(e) => handleFilterChange("employmentType", e.target.value)}
                    className="block w-full px-3 py-2 md:px-4 md:py-3 text-sm border-2 border-gray-200 rounded-lg md:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-300"
                  >
                    <option value="">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Visiting">Visiting</option>
                    <option value="Adjunct">Adjunct</option>
                  </select>
                </div>

                {/* Qualification Filter */}
                <div className="relative">
                  <label htmlFor="qualification" className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Qualification
                    {filters.qualification && (
                      <span className="ml-1 md:ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800">
                        Active
                      </span>
                    )}
                  </label>
                  <select
                    id="qualification"
                    name="qualification"
                    value={filters.qualification}
                    onChange={(e) => handleFilterChange("qualification", e.target.value)}
                    className="block w-full px-3 py-2 md:px-4 md:py-3 text-sm border-2 border-gray-200 rounded-lg md:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-300"
                  >
                    <option value="">All Qualifications</option>
                    <option value="PhD">PhD</option>
                    <option value="MSc">MSc</option>
                    <option value="MBA">MBA</option>
                    <option value="MA">MA</option>
                    <option value="MPhil">MPhil</option>
                    <option value="BSc">BSc</option>
                    <option value="BA">BA</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Specialization Filter */}
                <div className="relative sm:col-span-2 lg:col-span-1">
                  <label htmlFor="specialization" className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Specialization
                    {filters.specialization && (
                      <span className="ml-1 md:ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800">
                        Active
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    id="specialization"
                    placeholder="e.g. Machine Learning, Physics..."
                    value={filters.specialization}
                    onChange={(e) => handleFilterChange("specialization", e.target.value)}
                    className="block w-full px-3 py-2 md:px-4 md:py-3 text-sm border-2 border-gray-200 rounded-lg md:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-300"
                  />
                </div>
              </div>

              {/* Filter Summary */}
              {activeFiltersCount > 0 && (
                <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs md:text-sm font-medium text-gray-700 mr-2">
                      Active filters:
                    </span>
                    {searchTerm && (
                      <span className="inline-flex items-center px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        Search: "{searchTerm}"
                        <button onClick={() => setSearchTerm("")} className="ml-1 md:ml-2 hover:text-blue-900">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {Object.entries(filters).map(([key, value]) => value && (
                      <span key={key} className="inline-flex items-center px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                        {key}: {key === "department" ? departments.find((d) => d._id === value)?.name : key === "faculty" ? faculties.find((f) => f._id === value)?.name : value}
                        <button onClick={() => handleFilterChange(key, "")} className="ml-1 md:ml-2 hover:text-indigo-900">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl md:rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 md:px-6 py-3 md:py-5 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="p-1.5 md:p-2 bg-indigo-100 rounded-lg">
                  <Users className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    Teacher Directory
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    {teachers.length > 0
                      ? `Displaying ${teachers.length} of ${totalTeachers} teachers`
                      : "No teachers found matching your search criteria"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between md:justify-end space-x-2 md:space-x-4">
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="px-2 py-1.5 md:px-4 md:py-2 text-xs md:text-sm border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
                <button className="inline-flex items-center px-2 py-1.5 md:px-4 md:py-2 border border-gray-200 rounded-lg shadow-sm text-xs md:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <FileDown className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden md:inline">Export Data</span>
                  <span className="md:hidden">Export</span>
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 md:p-12 text-center">
                <div className="inline-flex items-center space-x-2 text-gray-500 font-medium text-sm md:text-base">
                  <RefreshCw className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                  <span>Loading teacher data...</span>
                </div>
              </div>
            ) : error ? (
              <div className="p-8 md:p-12 text-center">
                <div className="text-red-500 font-medium mb-3 md:mb-4 text-sm md:text-base">{error}</div>
                <button
                  onClick={fetchData}
                  className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 rounded-lg shadow-sm text-xs md:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <RefreshCw className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Try Again
                </button>
              </div>
            ) : teachers.length === 0 ? (
              <div className="p-8 md:p-12 text-center">
                <div className="text-gray-500 font-medium mb-3 md:mb-4 text-sm md:text-base">
                  No teachers found matching your criteria
                </div>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 rounded-lg shadow-sm text-xs md:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <TeacherTable
                  teachers={teachers}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onViewDetails={handleViewDetails}
                  statusColors={statusColors}
                  designationColors={designationColors}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Teacher Form Modal */}
      {isModalOpen && (
        <TeacherFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleFormSuccess}
          teacher={editingTeacher}
          departments={departments}
          faculties={faculties}
        />
      )}

      {/* Teacher Details Modal */}
      {isDetailsModalOpen && (
        <TeacherDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          teacher={viewingTeacher}
        />
      )}
    </div>
  );
}