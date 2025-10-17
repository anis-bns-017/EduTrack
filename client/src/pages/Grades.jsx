import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Lock,
  Unlock,
  Shield,
  MessageSquare,
  History,
  Eye,
  Download,
  Upload,
} from "lucide-react";
import GradeFormModal from "../components/GradeFormModal";

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // Form state - updated to match MongoDB model
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
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    creditHours: "",
    assessments: [],
    finalGrade: "",
    gradePoint: "",
    resultStatus: "In Progress",
    remarks: "",
    // NEW: Additional fields from the model
    createdBy: "",
    updatedBy: "",
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
  });

  // Filter states
  const [filters, setFilters] = useState({
    student: "",
    department: "",
    course: "",
    term: "",
    academicYear: "",
    resultStatus: "",
    moderationStatus: "",
    appealStatus: "",
    isPublished: "",
    isLocked: "",
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
    publishedCount: 0,
    lockedCount: 0,
    pendingModerationCount: 0,
    activeAppealsCount: 0,
  });

  // Get current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get("/auth/me");
        setCurrentUser(response.data);
        setFormData((prev) => ({
          ...prev,
          createdBy: response.data._id,
          updatedBy: response.data._id,
        }));
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

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
      publishedCount: 0,
      lockedCount: 0,
      pendingModerationCount: 0,
      activeAppealsCount: 0,
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

        // Count published grades
        if (grade.isPublished) {
          stats.publishedCount += 1;
        }

        // Count locked grades
        if (grade.isLocked) {
          stats.lockedCount += 1;
        }

        // Count pending moderation
        if (grade.moderationStatus === "Pending") {
          stats.pendingModerationCount += 1;
        }

        // Count active appeals
        if (["Requested", "Under Review"].includes(grade.appealStatus)) {
          stats.activeAppealsCount += 1;
        }
      });
    }

    setStatistics(stats);
  }, []);

  // Fetch data with pagination and filtering
  const fetchData = useCallback(
    async (
      page = 1,
      newFilters = filters,
      newSortBy = sortBy,
      newSortOrder = sortOrder
    ) => {
      try {
        setLoading(true);

        // Build query parameters
        const params = new URLSearchParams();
        params.append("page", page);
        params.append("limit", pageSize);
        params.append("sortBy", newSortBy);
        params.append("sortOrder", newSortOrder);

        // Add filters to params
        Object.entries(newFilters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });

        // Add search term if exists
        if (searchTerm) params.append("search", searchTerm);

        const [
          gradesRes,
          studentsRes,
          departmentsRes,
          coursesRes,
          facultyRes,
          teachersRes,
        ] = await Promise.all([
          axios.get(`/grades?${params.toString()}`),
          axios.get("/students"),
          axios.get("/departments"),
          axios.get("/courses"),
          axios.get("/faculties"),
          axios.get("/teachers"),
        ]);

        console.log("Grades Response:", gradesRes);

        // Set teachers state
        setTeachers(
          Array.isArray(teachersRes?.data?.data) ? teachersRes.data.data : []
        );

        const gradeData = Array.isArray(gradesRes.data.grades)
          ? gradesRes.data.grades
          : [];
        setGrades(gradeData);
        console.log("Grades for me: ", gradeData);
        setStudents(
          Array.isArray(studentsRes.data.data) ? studentsRes.data.data : []
        );
        setDepartments(
          Array.isArray(departmentsRes.data.data)
            ? departmentsRes.data.data
            : []
        );
        setCourses(
          Array.isArray(coursesRes.data?.data) ? coursesRes.data.data : []
        );
        setFaculty(Array.isArray(facultyRes.data) ? facultyRes.data : []);

        // Set pagination info
        setTotalPages(gradesRes.data.pages || 1);
        setCurrentPage(gradesRes.data.page || 1);

        calculateStatistics(gradeData);
      } catch (error) {
        console.error("Fetch error:", error.response?.data || error.message);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    },
    [filters, sortBy, sortOrder, pageSize, searchTerm, calculateStatistics]
  );

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle create grade
  const handleCreateGrade = async (gradeData) => {
    try {
      await axios.post("/grades", gradeData);
      toast.success("Grade created successfully!");
      fetchData(currentPage);
      setModalOpen(false);
    } catch (error) {
      console.error("Create error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to create grade");
    }
  };

  // Handle update grade
  const handleUpdateGrade = async (id, gradeData) => {
    try {
      await axios.put(`/grades/${id}`, gradeData);
      toast.success("Grade updated successfully!");
      fetchData(currentPage);
      setModalOpen(false);
    } catch (error) {
      console.error("Update error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to update grade");
    }
  };

  // Handle delete grade
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this grade?")) {
      try {
        await axios.delete(`/grades/${id}`);
        toast.success("Grade deleted");
        fetchData(currentPage);
      } catch (error) {
        console.error("Delete error:", error.response?.data || error.message);
        toast.error(error.response?.data?.message || "Failed to delete grade");
      }
    }
  };

  // Handle lock/unlock grade
  const handleToggleLock = async (id, isLocked) => {
    try {
      if (isLocked) {
        await axios.post(`/grades/${id}/unlock`);
        toast.success("Grade unlocked successfully!");
      } else {
        await axios.post(`/grades/${id}/lock`);
        toast.success("Grade locked successfully!");
      }
      fetchData(currentPage);
    } catch (error) {
      console.error("Lock error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message || "Failed to toggle lock status"
      );
    }
  };

  // Handle publish/unpublish grade
  const handleTogglePublish = async (id, isPublished) => {
    try {
      await axios.patch(`/grades/${id}/publish`, { isPublished: !isPublished });
      toast.success(
        `Grade ${!isPublished ? "published" : "unpublished"} successfully!`
      );
      fetchData(currentPage);
    } catch (error) {
      console.error("Publish error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message || "Failed to toggle publish status"
      );
    }
  };

  

  // Handle submit for moderation
  const handleSubmitForModeration = async (id) => {
    try {
      await axios.post(`/grades/${id}/moderate`);
      toast.success("Grade submitted for moderation!");
      fetchData(currentPage);
    } catch (error) {
      console.error("Moderation error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message || "Failed to submit for moderation"
      );
    }
  };

  // Handle approve moderation
  const handleApproveModeration = async (id) => {
    try {
      await axios.post(`/grades/${id}/moderate/approve`);
      toast.success("Grade moderation approved!");
      fetchData(currentPage);
    } catch (error) {
      console.error("Approve error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message || "Failed to approve moderation"
      );
    }
  };

  // Handle reject moderation
  const handleRejectModeration = async (id) => {
    try {
      await axios.post(`/grades/${id}/moderate/reject`);
      toast.success("Grade moderation rejected!");
      fetchData(currentPage);
    } catch (error) {
      console.error("Reject error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message || "Failed to reject moderation"
      );
    }
  };

  // Handle submit appeal
  const handleSubmitAppeal = async (id, reason) => {
    try {
      await axios.post(`/grades/${id}/appeal`, { reason });
      toast.success("Grade appeal submitted!");
      fetchData(currentPage);
    } catch (error) {
      console.error("Appeal error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to submit appeal");
    }
  };

  // Handle decide appeal
  const handleDecideAppeal = async (id, decision, decisionReason) => {
    try {
      await axios.post(`/grades/${id}/appeal/decide`, {
        decision,
        decisionReason,
      });
      toast.success(`Grade appeal ${decision.toLowerCase()}!`);
      fetchData(currentPage);
    } catch (error) {
      console.error(
        "Appeal decision error:",
        error.response?.data || error.message
      );
      toast.error(error.response?.data?.message || "Failed to decide appeal");
    }
  };

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Handle sort changes
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchData(page, filters, sortBy, sortOrder);
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
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
      moderationStatus: "",
      appealStatus: "",
      isPublished: "",
      isLocked: "",
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
    fetchData(1, filters, sortBy, sortOrder);
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      Object.values(filters).some((value) => value !== "") || searchTerm !== ""
    );
  }, [filters, searchTerm]);

  // Open modal for adding new grade
  const openAddModal = () => {
    setFormData({
      student: "",
      department: "",
      program: "",
      course: "",
      section: "",
      instructor: "",
      term: "",
      year: "",
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
      createdBy: currentUser?._id || "",
      updatedBy: currentUser?._id || "",
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
      program: grade.program || "",
      course: grade.course?._id || "",
      section: grade.section || "",
      instructor: grade.instructor?._id || "",
      term: grade.term || "",
      year: grade.year?.toString() || "",
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
      createdBy: grade.createdBy || "",
      updatedBy: currentUser?._id || "",
      isLocked: grade.isLocked || false,
      lockedBy: grade.lockedBy || "",
      lockedAt: grade.lockedAt || null,
      moderationStatus: grade.moderationStatus || "None",
      moderatedBy: grade.moderatedBy || "",
      moderatedAt: grade.moderatedAt || null,
      moderationNotes: grade.moderationNotes || "",
      appealStatus: grade.appealStatus || "None",
      appealReason: grade.appealReason || "",
      appealDecision: grade.appealDecision || "",
      appealDecidedBy: grade.appealDecidedBy || "",
      appealDecidedDate: grade.appealDecidedDate || null,
      isPublished: grade.isPublished || false,
      publishedBy: grade.publishedBy || "",
      publishedDate: grade.publishedDate || null,
      version: grade.version || 1,
    });
    setEditId(grade._id);
    setModalOpen(true);
  };

  // Handle viewing grade details
  const handleViewDetails = (grade) => {
    setSelectedGrade(grade);
    setShowDetailsModal(true);
  };

  // Get status color for UI
  const getStatusColor = (status) => {
    switch (status) {
      case "Pass":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "Fail":
        return "bg-red-100 text-red-800 border border-red-200";
      case "Incomplete":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Withdrawn":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Get status icon for UI
  const getStatusIcon = (status) => {
    switch (status) {
      case "Pass":
        return <CheckCircle className="w-4 h-4" />;
      case "Fail":
        return <XCircle className="w-4 h-4" />;
      case "Incomplete":
        return <Clock className="w-4 h-4" />;
      case "Withdrawn":
        return <X className="w-4 h-4" />;
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

  // Get moderation status color
  const getModerationColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Approved":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Get appeal status color
  const getAppealColor = (status) => {
    switch (status) {
      case "Requested":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Under Review":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "Approved":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
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
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button
                onClick={() =>
                  toast.success("Export functionality will be implemented")
                }
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-md"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </button>
              <button
                onClick={() =>
                  toast.success("Import functionality will be implemented")
                }
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-md"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import
              </button>
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

      <div className="max-w-8xl mx-auto px-3 sm:px-4 lg:px-6 mt-4 md:mt-8">
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

        {/* Additional Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Published Grades Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full opacity-10 blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
                    Published Grades
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {statistics.publishedCount}
                  </p>
                  <div className="flex items-center mt-2 text-xs md:text-sm text-green-600">
                    <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span>Visible to students</span>
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <Eye className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Locked Grades Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full opacity-10 blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
                    Locked Grades
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {statistics.lockedCount}
                  </p>
                  <div className="flex items-center mt-2 text-xs md:text-sm text-red-600">
                    <Lock className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span>Cannot be edited</span>
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl shadow-lg">
                  <Lock className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Pending Moderation Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full opacity-10 blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
                    Pending Moderation
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {statistics.pendingModerationCount}
                  </p>
                  <div className="flex items-center mt-2 text-xs md:text-sm text-yellow-600">
                    <Shield className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span>Awaiting review</span>
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl shadow-lg">
                  <Shield className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Appeals Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full opacity-10 blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">
                    Active Appeals
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">
                    {statistics.activeAppealsCount}
                  </p>
                  <div className="flex items-center mt-2 text-xs md:text-sm text-purple-600">
                    <MessageSquare className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span>Under review</span>
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                  <MessageSquare className="h-6 w-6 md:h-8 md:w-8 text-white" />
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
                onClick={() =>
                  fetchData(currentPage, filters, sortBy, sortOrder)
                }
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
                          Object.values(filters).filter((v) => v).length +
                          (searchTerm ? 1 : 0)
                        } filter${
                          Object.values(filters).filter((v) => v).length +
                            (searchTerm ? 1 : 0) >
                          1
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
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by student name, ID, course, etc."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

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
                    <option value="Incomplete">Incomplete</option>
                    <option value="Withdrawn">Withdrawn</option>
                  </select>
                </div>

                {/* Moderation Status Filter */}
                <div className="space-y-2">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Moderation Status
                  </label>
                  <select
                    value={filters.moderationStatus}
                    onChange={(e) =>
                      handleFilterChange("moderationStatus", e.target.value)
                    }
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Statuses</option>
                    <option value="None">None</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* Appeal Status Filter */}
                <div className="space-y-2">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Appeal Status
                  </label>
                  <select
                    value={filters.appealStatus}
                    onChange={(e) =>
                      handleFilterChange("appealStatus", e.target.value)
                    }
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Statuses</option>
                    <option value="None">None</option>
                    <option value="Requested">Requested</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* Published Status Filter */}
                <div className="space-y-2">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Published Status
                  </label>
                  <select
                    value={filters.isPublished}
                    onChange={(e) =>
                      handleFilterChange("isPublished", e.target.value)
                    }
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Statuses</option>
                    <option value="true">Published</option>
                    <option value="false">Not Published</option>
                  </select>
                </div>

                {/* Locked Status Filter */}
                <div className="space-y-2">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Locked Status
                  </label>
                  <select
                    value={filters.isLocked}
                    onChange={(e) =>
                      handleFilterChange("isLocked", e.target.value)
                    }
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Statuses</option>
                    <option value="true">Locked</option>
                    <option value="false">Unlocked</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={applyFilters}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Apply Filters
                </button>
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
                <span className="font-bold text-blue-600">{grades.length}</span>
                of
                <span className="font-bold text-gray-900">
                  {statistics.total}
                </span>
                grades
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Page {currentPage} of {totalPages}
              </p>
            </div>
          </div>
          {grades.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  toast.success("Export functionality will be implemented")
                }
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm font-semibold"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
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
                    {grades.length > 0
                      ? `Displaying ${grades.length} of ${statistics.total} grades`
                      : "No grades found matching your search criteria"}
                  </p>
                </div>
              </div>

              {/* Sort Options */}
              <div className="flex items-center space-x-2">
                <span className="text-xs md:text-sm text-gray-600">
                  Sort by:
                </span>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-");
                    setSortBy(field);
                    setSortOrder(order);
                    fetchData(currentPage, filters, field, order);
                  }}
                  className="text-xs md:text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="student-asc">Student Name (A-Z)</option>
                  <option value="student-desc">Student Name (Z-A)</option>
                  <option value="finalGrade-desc">Grade (High to Low)</option>
                  <option value="finalGrade-asc">Grade (Low to High)</option>
                  <option value="percentage-desc">
                    Percentage (High to Low)
                  </option>
                  <option value="percentage-asc">
                    Percentage (Low to High)
                  </option>
                </select>
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
            ) : grades.length === 0 ? (
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
                    <th
                      className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange("student")}
                    >
                      <div className="flex items-center">
                        Student
                        {sortBy === "student" &&
                          (sortOrder === "asc" ? (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4 rotate-180" />
                          ))}
                      </div>
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
                    <th
                      className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSortChange("finalGrade")}
                    >
                      <div className="flex items-center">
                        Final Grade
                        {sortBy === "finalGrade" &&
                          (sortOrder === "asc" ? (
                            <ChevronDown className="ml-1 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-1 h-4 w-4 rotate-180" />
                          ))}
                      </div>
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Published
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Locked
                    </th>
                    <th className="px-4 md:px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {grades.map((g) => (
                    <tr
                      key={g._id}
                      className={`hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200`}
                    >
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                              {(() => {
                                if (g.student?.name)
                                  return g.student.name.charAt(0).toUpperCase();
                                if (g.student?.user?.firstName)
                                  return g.student.user.firstName
                                    .charAt(0)
                                    .toUpperCase();
                                if (g.student?.studentId)
                                  return g.student.studentId
                                    .charAt(0)
                                    .toUpperCase();
                                return "S";
                              })()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {(() => {
                                if (g.student?.name) return g.student.name;
                                if (
                                  g.student?.user?.firstName &&
                                  g.student?.user?.lastName
                                )
                                  return `${g.student.user.firstName} ${g.student.user.lastName}`;
                                return "N/A";
                              })()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {(() => {
                                if (g.student?.studentId)
                                  return g.student.studentId;
                                return "N/A";
                              })()}
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
                        <div className="flex items-center">
                          <span
                            className={`text-lg font-bold ${getGradeColor(
                              g.finalGrade
                            )}`}
                          >
                            {g.finalGrade || "N/A"}
                          </span>
                          {g.gradePoint && (
                            <span className="ml-2 text-xs text-gray-500">
                              ({g.gradePoint.toFixed(2)})
                            </span>
                          )}
                        </div>
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
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                            g.isPublished
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {g.isPublished ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Published
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Draft
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                            g.isLocked
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {g.isLocked ? (
                            <>
                              <Lock className="w-3 h-3 mr-1" />
                              Locked
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3 h-3 mr-1" />
                              Unlocked
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewDetails(g)}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-all duration-200"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(g)}
                            className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded-lg transition-all duration-200"
                            title="Edit grade"
                            disabled={g.isLocked}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleLock(g._id, g.isLocked)}
                            className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-100 rounded-lg transition-all duration-200"
                            title={g.isLocked ? "Unlock grade" : "Lock grade"}
                          >
                            {g.isLocked ? (
                              <Unlock className="w-4 h-4" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleTogglePublish(g._id, g.isPublished)
                            }
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-100 rounded-lg transition-all duration-200"
                            title={
                              g.isPublished
                                ? "Unpublish grade"
                                : "Publish grade"
                            }
                          >
                            {g.isPublished ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(g._id)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-all duration-200"
                            title="Delete grade"
                            disabled={g.isLocked}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page{" "}
                    <span className="font-medium">{currentPage}</span> of{" "}
                    <span className="font-medium">{totalPages}</span> pages
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronDown className="h-5 w-5 rotate-90" />
                    </button>

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronDown className="h-5 w-5 -rotate-90" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grade Form Modal */}

      {modalOpen && (
        <GradeFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={(gradeData) => {
            if (editId) {
              handleUpdateGrade(editId, gradeData);
            } else {
              handleCreateGrade(gradeData);
            }
          }}
          initialData={editId ? grades.find((g) => g._id === editId) : null}
          students={students}
          courses={courses}
          departments={departments}
          teachers={teachers}
          currentUser={currentUser} // Make sure this is passed
        />
      )}

      {/* Grade Details Modal */}
      {showDetailsModal && selectedGrade && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-500 bg-opacity-20 p-2 rounded-lg">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Grade Details</h2>
                    <p className="text-indigo-200 text-sm">
                      Comprehensive grade information
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="bg-red-500 bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all duration-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-indigo-600" />
                    Student Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">
                        {selectedGrade.student?.name ||
                          `${selectedGrade.student?.user?.firstName || ""} ${
                            selectedGrade.student?.user?.lastName || ""
                          }` ||
                          "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Student ID</p>
                      <p className="font-medium">
                        {selectedGrade.student?.studentId || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">
                        {selectedGrade.student?.email || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Course Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
                    Course Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Course</p>
                      <p className="font-medium">
                        {selectedGrade.course?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Code</p>
                      <p className="font-medium">
                        {selectedGrade.course?.code || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium">
                        {selectedGrade.department?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Instructor</p>
                      <p className="font-medium">
                        {selectedGrade.instructor?.name || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                    Academic Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Term</p>
                      <p className="font-medium">
                        {selectedGrade.term || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Academic Year</p>
                      <p className="font-medium">
                        {selectedGrade.academicYear || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Year</p>
                      <p className="font-medium">
                        {selectedGrade.year || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Semester</p>
                      <p className="font-medium">
                        {selectedGrade.semester || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Credit Hours</p>
                      <p className="font-medium">
                        {selectedGrade.creditHours || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grade Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-indigo-600" />
                    Grade Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Final Grade</p>
                      <p
                        className={`text-2xl font-bold ${getGradeColor(
                          selectedGrade.finalGrade
                        )}`}
                      >
                        {selectedGrade.finalGrade || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Grade Point</p>
                      <p className="font-medium">
                        {selectedGrade.gradePoint || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Percentage</p>
                      <p className="font-medium">
                        {selectedGrade.percentage || "N/A"}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Result Status</p>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          selectedGrade.resultStatus
                        )}`}
                      >
                        {getStatusIcon(selectedGrade.resultStatus)}
                        <span className="ml-1">
                          {selectedGrade.resultStatus || "N/A"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-indigo-600" />
                    Status Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Published Status</p>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          selectedGrade.isPublished
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedGrade.isPublished ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Published
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Draft
                          </>
                        )}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Lock Status</p>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          selectedGrade.isLocked
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {selectedGrade.isLocked ? (
                          <>
                            <Lock className="w-3 h-3 mr-1" />
                            Locked
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3 h-3 mr-1" />
                            Unlocked
                          </>
                        )}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Moderation Status</p>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getModerationColor(
                          selectedGrade.moderationStatus
                        )}`}
                      >
                        {selectedGrade.moderationStatus || "N/A"}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Appeal Status</p>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getAppealColor(
                          selectedGrade.appealStatus
                        )}`}
                      >
                        {selectedGrade.appealStatus || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <History className="h-5 w-5 mr-2 text-indigo-600" />
                    Timestamps
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Created At</p>
                      <p className="font-medium">
                        {selectedGrade.createdAt
                          ? new Date(selectedGrade.createdAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Updated At</p>
                      <p className="font-medium">
                        {selectedGrade.updatedAt
                          ? new Date(selectedGrade.updatedAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Published At</p>
                      <p className="font-medium">
                        {selectedGrade.publishedDate
                          ? new Date(
                              selectedGrade.publishedDate
                            ).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Version</p>
                      <p className="font-medium">
                        {selectedGrade.version || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assessments */}
              {selectedGrade.assessments &&
                selectedGrade.assessments.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Calculator className="h-5 w-5 mr-2 text-indigo-600" />
                      Assessments
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Score
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Weight
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedGrade.assessments.map(
                            (assessment, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {assessment.title}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {assessment.assessmentType}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {assessment.score}/{assessment.maxScore}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {assessment.weight}%
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
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
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              {/* Remarks */}
              {selectedGrade.remarks && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                    Remarks
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-700">{selectedGrade.remarks}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => handleEdit(selectedGrade)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={selectedGrade.isLocked}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Grades;
