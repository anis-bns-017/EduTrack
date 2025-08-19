import React, { useEffect, useState, useCallback, useMemo } from "react";
import AttendanceTable from "../components/AttendanceTable";
import AttendanceModal from "../components/AttendanceModal";
import axios from "../../api/axios";
import { toast } from "react-hot-toast";
import { Calendar, UserCheck, School, BookOpen, Filter, X } from 'lucide-react';

// A helper function to safely extract array data from various API response shapes
const extractArrayData = (response, key) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data[key])) return data[key];
  return [];
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
  
  // Filter states
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    student: "",
    class: "",
    course: "",
    department: "",
    status: "",
    dateFrom: "",
    dateTo: ""
  });

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [attRes, studentsRes, classesRes, coursesRes, deptRes] = await Promise.all([
        axios.get("/attendance"),
        axios.get("/students"),
        axios.get("/classes"),
        axios.get("/courses"),
        axios.get("/departments"),
      ]);
      setAttendanceList(extractArrayData(attRes, 'attendance'));
      setStudents(extractArrayData(studentsRes, 'students'));
      setClasses(extractArrayData(classesRes, 'data'));
      setCourses(extractArrayData(coursesRes, 'data'));
      setDepartments(extractArrayData(deptRes, 'data'));
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

  // --- Filter Handlers ---
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      student: "",
      class: "",
      course: "",
      department: "",
      status: "",
      dateFrom: "",
      dateTo: ""
    });
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  // Apply filters to attendance list
  const filteredAttendanceList = useMemo(() => {
    return attendanceList.filter(att => {
      // Student filter
      if (filters.student && !(
        (att.student?.name?.toLowerCase().includes(filters.student.toLowerCase()) ||
         att.student?._id?.toLowerCase().includes(filters.student.toLowerCase()))
      )) return false;
      
      // Class filter
      if (filters.class && att.class?._id !== filters.class && att.class?.className !== filters.class) return false;
      
      // Course filter
      if (filters.course && att.course?._id !== filters.course && att.course?.name !== filters.course) return false;
      
      // Department filter
      if (filters.department && att.department?._id !== filters.department && att.department?.name !== filters.department) return false;
      
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
  
  // --- Memoized Statistics for Cards ---
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaysRecords = attendanceList.filter(att => att.date === today);
    return {
      totalRecords: attendanceList.length,
      todaysRecords: todaysRecords.length,
      uniqueStudents: new Set(attendanceList.map(att => att.student?._id)).size,
      totalCourses: courses.length,
    }
  }, [attendanceList, courses]);

  // --- Unique values for filter dropdowns ---
  const uniqueStatuses = useMemo(() => {
    return [...new Set(attendanceList.map(att => att.status).filter(Boolean))];
  }, [attendanceList]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
              <span className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-2 rounded-lg">
                <UserCheck size={28} />
              </span>
              Attendance Management
            </h1>
            <p className="text-gray-600 mt-2">Track and manage student attendance records efficiently.</p>
          </div>
          <button
            onClick={handleAddNew}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-300 flex items-center gap-2"
          >
            <span className="text-lg">+</span> Add Record
          </button>
        </div>

        {/* --- Stats Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<Calendar size={24} />} title="Total Records" value={stats.totalRecords} color="blue" />
          <StatCard icon={<UserCheck size={24} />} title="Today's Records" value={stats.todaysRecords} color="green" />
          <StatCard icon={<School size={24} />} title="Tracked Students" value={stats.uniqueStudents} color="purple" />
          <StatCard icon={<BookOpen size={24} />} title="Active Courses" value={stats.totalCourses} color="yellow" />
        </div>

        {/* --- Filters Section --- */}
        <div className="bg-white rounded-xl shadow mb-8 overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Filter size={18} />
              Filters
            </h2>
            <div className="flex space-x-2">
              {hasActiveFilters && (
                <button 
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <X size={16} className="mr-1" />
                  Clear Filters
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
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <input
                  type="text"
                  placeholder="Search by name or ID"
                  value={filters.student}
                  onChange={(e) => handleFilterChange("student", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select
                  value={filters.class}
                  onChange={(e) => handleFilterChange("class", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Classes</option>
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>{c.className}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select
                  value={filters.course}
                  onChange={(e) => handleFilterChange("course", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Courses</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={filters.department}
                  onChange={(e) => handleFilterChange("department", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Statuses</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="From"
                  />
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="To"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- Results Info --- */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-700">
            Showing <span className="font-semibold">{filteredAttendanceList.length}</span> of <span className="font-semibold">{attendanceList.length}</span> records
            {hasActiveFilters && <span className="text-teal-600 ml-2">(filtered)</span>}
          </p>
        </div>

        {/* --- Main Content: Table --- */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Attendance Log</h2>
            <p className="text-gray-600 text-sm mt-1">All recorded student attendance entries.</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-cyan-600 border-opacity-50"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 px-6">
              <h3 className="text-lg font-medium text-red-700">{error}</h3>
              <p className="text-gray-500 mt-1">Please try again later.</p>
            </div>
          ) : filteredAttendanceList.length === 0 ? (
            <div className="text-center py-16 px-6">
              <span className="text-6xl text-gray-300 mb-4 block">📋</span>
              <h3 className="text-xl font-medium text-gray-900 mb-1">
                {hasActiveFilters ? "No Attendance Records Match Your Filters" : "No Attendance Records Found"}
              </h3>
              <p className="text-gray-500">
                {hasActiveFilters 
                  ? "Try adjusting your filters or clear them to see all records." 
                  : "Click 'Add Record' to create the first entry."
                }
              </p>
              {!hasActiveFilters && (
                <button
                  onClick={handleAddNew}
                  className="mt-4 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Add Record
                </button>
              )}
            </div>
          ) : (
            <AttendanceTable
              attendanceList={filteredAttendanceList}
              onEdit={handleEdit}
              onDelete={fetchData}
            />
          )}
        </div>
      </div>
      
      {/* --- Modal --- */}
      {modalOpen && (
        <AttendanceModal
          key={selectedAttendance?._id || "new-attendance"}
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

// --- Reusable StatCard Component ---
const StatCard = ({ icon, title, value, color }) => {
  const colors = {
    blue: 'border-blue-500 bg-blue-100 text-blue-600',
    green: 'border-green-500 bg-green-100 text-green-600',
    purple: 'border-purple-500 bg-purple-100 text-purple-600',
    yellow: 'border-yellow-500 bg-yellow-100 text-yellow-600',
  };
  return (
    <div className={`bg-white rounded-xl shadow p-6 border-l-4 ${colors[color]}`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colors[color]} mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};