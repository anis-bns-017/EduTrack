import React, { useState, useEffect } from "react";
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
} from "lucide-react";

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

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [studentsRes, deptsRes] = await Promise.all([
          axios.get("/students?limit=1000"),
          axios.get("/departments"),
        ]);

        console.log("okay: ", studentsRes);
        setStudents(studentsRes.data.data || []);
        setFilteredStudents(studentsRes.data.data || []);
        setDepartments(deptsRes.data.data || []);
        setFacultyAdvisors(facultyList);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  // Student detail fields configuration
  const studentDetailSections = [
    {
      title: "Personal Information",
      fields: [
        { key: "name", label: "Full Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        {
          key: "dateOfBirth",
          label: "Date of Birth",
          format: (val) => (val ? format(new Date(val), "PPP") : "N/A"),
        },
        { key: "gender", label: "Gender" },
        { key: "bloodGroup", label: "Blood Group" },
        { key: "nationality", label: "Nationality" },
        {
          key: "identification",
          label: "ID",
          format: (id) => (id ? `${id.type}: ${id.number}` : "N/A"),
        },
      ],
    },
    {
      title: "Academic Information",
      fields: [
        { key: "studentId", label: "Student ID" },
        { key: "rollNumber", label: "Roll Number" },
        { key: "program", label: "Program" },
        { key: "programType", label: "Program Type" },
        {
          key: "department",
          label: "Department",
          format: (dept) => dept?.name || dept || "N/A",
        },
        {
          key: "facultyAdvisor",
          label: "Faculty Advisor",
          format: (advisor) => advisor?.name || advisor || "N/A",
        },
        { key: "yearOfStudy", label: "Year of Study" },
        { key: "semester", label: "Semester" },
        { key: "gpa", label: "GPA" },
        { key: "totalCreditsEarned", label: "Credits Earned" },
        { key: "academicStanding", label: "Academic Standing" },
        { key: "status", label: "Status" },
      ],
    },
    {
      title: "Contact Information",
      fields: [
        {
          key: "address",
          label: "Address",
          format: (addr) =>
            addr
              ? `${addr.street}, ${addr.city}, ${addr.state} ${addr.postalCode}, ${addr.country}`
              : "N/A",
        },
        { key: "guardianName", label: "Guardian Name" },
        { key: "guardianPhone", label: "Guardian Phone" },
      ],
    },
    {
      title: "Financial Information",
      fields: [
        {
          key: "financialInformation.tuitionBalance",
          label: "Tuition Balance",
          format: (val) => (val ? `$${val.toFixed(2)}` : "N/A"),
        },
        {
          key: "financialInformation.financialAid",
          label: "Financial Aid",
          format: (val) => (val ? "Yes" : "No"),
        },
        {
          key: "financialInformation.scholarships",
          label: "Scholarships",
          format: (sch) => (sch?.length ? sch.join(", ") : "None"),
        },
      ],
    },
  ];

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="relative overflow-hidden bg-white rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Student Management
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">
                    Manage and track all student records with ease
                  </p>
                </div>
              </div>
              <button
                onClick={handleAddClick}
                className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                <span className="font-semibold">Add Student</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Total Students
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {students.length}
                  </p>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12% from last month
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 h-2 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: "75%" }}
                ></div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Active Students
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {students.filter((s) => s.status === "Active").length}
                  </p>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8% from last month
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 h-2 bg-green-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                  style={{ width: "85%" }}
                ></div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Average GPA
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {students.length > 0
                      ? (
                          students.reduce((sum, s) => sum + (s.gpa || 0), 0) /
                          students.length
                        ).toFixed(2)
                      : "0.00"}
                  </p>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3 text-yellow-400 fill-current"
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">
                      Excellent
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 h-2 bg-purple-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: "90%" }}
                ></div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Departments
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {
                      [
                        ...new Set(
                          students
                            .map((s) => s.department?.name || s.department)
                            .filter(Boolean)
                        ),
                      ].length
                    }
                  </p>
                  <p className="text-xs text-orange-600 mt-1 flex items-center">
                    <Building2 className="w-3 h-3 mr-1" />
                    Across campus
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Building2 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 h-2 bg-orange-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
                  style={{ width: "65%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm mb-8 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50/30">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1 max-w-2xl">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search students by name, ID, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl leading-5 bg-white/70 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center px-6 py-3 border-2 border-gray-200 shadow-lg text-sm font-semibold rounded-xl transition-all duration-200 ${
                    showFilters
                      ? "bg-blue-600 text-white border-blue-600"
                      : "text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <Filter className="w-5 h-5 mr-2" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                  <ChevronDown
                    className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {Object.values(filters).some(Boolean) && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-6 py-3 border-2 border-red-200 shadow-lg text-sm font-semibold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all duration-200"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {showFilters && (
              <div className="mt-8 p-6 bg-white rounded-xl border border-gray-100 shadow-inner">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Filter className="w-5 h-5 mr-2 text-blue-600" />
                  Filter Options
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {/* Enhanced filter inputs with better styling */}
                  <div className="space-y-2">
                    <label
                      htmlFor="program"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Program
                    </label>
                    <select
                      id="program"
                      name="program"
                      value={filters.program}
                      onChange={handleFilterChange}
                      className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                    >
                      <option value="">All Programs</option>
                      {uniqueValues("program").map((program) => (
                        <option key={program} value={program}>
                          {program}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="programType"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Program Type
                    </label>
                    <select
                      id="programType"
                      name="programType"
                      value={filters.programType}
                      onChange={handleFilterChange}
                      className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                    >
                      <option value="">All Types</option>
                      {programTypeOptions.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="department"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Department
                    </label>
                    <select
                      id="department"
                      name="department"
                      value={filters.department}
                      onChange={handleFilterChange}
                      className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                    >
                      <option value="">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="status"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                    >
                      <option value="">All Statuses</option>
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="yearOfStudy"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Year of Study
                    </label>
                    <select
                      id="yearOfStudy"
                      name="yearOfStudy"
                      value={filters.yearOfStudy}
                      onChange={handleFilterChange}
                      className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                    >
                      <option value="">All Years</option>
                      {[1, 2, 3, 4, 5, 6].map((year) => (
                        <option key={year} value={year}>
                          Year {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="academicStanding"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Academic Standing
                    </label>
                    <select
                      id="academicStanding"
                      name="academicStanding"
                      value={filters.academicStanding}
                      onChange={handleFilterChange}
                      className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                    >
                      <option value="">All Standings</option>
                      {academicStandingOptions.map((standing) => (
                        <option key={standing} value={standing}>
                          {standing}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="minGPA"
                      className="block text-sm font-semibold text-gray-700"
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
                      className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="maxGPA"
                      className="block text-sm font-semibold text-gray-700"
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
                      className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Results Summary */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
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
        <div className="bg-white shadow-2xl rounded-2xl border border-white/20 backdrop-blur-sm overflow-hidden">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-16 px-8">
              <div className="max-w-md mx-auto">
                <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <Frown className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No students found
                </h3>
                <p className="text-gray-500 mb-8 text-lg">
                  {Object.values(filters).some(Boolean)
                    ? "Try adjusting your search criteria or filters to find students."
                    : "Get started by adding your first student to the system."}
                </p>
                <button
                  type="button"
                  onClick={handleAddClick}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg font-semibold"
                >
                  <Plus className="w-6 h-6 mr-2" />
                  Add Your First Student
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Year/Semester
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      GPA
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map((student, index) => (
                    <tr
                      key={student._id}
                      className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                    >
                      <td className="px-6 py-5">
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
                      <td className="px-6 py-5">
                        <div className="text-sm font-semibold text-gray-900">
                          {student.program}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.programType}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-semibold text-gray-900 flex items-center">
                          <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                          {student.department?.name ||
                            student.department ||
                            "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-semibold text-gray-900 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          Year {student.yearOfStudy}
                        </div>
                        <div className="text-sm text-gray-500">
                          Semester {student.semester}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-bold text-gray-900">
                          {student.gpa ? student.gpa.toFixed(2) : "N/A"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {student.academicStanding || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-5">
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
                      <td className="px-6 py-5 text-right">
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
            </div>
          )}
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
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => setDetailsModalOpen(false)}
              ></div>

              {/* Modal */}
              <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Modal Header */}
                <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-6 py-6">
                  <div className="flex justify-between items-center text-white">
                    <div className="flex items-center space-x-4">
                      {selectedStudentForDetails.profilePicture ? (
                        <img
                          src={selectedStudentForDetails.profilePicture}
                          alt="Profile"
                          className="h-14 w-14 rounded-full object-cover border-3 border-white/30 shadow-xl"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold border-3 border-white/30">
                          {selectedStudentForDetails.name
                            ?.charAt(0)
                            ?.toUpperCase() || "S"}
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold">
                          {selectedStudentForDetails.name || "Student Details"}
                        </h3>
                        <div className="flex items-center mt-1 text-sm text-blue-100">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                            {selectedStudentForDetails.studentId}
                          </span>
                          <span className="mx-2">•</span>
                          <span>{selectedStudentForDetails.program}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDetailsModalOpen(false)}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Modal Content - Scrollable */}
                <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
                  <div className="px-6 py-6">
                    {/* Quick Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                              Email
                            </p>
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {selectedStudentForDetails.email ||
                                "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-green-600 uppercase tracking-wider">
                              Phone
                            </p>
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {selectedStudentForDetails.phone ||
                                "Not provided"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                        <div className="flex items-center space-x-3">
                          <UserCheck className="w-5 h-5 text-purple-500 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-purple-600 uppercase tracking-wider">
                              Status
                            </p>
                            <span
                              className={`inline-flex items-center mt-1 px-2 py-1 text-xs font-semibold rounded-full
                            ${
                              selectedStudentForDetails.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : ""
                            }
                            ${
                              selectedStudentForDetails.status === "Inactive"
                                ? "bg-yellow-100 text-yellow-800"
                                : ""
                            }
                            ${
                              selectedStudentForDetails.status === "Graduated"
                                ? "bg-blue-100 text-blue-800"
                                : ""
                            }
                            ${
                              selectedStudentForDetails.status === "Transferred"
                                ? "bg-purple-100 text-purple-800"
                                : ""
                            }
                            ${
                              selectedStudentForDetails.status === "Suspended"
                                ? "bg-red-100 text-red-800"
                                : ""
                            }
                            ${
                              selectedStudentForDetails.status === "On Leave"
                                ? "bg-gray-100 text-gray-800"
                                : ""
                            }
                          `}
                            >
                              {selectedStudentForDetails.status || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Student Information Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Basic Information */}
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <div className="p-2 bg-blue-100 rounded-lg mr-3">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          Basic Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                              Full Name
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {selectedStudentForDetails.name || "N/A"}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                              Student ID
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {selectedStudentForDetails.studentId || "N/A"}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                              Roll Number
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {selectedStudentForDetails.rollNumber || "N/A"}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                              Date of Birth
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {selectedStudentForDetails.dateOfBirth
                                ? new Date(
                                    selectedStudentForDetails.dateOfBirth
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Academic Information */}
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <div className="p-2 bg-green-100 rounded-lg mr-3">
                            <GraduationCap className="w-4 h-4 text-green-600" />
                          </div>
                          Academic Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                              Program
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {selectedStudentForDetails.program || "N/A"}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                              Program Type
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {selectedStudentForDetails.programType || "N/A"}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                              Department
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {selectedStudentForDetails.department?.name ||
                                selectedStudentForDetails.department ||
                                "N/A"}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                              Year/Semester
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              Year{" "}
                              {selectedStudentForDetails.yearOfStudy || "N/A"} •
                              Sem {selectedStudentForDetails.semester || "N/A"}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                              GPA
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {selectedStudentForDetails.gpa
                                ? selectedStudentForDetails.gpa.toFixed(2)
                                : "N/A"}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                              Academic Standing
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {selectedStudentForDetails.academicStanding ||
                                "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional sections if studentDetailSections exists */}
                    {typeof studentDetailSections !== "undefined" && (
                      <div className="mt-6 space-y-6">
                        {studentDetailSections.map((section) => (
                          <div
                            key={section.title}
                            className="bg-gray-50 rounded-xl p-6 border border-gray-100"
                          >
                            <h4 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-3 mb-4 flex items-center">
                              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                <Building2 className="w-4 h-4 text-blue-600" />
                              </div>
                              {section.title}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {section.fields.map((field) => {
                                const keys = field.key.split(".");
                                let value = selectedStudentForDetails;

                                for (const key of keys) {
                                  value = value?.[key];
                                  if (value === undefined) break;
                                }

                                const displayValue = field.format
                                  ? field.format(value)
                                  : value ?? "N/A";

                                return (
                                  <div
                                    key={field.key}
                                    className="bg-white p-3 rounded-lg border border-gray-100"
                                  >
                                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                                      {field.label}
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 break-words">
                                      {displayValue}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
                  <button
                    type="button"
                    onClick={() => setDetailsModalOpen(false)}
                    className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDetailsModalOpen(false);
                      handleEditClick(selectedStudentForDetails);
                    }}
                    className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-medium text-white rounded-lg shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Student
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
