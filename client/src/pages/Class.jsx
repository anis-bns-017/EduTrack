import React, { useState, useEffect, useCallback } from "react";
import axios from "../../api/axios";
import ClassFormModal from "../components/ClassFormModal";
import { toast } from "react-hot-toast";
import {
  BookOpen,
  Users,
  Clock,
  Building2,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  Calendar,
  CreditCard,
  MapPin,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  ChevronDown,
  X,
  ShieldAlert,
} from "lucide-react";

export default function Class() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editClass, setEditClass] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Statistics state
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    pending: 0,
    departments: 0,
    totalCredits: 0,
    averageCredits: 0,
    byDepartment: {},
    byStatus: {},
    growthRate: 0,
  });

  // Calculate statistics
  const calculateStatistics = useCallback((classData) => {
    const stats = {
      total: classData.length,
      active: classData.filter((c) => c.status === "active").length,
      pending: classData.filter((c) => c.status === "pending").length,
      departments: new Set(
        classData.map((c) => c.department?.name).filter(Boolean)
      ).size,
      totalCredits: classData.reduce((sum, c) => sum + (c.credits || 0), 0),
      averageCredits:
        classData.length > 0
          ? Math.round(
              classData.reduce((sum, c) => sum + (c.credits || 0), 0) /
                classData.length
            )
          : 0,
      byDepartment: {},
      byStatus: {},
      growthRate: Math.floor(Math.random() * 25) + 5, // Mock growth rate
    };

    // Count by department
    classData.forEach((cls) => {
      const deptName = cls.department?.name || "Unknown";
      stats.byDepartment[deptName] = (stats.byDepartment[deptName] || 0) + 1;
      stats.byStatus[cls.status] = (stats.byStatus[cls.status] || 0) + 1;
    });

    setStatistics(stats);
  }, []);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/classes");
        const classData = res.data;
        setClasses(classData);
        setFilteredClasses(classData);
        calculateStatistics(classData);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [calculateStatistics]);

  // Filter classes based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredClasses(classes);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = classes.filter(
        (cls) =>
          cls.className.toLowerCase().includes(term) ||
          cls.courseCode?.toLowerCase().includes(term) ||
          cls.subject.toLowerCase().includes(term) ||
          cls.department?.name?.toLowerCase().includes(term) ||
          cls.teacher?.firstName?.toLowerCase().includes(term) ||
          cls.teacher?.middleName?.toLowerCase().includes(term) ||
          cls.teacher?.lastName?.toLowerCase().includes(term)
      );
      setFilteredClasses(filtered);
    }
  }, [searchTerm, classes]);

  // Calculate active filters count
  useEffect(() => {
    const count = searchTerm ? 1 : 0;
    setActiveFiltersCount(count);
  }, [searchTerm]);

  const openAddModal = () => {
    setEditClass(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cls) => {
    setEditClass(cls);
    setIsModalOpen(true);
  };

  const handleSaveClass = async (classData) => {
    try {
      if (editClass) {
        const res = await axios.put(`/classes/${editClass._id}`, classData);
        setClasses((prev) =>
          prev.map((c) => (c._id === editClass._id ? res.data : c))
        );
        toast.success("Class updated successfully");
      } else {
        const res = await axios.post("/classes", classData);
        setClasses((prev) => [...prev, res.data]);
        toast.success("Class added successfully");
      }
      setIsModalOpen(false);
      setEditClass(null);
    } catch (err) {
      console.error("Error saving class:", err);
      const errorMessage = editClass
        ? err.response?.data?.message || "Failed to update class"
        : err.response?.data?.message || "Failed to create class";
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;
    try {
      await axios.delete(`/classes/${id}`);
      setClasses((prev) => prev.filter((c) => c._id !== id));
      toast.success("Class deleted successfully");
    } catch (err) {
      console.error("Error deleting class:", err);
      toast.error(err.response?.data?.message || "Failed to delete class");
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Re-fetch classes
    const fetchClasses = async () => {
      try {
        const res = await axios.get("/classes");
        const classData = res.data;
        setClasses(classData);
        setFilteredClasses(classData);
        calculateStatistics(classData);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  };

  const resetFilters = () => {
    setSearchTerm("");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gradient-to-r from-indigo-500 to-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading classes...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center max-w-md">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <ShieldAlert className="h-10 w-10 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Classes
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </button>
        </div>
      </div>
    );

  console.log("Classes data:", classes);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 md:p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-indigo-700 bg-clip-text text-transparent">
                  Classes Management
                </h1>
                <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600 font-medium hidden md:block">
                  Comprehensive course management and scheduling system
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={openAddModal}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add New Class
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-3 sm:px-4 lg:px-6 mt-4 md:mt-8">
        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Total Classes Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full opacity-10 blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
                    Total Classes
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
                  <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Classes Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full opacity-10 blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
                    Active Classes
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
                  <Activity className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Total Credits Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full opacity-10 blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
                    Total Credits
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {statistics.totalCredits}
                  </p>
                  <div className="flex items-center mt-2 text-xs md:text-sm text-purple-600">
                    <CreditCard className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span>Avg: {statistics.averageCredits} per class</span>
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl shadow-lg">
                  <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-white" />
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

        {/* Department Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Department Distribution */}
          <div className="lg:col-span-2 bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                Department Distribution
              </h3>
              <PieChart className="h-5 w-5 md:h-6 md:w-6 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {Object.entries(statistics.byDepartment)
                .slice(0, 8)
                .map(([dept, count]) => (
                  <div
                    key={dept}
                    className="text-center p-3 md:p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 rounded-full flex items-center justify-center bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600">
                      <Building2 className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <p className="text-lg md:text-xl font-bold text-gray-900">
                      {count}
                    </p>
                    <p className="text-xs md:text-sm text-gray-600 truncate">
                      {dept}
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
                Add New Class
              </button>
              <button
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg"
              >
                <Filter className="h-4 w-4 mr-2" />
                {isFilterExpanded ? "Hide" : "Show"} Search
              </button>
              <button className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg">
                <Calendar className="h-4 w-4 mr-2" />
                View Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="mb-4 md:mb-6">
          <div className="bg-white shadow-lg md:shadow-xl rounded-xl md:rounded-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="p-1.5 md:p-2 bg-indigo-100 rounded-lg">
                    <Search className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">
                      Search Classes
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600">
                      {activeFiltersCount > 0
                        ? `${activeFiltersCount} filter${
                            activeFiltersCount > 1 ? "s" : ""
                          } applied`
                        : "Search by class name, course code, subject, department, or teacher"}
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
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                    className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors duration-200"
                  >
                    {isFilterExpanded ? "Hide" : "Show"} Search
                    <ChevronDown
                      className={`ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4 transition-transform duration-200 ${
                        isFilterExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Animated Search Content */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                isFilterExpanded
                  ? "max-h-screen opacity-100"
                  : "max-h-0 opacity-0"
              } overflow-hidden`}
            >
              <div className="p-4 md:p-6">
                <div className="relative max-w-3xl mx-auto">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search classes by name, course code, subject, department, or teacher..."
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
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Table */}
        <div className="bg-white shadow-lg rounded-xl md:rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 md:px-6 py-3 md:py-5 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="p-1.5 md:p-2 bg-indigo-100 rounded-lg">
                  <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    Class Directory
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    {filteredClasses.length > 0
                      ? `Displaying ${filteredClasses.length} of ${classes.length} classes`
                      : "No classes found matching your search criteria"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredClasses.length === 0 ? (
              <div className="p-8 md:p-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">
                    No classes found
                  </h3>
                  <p className="text-sm md:text-base text-gray-500 mb-6">
                    {searchTerm
                      ? "No classes match your search criteria."
                      : "Get started by adding a new class."}
                  </p>
                  <button
                    onClick={openAddModal}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Class
                  </button>
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "#",
                      "Course Code",
                      "Name",
                      "Subject",
                      "Department",
                      "Teacher",
                      "Semester",
                      "Credits",
                      "Room",
                      "Schedule",
                      "Actions",
                    ].map((head) => (
                      <th
                        key={head}
                        scope="col"
                        className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClasses.map((cls, index) => (
                    <tr
                      key={cls._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center mr-2">
                            <span className="text-xs font-semibold text-indigo-600">
                              {index + 1}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {cls.courseCode || "-"}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {cls.className}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cls.subject}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-1 text-gray-400" />
                          {cls.department?.name || "-"}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-gray-400" />
                          {cls.teacher?.firstName + " " + cls.teacher?.middleName + " " + cls.teacher?.lastName || "-"}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                          {cls.semester || "-"}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-1 text-gray-400" />
                          {cls.credits ?? "-"}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          {cls.room || "-"}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-500">
                        {Array.isArray(cls.schedule) && cls.schedule.length > 0
                          ? cls.schedule.map((s, i) => (
                              <div key={i} className="mb-1 last:mb-0">
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {s.day} - {s.time}
                                </span>
                              </div>
                            ))
                          : "-"}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(cls)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                            title="Edit class"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cls._id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                            title="Delete class"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Modal Form */}
      <ClassFormModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        onSave={handleSaveClass}
        initialData={editClass}
      />
    </div>
  );
}
