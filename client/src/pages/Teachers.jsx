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
} from "lucide-react";
import TeacherTable from "../components/TeacherTable";
import TeacherFormModal from "../components/TeacherFormModal";
import React from "react";
import facultyList from "../helper/Faculties";

const statusColors = {
  Active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Inactive: "bg-gray-100 text-gray-800 border-gray-200",
  "On Leave": "bg-yellow-100 text-yellow-800 border-yellow-200",
  Retired: "bg-red-100 text-red-800 border-red-200",
  Probation: "bg-orange-100 text-orange-800 border-orange-200",
};

const designationColors = {
  Professor: "bg-purple-100 text-purple-800",
  "Associate Professor": "bg-blue-100 text-blue-800",
  "Assistant Professor": "bg-green-100 text-green-800",
  Lecturer: "bg-orange-100 text-orange-800",
  "Senior Lecturer": "bg-yellow-100 text-yellow-800",
  "Visiting Faculty": "bg-gray-100 text-gray-800",
};

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
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
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalTeachers, setTotalTeachers] = useState(0);

  // New filter UI states
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

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
      const [deptsRes] = await Promise.all([axios.get("/departments")]);
      setDepartments(deptsRes.data.data || []);
      setFaculties(facultyList);
      // Construct query parameters for teachers
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: pageSize,
        ...(searchTerm && { search: searchTerm }),
        ...(filters.department && { department: filters.department }),
        ...(filters.faculty && { faculty: filters.faculty }),
        ...(filters.designation && { designation: filters.designation }),
        ...(filters.gender && { gender: filters.gender }),
        ...(filters.specialization && {
          specialization: filters.specialization,
        }),
        ...(filters.status && { status: filters.status }),
      });

      const teachersRes = await axios.get(`/teachers?${queryParams}`);
      setTeachers(teachersRes.data.data || []);
      setTotalTeachers(teachersRes.data.total || 0);
    } catch (err) {
      setError("Failed to fetch data. Please try again later.");
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500); // Debounce search by 500ms

    return () => clearTimeout(timer);
  }, [currentPage, pageSize, searchTerm, filters]);

  // Edit teacher
  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setIsModalOpen(true);
  };

  // Delete teacher
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?"))
      return;

    try {
      await axios.delete(`/teachers/${id}`);
      toast.success("Teacher deleted successfully");
      fetchData();
    } catch (err) {
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
    setCurrentPage(1); // Reset to first page when searching
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
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-indigo-700 bg-clip-text text-transparent">
                  Teacher Management System
                </h1>
                <p className="mt-2 text-gray-600 font-medium">
                  Comprehensive academic staff management and professional
                  development tracking
                </p>
              </div>
            </div>
            <div className="mt-6 md:mt-0 flex space-x-3">
              <button
                onClick={() => fetchData()}
                className="inline-flex items-center px-5 py-2.5 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={handleAddNew}
                className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Teacher
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Enhanced Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search teachers by name, email, specialization, or qualification..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="block w-full pl-12 pr-16 py-4 text-lg border-2 border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Filter Panel */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <SlidersHorizontal className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Advanced Filters
                  </h3>
                  <p className="text-sm text-gray-600">
                    {activeFiltersCount > 0
                      ? `${activeFiltersCount} filter${
                          activeFiltersCount > 1 ? "s" : ""
                        } applied`
                      : "No filters applied"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
                  >
                    <X className="mr-1 h-4 w-4" />
                    Clear All ({activeFiltersCount})
                  </button>
                )}
                <button
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors duration-200"
                >
                  {isFilterExpanded ? "Hide" : "Show"} Filters
                  <ChevronDown
                    className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                      isFilterExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Animated Filter Content */}
          <div
            className={`transition-all duration-300 ease-in-out ${
              isFilterExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            } overflow-hidden`}
          >
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Department Filter */}
                <div className="relative">
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Department
                    {filters.department && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800">
                        Active
                      </span>
                    )}
                  </label>
                  <select
                    id="department"
                    name="department"
                    value={filters.department}
                    onChange={(e) =>
                      handleFilterChange("department", e.target.value)
                    }
                    className="block w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-300"
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
                  <label
                    htmlFor="faculty"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Faculty
                    {filters.faculty && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800">
                        Active
                      </span>
                    )}
                  </label>
                  <select
                    id="faculty"
                    name="faculty"
                    value={filters.faculty}
                    onChange={(e) =>
                      handleFilterChange("faculty", e.target.value)
                    }
                    className="block w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-300"
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
                  <label
                    htmlFor="designation"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Designation
                    {filters.designation && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800">
                        Active
                      </span>
                    )}
                  </label>
                  <select
                    id="designation"
                    name="designation"
                    value={filters.designation}
                    onChange={(e) =>
                      handleFilterChange("designation", e.target.value)
                    }
                    className="block w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-300"
                  >
                    <option value="">All Designations</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">
                      Associate Professor
                    </option>
                    <option value="Assistant Professor">
                      Assistant Professor
                    </option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Senior Lecturer">Senior Lecturer</option>
                    <option value="Visiting Faculty">Visiting Faculty</option>
                  </select>
                </div>

                {/* Gender Filter */}
                <div className="relative">
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Gender
                    {filters.gender && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800">
                        Active
                      </span>
                    )}
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={filters.gender}
                    onChange={(e) =>
                      handleFilterChange("gender", e.target.value)
                    }
                    className="block w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-300"
                  >
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Employment Status
                    {filters.status && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800">
                        Active
                      </span>
                    )}
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="block w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-300"
                  >
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Retired">Retired</option>
                    <option value="Probation">Probation</option>
                  </select>
                </div>

                {/* Specialization Filter - New Addition */}
                <div className="relative">
                  <label
                    htmlFor="specialization"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Specialization
                    {filters.specialization && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800">
                        Active
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    id="specialization"
                    placeholder="e.g. Machine Learning, Physics..."
                    value={filters.specialization}
                    onChange={(e) =>
                      handleFilterChange("specialization", e.target.value)
                    }
                    className="block w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-gray-300"
                  />
                </div>
              </div>

              {/* Filter Summary */}
              {activeFiltersCount > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-700 mr-2">
                      Active filters:
                    </span>
                    {searchTerm && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        Search: "{searchTerm}"
                        <button
                          onClick={() => setSearchTerm("")}
                          className="ml-2 hover:text-blue-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )}
                    {Object.entries(filters).map(
                      ([key, value]) =>
                        value && (
                          <span
                            key={key}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                          >
                            {key}:{" "}
                            {key === "department"
                              ? departments.find((d) => d._id === value)?.name
                              : key === "faculty"
                              ? faculties.find((f) => f._id === value)?.name
                              : value}
                            <button
                              onClick={() => handleFilterChange(key, "")}
                              className="ml-2 hover:text-indigo-900"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Teacher Directory
                  </h3>
                  <p className="text-sm text-gray-600">
                    {teachers.length > 0
                      ? `Displaying ${teachers.length} of ${totalTeachers} teachers`
                      : "No teachers found matching your search criteria"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
                <button className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <FileDown className="mr-2 h-4 w-4" />
                  Export Data
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center space-x-2 text-gray-500 font-medium">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Loading teacher data...</span>
                </div>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <div className="text-red-500 font-medium mb-4">{error}</div>
                <button
                  onClick={fetchData}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </button>
              </div>
            ) : teachers.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-gray-500 font-medium mb-4">
                  No teachers found matching your criteria
                </div>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
    </div>
  );
}
