import React from "react";

export default function AttendanceTable({ attendanceList = [], onEdit, onDelete }) {
  // Ensure attendanceList is always an array
  const attendanceData = Array.isArray(attendanceList) ? attendanceList : [];

  
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "present":
        return "bg-green-200 text-green-800 hover:bg-green-300";
      case "absent":
        return "bg-red-200 text-red-800 hover:bg-red-300";
      case "late":
        return "bg-yellow-200 text-yellow-800 hover:bg-yellow-300";
      case "excused":
        return "bg-blue-200 text-blue-800 hover:bg-blue-300";
      default:
        return "bg-gray-200 text-gray-800 hover:bg-gray-300";
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md">
      <table className="min-w-full bg-white rounded-lg table-auto">
        <thead className="bg-gradient-to-r from-blue-600 to-blue-500 text-white select-none sticky top-0 z-10 shadow-md">
          <tr>
            {[
              "Student",
              "Department",
              "Course",
              "Term",
              "Semester",
              "Academic Year",
              "Lecture Date",
              "Lecture Number",
              "Status",
              "Remarks",
              "Actions"
            ].map((header) => (
              <th
                key={header}
                className={`p-4 text-left text-sm font-semibold ${
                  ["Semester", "Lecture Number", "Status", "Actions"].includes(header)
                    ? "text-center"
                    : ""
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {attendanceData.length === 0 ? (
            <tr>
              <td colSpan={11} className="p-6 text-center text-gray-500 italic">
                No attendance records available.
              </td>
            </tr>
          ) : (
            attendanceData.map((attendance, idx) => (
              <tr
                key={attendance._id || idx}
                className={`text-gray-800 text-sm hover:bg-gray-50 transition-shadow border-b ${
                  idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <td className="p-4 font-semibold whitespace-nowrap">
                  {attendance.student?.name || attendance.student || "-"}
                </td>
                <td className="p-4 whitespace-nowrap">
                  {attendance.department?.name || attendance.department || "-"}
                </td>
                <td className="p-4 whitespace-nowrap">
                  {attendance.course?.name || attendance.course || "-"}
                </td>
                <td className="p-4 whitespace-nowrap">{attendance.term || "-"}</td>
                <td className="p-4 text-center font-mono tabular-nums whitespace-nowrap">
                  {attendance.semester ?? "-"}
                </td>
                <td className="p-4 whitespace-nowrap">{attendance.academicYear || "-"}</td>
                <td className="p-4 whitespace-nowrap">
                  {attendance.lectureDate
                    ? new Date(attendance.lectureDate).toLocaleDateString()
                    : "-"}
                </td>
                <td className="p-4 text-center font-mono tabular-nums whitespace-nowrap">
                  {attendance.lectureNumber ?? "-"}
                </td>
                <td className="p-4 text-center whitespace-nowrap">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors duration-300 ${getStatusBadgeClass(attendance.status)}`}
                    aria-label={`Status: ${attendance.status || "unknown"}`}
                    title={`Status: ${attendance.status || "unknown"}`}
                  >
                    {attendance.status
                      ? attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)
                      : "-"}
                  </span>
                </td>
                <td className="p-4 max-w-xs truncate" title={attendance.remarks || ""}>
                  {attendance.remarks || "-"}
                </td>
                <td className="p-4 text-center space-x-2 whitespace-nowrap">
                  <button
                    onClick={() => onEdit(attendance)}
                    aria-label={`Edit attendance record`}
                    title="Edit"
                    className="inline-flex items-center gap-1 rounded px-3 py-1 bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow shadow-sm"
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(attendance._id)}
                    aria-label={`Delete attendance record`}
                    title="Delete"
                    className="inline-flex items-center gap-1 rounded px-3 py-1 bg-red-600 text-white text-sm font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow shadow-sm"
                    type="button"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}