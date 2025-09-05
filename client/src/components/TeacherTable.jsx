"use client";
import React, { useState } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiEye,
  FiAward,
  FiBook,
  FiBriefcase,
  FiCalendar,
  FiMapPin,
  FiPhone,
  FiMail,
  FiUser,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import {
  FaChalkboardTeacher,
  FaRegCalendarAlt,
  FaRegEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaDoorOpen,
  FaBusinessTime,
  FaIdCard,
  FaUserTie,
} from "react-icons/fa";

export default function TeacherCards({
  teachers,
  onEdit,
  onDelete,
  onViewDetails,
  statusColors,
  designationColors,
}) {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedCard, setExpandedCard] = useState(null);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Helper function to format experience
  const formatExperience = (experience) => {
    if (!experience) return "-";
    if (typeof experience === "object") {
      const { teaching = 0, industry = 0, research = 0 } = experience;
      return teaching + industry + research; // Return total years
    }
    return experience;
  };

  // Helper function to get department name
  const getDepartmentName = (department) => {
    if (!department) return "-";
    return typeof department === "object" ? department.name : department;
  };

  // Helper function to format address
  const formatAddress = (address) => {
    if (!address) return "-";
    const { street, city, state, postalCode, country } = address;
    const parts = [street, city, state, postalCode, country].filter(Boolean);
    return parts.join(", ") || "-";
  };

  // Sorting function
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
    setSortDropdownOpen(false);
  };

  // Filter and sort teachers
  const filteredTeachers = teachers
    .filter((teacher) => {
      const matchesSearch = 
        (teacher.employeeId && teacher.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (teacher.firstName && teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (teacher.lastName && teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (teacher.email && teacher.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (teacher.department && getDepartmentName(teacher.department).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (teacher.designation && teacher.designation.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus =
        statusFilter === "all" ||
        (teacher.status && teacher.status.toLowerCase() === statusFilter);
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Handle department object sorting
      if (sortConfig.key === "department" && typeof aValue === "object") {
        aValue = aValue?.name || "";
        bValue = bValue?.name || "";
      }
      
      // Handle experience object sorting
      if (sortConfig.key === "experience" && typeof aValue === "object") {
        aValue = (aValue?.teaching || 0) + (aValue?.industry || 0) + (aValue?.research || 0);
        bValue = (bValue?.teaching || 0) + (bValue?.industry || 0) + (bValue?.research || 0);
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm";
      case "on leave":
      case "sabbatical":
        return "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 shadow-sm";
      case "inactive":
        return "bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200 shadow-sm";
      case "retired":
      case "resigned":
      case "terminated":
        return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 shadow-sm";
      default:
        return "bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 border border-rose-200 shadow-sm";
    }
  };

  const sortOptions = [
    { key: "firstName", label: "Name", icon: <FaChalkboardTeacher className="mr-2" /> },
    { key: "employeeId", label: "ID", icon: <FaIdCard className="mr-2" /> },
    { key: "department", label: "Department", icon: <FiBook className="mr-2" /> },
    { key: "designation", label: "Designation", icon: <FaUserTie className="mr-2" /> },
    { key: "experience", label: "Experience", icon: <FaBusinessTime className="mr-2" /> },
    { key: "joiningDate", label: "Join Date", icon: <FaRegCalendarAlt className="mr-2" /> },
    { key: "status", label: "Status", icon: <FiUser className="mr-2" /> },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200/60 backdrop-blur-sm">
      <div className="p-6 bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 border-b border-slate-200/80">
        <div className="flex flex-wrap items-center justify-between gap-6">
          {/* Search Bar */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3.5 border border-slate-300/60 rounded-xl bg-white/80 backdrop-blur-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                placeholder="Search teachers by name, ID, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Filters and Sort */}
          <div className="flex items-center gap-4">
            {/* Status Filter */}
            <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-xl border border-slate-300/60 px-4 py-3 shadow-sm">
              <FiFilter className="text-slate-500 mr-3 w-4 h-4" />
              <select
                className="border-none bg-transparent focus:ring-0 focus:outline-none text-slate-700 font-medium"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="on leave">On Leave</option>
                <option value="sabbatical">Sabbatical</option>
                <option value="retired">Retired</option>
                <option value="resigned">Resigned</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="flex items-center bg-white/80 backdrop-blur-sm rounded-xl border border-slate-300/60 px-4 py-3 shadow-sm text-slate-700 font-medium hover:bg-slate-50 transition-all duration-200"
              >
                <span className="mr-2">Sort by</span>
                {sortDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              
              {sortDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200/60 z-10 overflow-hidden backdrop-blur-sm">
                  {sortOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => requestSort(option.key)}
                      className="flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-all duration-200"
                    >
                      {option.icon}
                      {option.label}
                      {sortConfig.key === option.key && (
                        <span className="ml-auto text-blue-600">
                          {sortConfig.direction === "ascending" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Cards */}
      <div className="p-6">
        {filteredTeachers.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex flex-col items-center justify-center text-slate-500">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-slate-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <span className="text-3xl">👨‍🏫</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                No teachers found
              </h3>
              <p className="text-slate-500 max-w-sm">
                Try adjusting your search terms or filter criteria to find
                the teachers you're looking for.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTeachers.map((teacher, index) => (
              <div
                key={teacher._id || index}
                className="bg-white rounded-2xl shadow-md border border-slate-200/60 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                {/* Card Header */}
                <div className="p-6 bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 border-b border-slate-200/60">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
                      {teacher.employeeId || "-"}
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${getStatusBadgeClass(
                        teacher.status
                      )}`}
                    >
                      {teacher.status
                        ? teacher.status.charAt(0).toUpperCase() +
                          teacher.status.slice(1)
                        : "-"}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md ring-2 ring-blue-100">
                      {(teacher.firstName?.charAt(0) || "") +
                        (teacher.lastName?.charAt(0) || "T")}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-slate-800 group-hover:text-blue-700 transition-colors duration-200">
                        {`${teacher.title ? teacher.title + " " : ""}${
                          teacher.firstName || ""
                        } ${teacher.lastName || ""}`.trim() || "-"}
                      </h3>
                      <p className="text-sm text-slate-600 font-medium">
                        {teacher.designation || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-slate-600">
                      <FiBook className="w-4 h-4 text-slate-400 mr-3" />
                      <span className="font-medium">
                        {getDepartmentName(teacher.department)}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-slate-600">
                      <FaBusinessTime className="w-4 h-4 text-slate-400 mr-3" />
                      <span className="font-medium">
                        {formatExperience(teacher.experience)} years experience
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-slate-600">
                      <FaRegCalendarAlt className="w-4 h-4 text-slate-400 mr-3" />
                      <span className="font-medium">
                        Joined:{" "}
                        {teacher.joiningDate
                          ? new Date(teacher.joiningDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                              }
                            )
                          : "-"}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-slate-600">
                      <FiMail className="w-4 h-4 text-slate-400 mr-3" />
                      <a
                        href={`mailto:${teacher.email}`}
                        className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors duration-200 truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {teacher.email || "-"}
                      </a>
                    </div>

                    {teacher.phone && (
                      <div className="flex items-center text-sm text-slate-600">
                        <FiPhone className="w-4 h-4 text-slate-400 mr-3" />
                        <a
                          href={`tel:${teacher.phone}`}
                          className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors duration-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {teacher.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center space-x-3 mt-6 pt-4 border-t border-slate-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(teacher);
                      }}
                      className="p-2.5 text-blue-600 hover:text-white hover:bg-blue-600 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md border border-blue-200 hover:border-blue-600 bg-blue-50"
                      title="View Details"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(teacher);
                      }}
                      className="p-2.5 text-emerald-600 hover:text-white hover:bg-emerald-600 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md border border-emerald-200 hover:border-emerald-600 bg-emerald-50"
                      title="Edit Teacher"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(teacher._id);
                      }}
                      className="p-2.5 text-red-600 hover:text-white hover:bg-red-600 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md border border-red-200 hover:border-red-600 bg-red-50"
                      title="Delete Teacher"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expand Button */}
                <div className="border-t border-slate-200/60">
                  <button
                    onClick={() => setExpandedCard(expandedCard === teacher._id ? null : teacher._id)}
                    className="w-full py-3 text-sm font-medium text-slate-600 hover:text-blue-600 flex items-center justify-center transition-colors duration-200"
                  >
                    {expandedCard === teacher._id ? (
                      <>
                        <FiChevronUp className="mr-2" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <FiChevronDown className="mr-2" />
                        Show More
                      </>
                    )}
                  </button>
                </div>

                {/* Expanded Details */}
                {expandedCard === teacher._id && (
                  <div className="p-6 bg-slate-50 border-t border-slate-200/60">
                    <div className="grid grid-cols-1 gap-4">
                      {/* Personal Information */}
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/60">
                        <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                          <FiUser className="w-4 h-4 text-blue-600 mr-2" />
                          Personal Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Gender:</span>
                            <span className="text-slate-700 font-medium capitalize">
                              {teacher.gender || "-"}
                            </span>
                          </div>
                          {teacher.dateOfBirth && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Date of Birth:</span>
                              <span className="text-slate-700 font-medium">
                                {new Date(teacher.dateOfBirth).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Professional Details */}
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/60">
                        <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                          <FaUserTie className="w-4 h-4 text-emerald-600 mr-2" />
                          Professional Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Employment Type:</span>
                            <span className="text-slate-700 font-medium">
                              {teacher.employmentType || "-"}
                            </span>
                          </div>
                          {teacher.officeLocation && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Office:</span>
                              <span className="text-slate-700 font-medium">
                                {teacher.officeLocation}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Academic Information */}
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/60">
                        <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                          <FaGraduationCap className="w-4 h-4 text-amber-600 mr-2" />
                          Academic Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          {teacher.qualification && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Qualification:</span>
                              <span className="text-slate-700 font-medium">
                                {teacher.qualification}
                              </span>
                            </div>
                          )}
                          {teacher.specialization && teacher.specialization.length > 0 && (
                            <div>
                              <span className="text-slate-500 block mb-1">Specialization:</span>
                              <span className="text-slate-700 font-medium">
                                {teacher.specialization.join(", ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredTeachers.length > 0 && (
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 border-t border-slate-200/80 flex items-center justify-between">
          <div className="text-sm text-slate-600 font-medium">
            Showing{" "}
            <span className="font-semibold text-slate-800">
              {filteredTeachers.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-800">
              {teachers.length}
            </span>{" "}
            teachers
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border border-slate-300/60 rounded-lg text-sm font-medium text-slate-700 bg-white/80 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm backdrop-blur-sm">
              Previous
            </button>
            <button className="px-4 py-2 border border-slate-300/60 rounded-lg text-sm font-medium text-slate-700 bg-white/80 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-sm backdrop-blur-sm">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}