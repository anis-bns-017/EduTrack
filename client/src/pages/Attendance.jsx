import React, { useEffect, useState, useCallback, useMemo } from "react";
import AttendanceModal from "../components/AttendanceModal";
import axios from "../../api/axios";
import { toast } from "react-hot-toast";
import {
  Calendar,
  UserCheck,
  School,
  BookOpen,
  Filter,
  X,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Plus,
  RefreshCw,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import AttendanceTable from "../components/AttendanceTable";

// A helper function to safely extract array data from various API response shapes
const extractArrayData = (response, key) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data[key])) return data[key];
  return [];
};

// Helper function to get student name from ID or object
const getStudentName = (student, studentsList) => {
  if (!student) return "Unknown";
  
  // If student is already an object with name
  if (typeof student === 'object' && student.name) {
    return student.name;
  }
  
  // If student is an ID string
  const studentId = typeof student === 'string' ? student : student._id || student.id;
  if (!studentId) return "Unknown";
  
  // Find student in the students list
  const foundStudent = studentsList.find(s => 
    (s._id === studentId || s.id === studentId)
  );
  
  return foundStudent ? foundStudent.name : "Unknown";
};

export default function Attendance() {
  // --- State Management ---
  const [attendanceList, setAttendanceList] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  
  // New states for better UI feedback
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  
  // Filter states
  const [filters, setFilters] = useState({
    student: "",
    class: "",
    course: "",
    department: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });

  // Statistics state
  const [statistics, setStatistics] = useState({
    totalRecords: 0,
    todaysRecords: 0,
    uniqueStudents: 0,
    totalCourses: 0,
    presentRate: 0,
    absentRate: 0,
    byStatus: {},
    byDepartment: {},
    growthRate: 0,
  });

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [attRes, studentsRes, classesRes, coursesRes, deptRes] =
        await Promise.all([
          axios.get("/attendance"),
          axios.get("/students"),
          axios.get("/classes"),
          axios.get("/courses"),
          axios.get("/departments"),
        ]);
      
      const attendanceData = extractArrayData(attRes, "attendance");
      const studentsData = extractArrayData(studentsRes.data, "students");
      const classesData = extractArrayData(classesRes, "data");
      const coursesData = extractArrayData(coursesRes, "data");
      const departmentsData = extractArrayData(deptRes, "data");
      
      // Enrich attendance data with complete student information
      const enrichedAttendance = attendanceData.map(att => {
        // Handle student data - it could be an ID string or an object
        let studentData = att.student;
        if (typeof att.student === 'string') {
          // If student is just an ID, find the full student object
          const student = studentsData.find(s => s._id === att.student || s.id === att.student);
          studentData = student || { _id: att.student, name: "Unknown Student" };
        } else if (att.student && !att.student.name) {
          // If student is an object but missing name, try to find it
          const student = studentsData.find(s => s._id === att.student._id || s.id === att.student.id);
          studentData = student || { ...att.student, name: "Unknown Student" };
        }
        
        // Handle class data - it could be an ID string or an object
        let classData = att.class;
        if (typeof att.class === 'string') {
          const classObj = classesData.find(c => c._id === att.class || c.id === att.class);
          classData = classObj || { _id: att.class, className: "Unknown Class" };
        }
        
        // Handle course data - it could be an ID string or an object
        let courseData = att.course;
        if (typeof att.course === 'string') {
          const courseObj = coursesData.find(c => c._id === att.course || c.id === att.course);
          courseData = courseObj || { _id: att.course, name: "Unknown Course" };
        }
        
        // Handle department data - it could be an ID string or an object
        let departmentData = att.department;
        if (typeof att.department === 'string') {
          const deptObj = departmentsData.find(d => d._id === att.department || d.id === att.department);
          departmentData = deptObj || { _id: att.department, name: "Unknown Department" };
        }
        
        return {
          ...att,
          student: studentData,
          class: classData,
          course: courseData,
          department: departmentData
        };
      });
      
      setAttendanceList(enrichedAttendance);
      setStudents(studentsData);
      setClasses(classesData);
      setCourses(coursesData);
      setDepartments(departmentsData);

      // Calculate statistics
      const today = new Date().toISOString().split("T")[0];
      const todaysRecords = attendanceData.filter((att) => att.date === today);
      const uniqueStudents = new Set(attendanceData.map((att) => att.student?._id || att.student?.id)).size;
      
      const presentCount = attendanceData.filter(att => att.status === 'Present').length;
      const absentCount = attendanceData.filter(att => att.status === 'Absent').length;
      const totalCount = attendanceData.length;
      
      const stats = {
        totalRecords: totalCount,
        todaysRecords: todaysRecords.length,
        uniqueStudents: uniqueStudents,
        totalCourses: coursesData.length,
        presentRate: totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0,
        absentRate: totalCount > 0 ? Math.round((absentCount / totalCount) * 100) : 0,
        byStatus: {
          Present: presentCount,
          Absent: absentCount,
          Late: attendanceData.filter(att => att.status === 'Late').length,
          Excused: attendanceData.filter(att => att.status === 'Excused').length,
        },
        byDepartment: {},
        growthRate: Math.floor(Math.random() * 20) + 5, // Mock growth rate
      };

      // Calculate department distribution
      attendanceData.forEach(att => {
        const deptName = att.department?.name || att.department || 'Unknown';
        stats.byDepartment[deptName] = (stats.byDepartment[deptName] || 0) + 1;
      });

      setStatistics(stats);
    } catch (err) {
      toast.error("Failed to load data. Please check your connection.");
      setError("Could not fetch attendance data.");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/attendance/${id}`);
      toast.success("Attendance record deleted successfully.");
      fetchData(); // Refetch data after deletion
    } catch (err) {
      toast.error("Failed to delete attendance record.");
      console.error("Error deleting record:", err);
    }
  };

  // --- Filter Handlers ---
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      student: "",
      class: "",
      course: "",
      department: "",
      status: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  // Apply filters to attendance list
  const filteredAttendanceList = useMemo(() => {
    return attendanceList.filter((att) => {
      // Student filter - handle both name and ID
      if (filters.student) {
        const studentName = att.student?.name || "Unknown";
        const studentId = att.student?._id || att.student?.id || "";
        
        if (
          !studentName.toLowerCase().includes(filters.student.toLowerCase()) &&
          !studentId.toLowerCase().includes(filters.student.toLowerCase())
        ) {
          return false;
        }
      }
      
      // Class filter - handle both ID and className
      if (filters.class) {
        const classId = att.class?._id || att.class?.id || "";
        const className = att.class?.className || "";
        
        if (
          classId !== filters.class &&
          !className.toLowerCase().includes(filters.class.toLowerCase())
        ) {
          return false;
        }
      }
      
      // Course filter - handle both ID and name
      if (filters.course) {
        const courseId = att.course?._id || att.course?.id || "";
        const courseName = att.course?.name || "";
        
        if (
          courseId !== filters.course &&
          !courseName.toLowerCase().includes(filters.course.toLowerCase())
        ) {
          return false;
        }
      }
      
      // Department filter - handle both ID and name
      if (filters.department) {
        const departmentId = att.department?._id || att.department?.id || "";
        const departmentName = att.department?.name || "";
        
        if (
          departmentId !== filters.department &&
          !departmentName.toLowerCase().includes(filters.department.toLowerCase())
        ) {
          return false;
        }
      }
      
      // Status filter
      if (filters.status && att.status !== filters.status) return false;
      
      // Date range filter
      if (filters.dateFrom && att.date < filters.dateFrom) return false;
      if (filters.dateTo && att.date > filters.dateTo) return false;
      
      return true;
    });
  }, [attendanceList, filters]);

  // --- Event Handlers (memoized with useCallback) ---
  const handleEdit = useCallback((item) => {
    setSelectedAttendance(item);
    setModalOpen(true);
  }, []);

  const handleAddNew = useCallback(() => {
    setSelectedAttendance(null);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedAttendance(null);
    setModalOpen(false);
  }, []);

  const handleSuccess = useCallback(() => {
    fetchData(); // Refetch data on successful add/edit
    handleCloseModal();
  }, [fetchData, handleCloseModal]);

  // --- Unique values for filter dropdowns ---
  const uniqueStatuses = useMemo(() => {
    return [
      ...new Set(attendanceList.map((att) => att.status).filter(Boolean)),
    ];
  }, [attendanceList]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 md:p-3 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl shadow-lg">
                <UserCheck className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-teal-700 bg-clip-text text-transparent">
                  Attendance Management
                </h1>
                <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600 font-medium hidden md:block">
                  Track and manage student attendance records efficiently
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={handleAddNew}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add New Record
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 mt-4 md:mt-8">
        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Total Records Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full opacity-10 blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Total Records</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">{statistics.totalRecords}</p>
                  <div className="flex items-center mt-2 text-xs md:text-sm text-green-600">
                    <TrendingUp className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span>+{statistics.growthRate}% from last month</span>
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                  <Calendar className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Today's Records Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full opacity-10 blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Today's Records</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">{statistics.todaysRecords}</p>
                  <div className="flex items-center mt-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full" 
                        style={{ width: `${statistics.totalRecords > 0 ? (statistics.todaysRecords / statistics.totalRecords) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs md:text-sm text-gray-600">
                      {statistics.totalRecords > 0 ? Math.round((statistics.todaysRecords / statistics.totalRecords) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl shadow-lg">
                  <Clock className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Present Rate Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full opacity-10 blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Present Rate</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">{statistics.presentRate}%</p>
                  <div className="flex items-center mt-2 text-xs md:text-sm text-purple-600">
                    <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span>Attendance excellence</span>
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl shadow-lg">
                  <UserCheck className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Tracked Students Card */}
          <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full opacity-10 blur-xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">Tracked Students</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">{statistics.uniqueStudents}</p>
                  <div className="flex items-center mt-2 text-xs md:text-sm text-orange-600">
                    <Users className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span>Active students</span>
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg">
                  <School className="h-6 w-6 md:h-8 md:w-8 text-white" />
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
                    status === 'Present' ? 'bg-emerald-100 text-emerald-600' :
                    status === 'Absent' ? 'bg-red-100 text-red-600' :
                    status === 'Late' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {status === 'Present' ? <CheckCircle className="h-4 w-4 md:h-5 md:w-5" /> :
                     status === 'Absent' ? <XCircle className="h-4 w-4 md:h-5 md:w-5" /> :
                     status === 'Late' ? <Clock className="h-4 w-4 md:h-5 md:w-5" /> :
                     <AlertTriangle className="h-4 w-4 md:h-5 md:w-5" />}
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
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all duration-200 shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Record
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide' : 'Show'} Filters
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

        {/* Enhanced Filters Section */}
        <div className="bg-white shadow-lg md:shadow-xl rounded-xl md:rounded-2xl border border-gray-100 mb-4 md:mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="p-1.5 md:p-2 bg-teal-100 rounded-lg">
                  <Filter className="h-4 w-4 md:h-5 md:w-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    Search & Filter Records
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    {hasActiveFilters
                      ? `${Object.values(filters).filter(v => v).length} filter${Object.values(filters).filter(v => v).length > 1 ? "s" : ""} applied`
                      : "Search by student, class, course, or apply filters"}
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
                </button>
              </div>
            </div>
          </div>
          
          {/* Animated Filter Content */}
          <div className={`transition-all duration-300 ease-in-out ${showFilters ? "max-h-screen opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}>
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Student Filter */}
                <div className="space-y-2">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Student</label>
                  <input
                    type="text"
                    placeholder="Search by name or ID"
                    value={filters.student}
                    onChange={(e) => handleFilterChange("student", e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                {/* Class Filter */}
                <div className="space-y-2">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    value={filters.class}
                    onChange={(e) => handleFilterChange("class", e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Classes</option>
                    {classes.map((c) => (
                      <option key={c._id || c.id} value={c._id || c.id}>
                        {c.className}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Course Filter */}
                <div className="space-y-2">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Course</label>
                  <select
                    value={filters.course}
                    onChange={(e) => handleFilterChange("course", e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Courses</option>
                    {courses.map((c) => (
                      <option key={c._id || c.id} value={c._id || c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Department Filter */}
                <div className="space-y-2">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={filters.department}
                    onChange={(e) => handleFilterChange("department", e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d._id || d.id} value={d._id || d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Statuses</option>
                    {uniqueStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Date Range Filter */}
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      placeholder="From"
                    />
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      placeholder="To"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4 md:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Calendar className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Showing <span className="font-bold text-teal-600">{filteredAttendanceList.length}</span> of{" "}
                <span className="font-bold text-gray-900">{attendanceList.length}</span> records
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {filteredAttendanceList.length === attendanceList.length
                  ? "All records displayed"
                  : "Filtered results"}
              </p>
            </div>
          </div>
          {filteredAttendanceList.length > 0 && (
            <button
              onClick={() => toast.success("Export functionality will be implemented")}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm font-semibold"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Export Report
            </button>
          )}
        </div>

        {/* Main Content: Table */}
        <div className="bg-white shadow-lg rounded-xl md:rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-4 md:px-6 py-3 md:py-5 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="p-1.5 md:p-2 bg-teal-100 rounded-lg">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    Attendance Log
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    {filteredAttendanceList.length > 0
                      ? `Displaying ${filteredAttendanceList.length} of ${attendanceList.length} records`
                      : "No attendance records found matching your search criteria"}
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
                  <span>Loading attendance data...</span>
                </div>
              </div>
            ) : error ? (
              <div className="p-8 md:p-12 text-center">
                <div className="text-red-500 font-medium mb-3 md:mb-4 text-sm md:text-base">{error}</div>
                <button
                  onClick={fetchData}
                  className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 rounded-lg shadow-sm text-xs md:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  <RefreshCw className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                  Try Again
                </button>
              </div>
            ) : filteredAttendanceList.length === 0 ? (
              <div className="p-8 md:p-12 text-center">
                <div className="flex flex-col items-center justify-center">
                  <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <Calendar className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg md:text-xl font-medium text-gray-900 mb-2">
                    {hasActiveFilters
                      ? "No Attendance Records Match Your Filters"
                      : "No Attendance Records Found"}
                  </h3>
                  <p className="text-sm md:text-base text-gray-500 mb-6">
                    {hasActiveFilters
                      ? "Try adjusting your filters or clear them to see all records."
                      : "Click 'Add New Record' to create the first entry."}
                  </p>
                  {!hasActiveFilters && (
                    <button
                      onClick={handleAddNew}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-base font-semibold"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Your First Record
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <AttendanceTable
                attendanceList={filteredAttendanceList}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </div>

      {/* --- Modal --- */}
      {modalOpen && (
        <AttendanceModal
          key={selectedAttendance?._id || selectedAttendance?.id || "new-attendance"}
          isOpen={modalOpen}
          onClose={handleCloseModal}
          students={students}
          classes={classes}
          courses={courses}
          departments={departments}
          selectedAttendance={selectedAttendance}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}