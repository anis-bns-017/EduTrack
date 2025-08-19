import React, { useState } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
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
} from "react-icons/fa";

export default function TeacherTable({ teachers, onEdit, onDelete }) {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);

  console.log("anis: ", teachers)

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
      return Object.values(teacher).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200";
      case "inactive":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case "on leave":
        return "bg-sky-100 text-sky-800 hover:bg-sky-200";
      case "retired":
        return "bg-gray-200 text-gray-800 hover:bg-gray-300";
      default:
        return "bg-rose-100 text-rose-800 hover:bg-rose-200";
    }
  };

  const getHeaderIcon = (header) => {
    switch (header) {
      case "Name":
        return <FaChalkboardTeacher className="mr-1" />;
      case "Email":
        return <FaRegEnvelope className="mr-1" />;
      case "Phone":
        return <FaPhone className="mr-1" />;
      case "Gender":
        return <FaTransgender className="mr-1" />;
      case "Address":
        return <FaMapMarkerAlt className="mr-1" />;
      case "Qualifications":
        return <FaGraduationCap className="mr-1" />;
      case "Office Room":
        return <FaDoorOpen className="mr-1" />;
      case "Experience (yrs)":
        return <FaBusinessTime className="mr-1" />;
      case "Joining Date":
        return <FaRegCalendarAlt className="mr-1" />;
      default:
        return null;
    }
  };

  const headers = [
    "Name",
    "Email",
    "Phone",
    "Department",
    "Designation",
    "Gender",
    "Address",
    "Qualifications",
    "Office Room",
    "Experience (yrs)",
    "Joining Date",
    "Status",
    "Actions",
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      {/* Table Controls */}
   

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider ${
                    ["Experience (yrs)", "Status", "Actions"].includes(header)
                      ? "text-center"
                      : ""
                  } cursor-pointer hover:bg-gray-200 transition-colors`}
                  onClick={() =>
                    requestSort(header.toLowerCase().replace(/[^a-z]/g, ""))
                  }
                >
                  <div
                    className={`flex items-center ${
                      ["Experience (yrs)", "Status", "Actions"].includes(header)
                        ? "justify-center"
                        : ""
                    }`}
                  >
                    {getHeaderIcon(header)}
                    {header}
                    {sortConfig.key ===
                      header.toLowerCase().replace(/[^a-z]/g, "") && (
                      <span className="ml-1">
                        {sortConfig.direction === "ascending" ? (
                          <FiChevronUp />
                        ) : (
                          <FiChevronDown />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <div className="text-5xl mb-4">👨‍🏫</div>
                    <h3 className="text-lg font-medium text-gray-700 mb-1">
                      No teachers found
                    </h3>
                    <p>Try adjusting your search criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTeachers.map((teacher) => (
                <React.Fragment key={teacher._id}>
                  <tr
                    className={`hover:bg-gray-50 transition-colors ${
                      expandedRow === teacher._id ? "bg-blue-50" : ""
                    }`}
                    onClick={() =>
                      setExpandedRow(
                        expandedRow === teacher._id ? null : teacher._id
                      )
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {/* Avatar initials */}
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-medium">
                          {(teacher.firstName?.charAt(0) || "") +
                            (teacher.lastName?.charAt(0) || "T")}
                        </div>

                        {/* Teacher name + designation */}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {`${teacher.firstName || ""} ${
                              teacher.lastName || ""
                            }`.trim() || "-"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {teacher.designation || "Teacher"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <a
                        href={`mailto:${teacher.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {teacher.email || "-"}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teacher.phone ? (
                        <a
                          href={`tel:${teacher.phone}`}
                          className="hover:text-blue-600"
                        >
                          {teacher.phone}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teacher.department || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teacher.designation || "-"}
                    </td>
                    <td className="px-6 py-4 capitalize whitespace-nowrap text-sm text-gray-900">
                      {teacher.gender || "-"}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-900">
                      {teacher.address || "-"}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-900">
                      {teacher.qualifications || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teacher.officeRoom || "-"}
                    </td>
                    <td className="px-6 py-4 text-center font-mono tabular-nums whitespace-nowrap text-sm text-gray-900">
                      {teacher.experience ?? "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teacher.joiningDate
                        ? new Date(teacher.joiningDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors duration-300 ${getStatusBadgeClass(
                          teacher.status
                        )}`}
                      >
                        {teacher.status
                          ? teacher.status.charAt(0).toUpperCase() +
                            teacher.status.slice(1)
                          : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(teacher);
                          }}
                          className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-full transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(teacher._id);
                          }}
                          className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-full transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRow === teacher._id && (
                    <tr className="bg-blue-50">
                      <td colSpan={headers.length} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <h4 className="font-medium text-gray-700 mb-2">
                              Contact Information
                            </h4>
                            <div className="space-y-2 text-sm">
                              <p>
                                <span className="text-gray-500">Email:</span>{" "}
                                {teacher.email || "-"}
                              </p>
                              <p>
                                <span className="text-gray-500">Phone:</span>{" "}
                                {teacher.phone || "-"}
                              </p>
                              <p>
                                <span className="text-gray-500">Address:</span>{" "}
                                {teacher.address || "-"}
                              </p>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <h4 className="font-medium text-gray-700 mb-2">
                              Professional Details
                            </h4>
                            <div className="space-y-2 text-sm">
                              <p>
                                <span className="text-gray-500">
                                  Department:
                                </span>{" "}
                                {teacher.department || "-"}
                              </p>
                              <p>
                                <span className="text-gray-500">
                                  Designation:
                                </span>{" "}
                                {teacher.designation || "-"}
                              </p>
                              <p>
                                <span className="text-gray-500">Office:</span>{" "}
                                {teacher.officeRoom || "-"}
                              </p>
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <h4 className="font-medium text-gray-700 mb-2">
                              Qualifications
                            </h4>
                            <div className="space-y-2 text-sm">
                              <p>
                                {teacher.qualifications ||
                                  "No qualifications listed"}
                              </p>
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

      {/* Table Footer */}
      {filteredTeachers.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium">{filteredTeachers.length}</span> of{" "}
            <span className="font-medium">{teachers.length}</span> teachers
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}