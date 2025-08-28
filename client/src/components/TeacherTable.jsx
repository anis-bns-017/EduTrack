"use client";
import React, { useState } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
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
} from "react-icons/fi";
import {
  FaChalkboardTeacher,
  FaRegCalendarAlt,
  FaRegEnvelope,
  FaPhone,
  FaTransgender,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaDoorOpen,
  FaBusinessTime,
  FaIdCard,
  FaUserTie,
} from "react-icons/fa";

export default function TeacherTable({
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
  const [expandedRow, setExpandedRow] = useState(null);

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

  const getHeaderIcon = (header) => {
    switch (header) {
      case "ID":
        return <FaIdCard className="mr-1" />;
      case "Name":
        return <FaChalkboardTeacher className="mr-1" />;
      case "Email":
        return <FaRegEnvelope className="mr-1" />;
      case "Phone":
        return <FaPhone className="mr-1" />;
      case "Department":
        return <FiBook className="mr-1" />;
      case "Designation":
        return <FaUserTie className="mr-1" />;
      case "Experience":
        return <FaBusinessTime className="mr-1" />;
      case "Join Date":
        return <FaRegCalendarAlt className="mr-1" />;
      case "Status":
        return <FiUser className="mr-1" />;
      default:
        return null;
    }
  };

  const headers = [
    "ID",
    "Name",
    "Email",
    "Phone",
    "Department",
    "Designation",
    "Experience",
    "Join Date",
    "Status",
    "Actions",
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200/60 backdrop-blur-sm">
      <div className="p-6 bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 border-b border-slate-200/80">
        <div className="flex flex-wrap items-center justify-between gap-6">
           
          <div className="flex items-center gap-4">
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
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200/60">
          <thead className="bg-gradient-to-r from-slate-100 via-blue-50/40 to-slate-100">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className={`px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider ${
                    ["Experience", "Status", "Actions"].includes(header)
                      ? "text-center"
                      : ""
                  } cursor-pointer hover:bg-slate-200/50 transition-all duration-200 border-b border-slate-200/40`}
                  onClick={() =>
                    header !== "Actions" &&
                    requestSort(
                      header
                        .toLowerCase()
                        .replace(/[^a-z]/g, "")
                        .replace(/\s+/g, "")
                    )
                  }
                >
                  <div
                    className={`flex items-center ${
                      ["Experience", "Status", "Actions"].includes(header)
                        ? "justify-center"
                        : ""
                    } group`}
                  >
                    <span className="text-slate-500 group-hover:text-blue-600 transition-colors duration-200">
                      {getHeaderIcon(header)}
                    </span>
                    <span className="group-hover:text-slate-800 transition-colors duration-200">
                      {header}
                    </span>
                    {sortConfig.key ===
                      header
                        .toLowerCase()
                        .replace(/[^a-z]/g, "")
                        .replace(/\s+/g, "") && (
                      <span className="ml-2 text-blue-600">
                        {sortConfig.direction === "ascending" ? (
                          <FiChevronUp className="w-4 h-4" />
                        ) : (
                          <FiChevronDown className="w-4 h-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-16 text-center">
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
                </td>
              </tr>
            ) : (
              filteredTeachers.map((teacher, index) => (
                <React.Fragment key={teacher._id || index}>
                  <tr
                    className={`hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-slate-50/50 transition-all duration-200 cursor-pointer group ${
                      expandedRow === teacher._id
                        ? "bg-gradient-to-r from-blue-50/50 to-slate-50/30 shadow-sm"
                        : index % 2 === 0
                        ? "bg-white"
                        : "bg-slate-50/30"
                    }`}
                    onClick={() =>
                      setExpandedRow(
                        expandedRow === teacher._id ? null : teacher._id
                      )
                    }
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-md inline-block">
                        {teacher.employeeId || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md ring-2 ring-blue-100">
                          {(teacher.firstName?.charAt(0) || "") +
                            (teacher.lastName?.charAt(0) || "T")}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors duration-200">
                            {`${teacher.title ? teacher.title + " " : ""}${
                              teacher.firstName || ""
                            } ${teacher.lastName || ""}`.trim() || "-"}
                          </div>
                          <div className="text-xs text-slate-500 font-medium capitalize">
                            {teacher.gender || "Not specified"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-700">
                      <a
                        href={`mailto:${teacher.email}`}
                        className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {teacher.email || "-"}
                      </a>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-700 font-medium">
                      {teacher.phone ? (
                        <a
                          href={`tel:${teacher.phone}`}
                          className="hover:text-blue-600 transition-colors duration-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {teacher.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {getDepartmentName(teacher.department)}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                        {teacher.designation || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center font-mono tabular-nums whitespace-nowrap text-sm font-semibold text-slate-800">
                      <span
                        className={teacher.experience ? "" : "text-slate-400"}
                      >
                        {formatExperience(teacher.experience)} yrs
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-700 font-medium">
                      {teacher.joiningDate ? (
                        new Date(teacher.joiningDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all duration-300 hover:scale-105 ${getStatusBadgeClass(
                          teacher.status
                        )}`}
                      >
                        {teacher.status
                          ? teacher.status.charAt(0).toUpperCase() +
                            teacher.status.slice(1)
                          : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center whitespace-nowrap">
                      <div className="flex justify-center space-x-2">
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
                    </td>
                  </tr>
                  {expandedRow === teacher._id && (
                    <tr className="bg-gradient-to-r from-blue-50/40 via-slate-50/60 to-blue-50/40">
                      <td colSpan={headers.length} className="px-6 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Personal Information */}
                          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200/60 hover:shadow-lg transition-all duration-200 backdrop-blur-sm">
                            <div className="flex items-center mb-4">
                              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                                <FiUser className="w-4 h-4 text-white" />
                              </div>
                              <h4 className="font-semibold text-slate-800 ml-3">
                                Personal Information
                              </h4>
                            </div>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">
                                  Date of Birth:
                                </span>
                                <span className="text-slate-700 font-medium">
                                  {teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toLocaleDateString() : "-"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">
                                  Gender:
                                </span>
                                <span className="text-slate-700 font-medium capitalize">
                                  {teacher.gender || "-"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">
                                  Blood Group:
                                </span>
                                <span className="text-slate-700 font-medium">
                                  {teacher.bloodGroup || "-"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">
                                  Nationality:
                                </span>
                                <span className="text-slate-700 font-medium">
                                  {teacher.nationality || "-"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Contact Information */}
                          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200/60 hover:shadow-lg transition-all duration-200 backdrop-blur-sm">
                            <div className="flex items-center mb-4">
                              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                                <FiPhone className="w-4 h-4 text-white" />
                              </div>
                              <h4 className="font-semibold text-slate-800 ml-3">
                                Contact Information
                              </h4>
                            </div>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">
                                  Email:
                                </span>
                                <span className="text-slate-700 font-medium">
                                  {teacher.email || "-"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">
                                  Phone:
                                </span>
                                <span className="text-slate-700 font-medium">
                                  {teacher.phone || "-"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">
                                  Office:
                                </span>
                                <span className="text-slate-700 font-medium">
                                  {teacher.officeLocation || "-"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">
                                  Address:
                                </span>
                                <span className="text-slate-700 font-medium text-right max-w-32 truncate">
                                  {formatAddress(teacher.address)}
                                </span>
                              </div>
                              {teacher.emergencyContact && (
                                <div className="pt-2 border-t border-slate-100">
                                  <p className="text-slate-500 font-medium mb-1">
                                    Emergency Contact:
                                  </p>
                                  <p className="text-slate-700">
                                    {teacher.emergencyContact.name} (
                                    {teacher.emergencyContact.relationship}) -{" "}
                                    {teacher.emergencyContact.phone}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Professional Details */}
                          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200/60 hover:shadow-lg transition-all duration-200 backdrop-blur-sm">
                            <div className="flex items-center mb-4">
                              <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                                <FaUserTie className="w-4 h-4 text-white" />
                              </div>
                              <h4 className="font-semibold text-slate-800 ml-3">
                                Professional Details
                              </h4>
                            </div>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">
                                  Department:
                                </span>
                                <span className="text-slate-700 font-medium">
                                  {getDepartmentName(teacher.department)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">
                                  Designation:
                                </span>
                                <span className="text-slate-700 font-medium">
                                  {teacher.designation || "-"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">
                                  Employment Type:
                                </span>
                                <span className="text-slate-700 font-medium">
                                  {teacher.employmentType || "-"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">
                                  Teaching Load:
                                </span>
                                <span className="text-slate-700 font-medium">
                                  {teacher.teachingLoad || "0"} hours
                                </span>
                              </div>
                              {teacher.contractEndDate && (
                                <div className="flex justify-between">
                                  <span className="text-slate-500 font-medium">
                                    Contract End:
                                  </span>
                                  <span className="text-slate-700 font-medium">
                                    {new Date(teacher.contractEndDate).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Academic Information */}
                          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200/60 hover:shadow-lg transition-all duration-200 backdrop-blur-sm">
                            <div className="flex items-center mb-4">
                              <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg">
                                <FaGraduationCap className="w-4 h-4 text-white" />
                              </div>
                              <h4 className="font-semibold text-slate-800 ml-3">
                                Academic Information
                              </h4>
                            </div>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">
                                  Qualification:
                                </span>
                                <span className="text-slate-700 font-medium">
                                  {teacher.qualification || "-"}
                                </span>
                              </div>
                              {teacher.specialization && teacher.specialization.length > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-slate-500 font-medium">
                                    Specialization:
                                  </span>
                                  <span className="text-slate-700 font-medium text-right">
                                    {teacher.specialization.join(", ")}
                                  </span>
                                </div>
                              )}
                              {teacher.researchInterests && teacher.researchInterests.length > 0 && (
                                <div className="pt-2 border-t border-slate-100">
                                  <p className="text-slate-500 font-medium mb-1">
                                    Research Interests:
                                  </p>
                                  <p className="text-slate-700">
                                    {teacher.researchInterests.join(", ")}
                                  </p>
                                </div>
                              )}
                              {teacher.areasOfExpertise && teacher.areasOfExpertise.length > 0 && (
                                <div className="pt-2 border-t border-slate-100">
                                  <p className="text-slate-500 font-medium mb-1">
                                    Areas of Expertise:
                                  </p>
                                  <p className="text-slate-700">
                                    {teacher.areasOfExpertise.join(", ")}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Experience Details */}
                          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200/60 hover:shadow-lg transition-all duration-200 backdrop-blur-sm">
                            <div className="flex items-center mb-4">
                              <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                                <FaBusinessTime className="w-4 h-4 text-white" />
                              </div>
                              <h4 className="font-semibold text-slate-800 ml-3">
                                Experience Details
                              </h4>
                            </div>
                            <div className="space-y-3 text-sm">
                              {teacher.experience && typeof teacher.experience === "object" && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500 font-medium">
                                      Teaching Exp:
                                    </span>
                                    <span className="text-slate-700 font-medium">
                                      {teacher.experience.teaching || 0} years
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500 font-medium">
                                      Industry Exp:
                                    </span>
                                    <span className="text-slate-700 font-medium">
                                      {teacher.experience.industry || 0} years
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500 font-medium">
                                      Research Exp:
                                    </span>
                                    <span className="text-slate-700 font-medium">
                                      {teacher.experience.research || 0} years
                                    </span>
                                  </div>
                                </>
                              )}
                              {teacher.previousInstitutions && teacher.previousInstitutions.length > 0 && (
                                <div className="pt-2 border-t border-slate-100">
                                  <p className="text-slate-500 font-medium mb-1">
                                    Previous Institutions:
                                  </p>
                                  {teacher.previousInstitutions.map((inst, idx) => (
                                    <p key={idx} className="text-slate-700 text-sm">
                                      {inst.name} ({inst.position}) - {inst.duration}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Additional Information */}
                          <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200/60 hover:shadow-lg transition-all duration-200 backdrop-blur-sm">
                            <div className="flex items-center mb-4">
                              <div className="p-2 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg">
                                <FiAward className="w-4 h-4 text-white" />
                              </div>
                              <h4 className="font-semibold text-slate-800 ml-3">
                                Additional Information
                              </h4>
                            </div>
                            <div className="space-y-3 text-sm">
                              {teacher.awards && teacher.awards.length > 0 && (
                                <div>
                                  <p className="text-slate-500 font-medium mb-1">
                                    Awards:
                                  </p>
                                  {teacher.awards.map((award, idx) => (
                                    <p key={idx} className="text-slate-700 text-sm">
                                      {award.title} ({award.year}) - {award.organization}
                                    </p>
                                  ))}
                                </div>
                              )}
                              {teacher.officeHours && teacher.officeHours.length > 0 && (
                                <div className="pt-2 border-t border-slate-100">
                                  <p className="text-slate-500 font-medium mb-1">
                                    Office Hours:
                                  </p>
                                  {teacher.officeHours.map((hours, idx) => (
                                    <p key={idx} className="text-slate-700 text-sm">
                                      {hours.day}: {hours.startTime} - {hours.endTime}
                                      {hours.byAppointment && " (By Appointment)"}
                                    </p>
                                  ))}
                                </div>
                              )}
                              {teacher.bio && (
                                <div className="pt-2 border-t border-slate-100">
                                  <p className="text-slate-500 font-medium mb-1">
                                    Bio:
                                  </p>
                                  <p className="text-slate-700 text-sm">
                                    {teacher.bio}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
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