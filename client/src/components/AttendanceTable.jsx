import React from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Edit,
  Trash2,
  User,
  Building,
  BookOpen,
  Calendar,
  Hash,
} from "lucide-react";

export default function AttendanceTable({
  attendanceList = [],
  onEdit,
  onDelete,
}) {
  // Ensure attendanceList is always an array
  const attendanceData = Array.isArray(attendanceList) ? attendanceList : [];

  const getStatusBadge = (status) => {
    const statusLower = status?.toLowerCase() || "";

    switch (statusLower) {
      case "present":
        return {
          className:
            "bg-green-100 text-green-800 border border-green-200 hover:bg-green-200",
          icon: <CheckCircle className="w-3 h-3" />,
        };
      case "absent":
        return {
          className:
            "bg-red-100 text-red-800 border border-red-200 hover:bg-red-200",
          icon: <XCircle className="w-3 h-3" />,
        };
      case "late":
        return {
          className:
            "bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-200",
          icon: <Clock className="w-3 h-3" />,
        };
      case "excused":
        return {
          className:
            "bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200",
          icon: <FileText className="w-3 h-3" />,
        };
      default:
        return {
          className:
            "bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200",
          icon: null,
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
      <div className="relative">
        {/* Table with custom scrollbar */}
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200">
              <tr className="hover:bg-transparent">
                <th className="w-[180px] p-3 text-left font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    Student
                  </div>
                </th>
                <th className="w-[140px] p-3 text-left font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-600" />
                    Department
                  </div>
                </th>
                <th className="w-[140px] p-3 text-left font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gray-600" />
                    Course
                  </div>
                </th>
                <th className="w-[100px] p-3 text-center font-semibold text-gray-900">
                  Term
                </th>
                <th className="w-[100px] p-3 text-center font-semibold text-gray-900">
                  Semester
                </th>
                <th className="w-[120px] p-3 text-left font-semibold text-gray-900">
                  Academic Year
                </th>
                <th className="w-[120px] p-3 text-left font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    Date
                  </div>
                </th>
                <th className="w-[100px] p-3 text-center font-semibold text-gray-900">
                  <div className="flex items-center justify-center gap-2">
                    <Hash className="w-4 h-4 text-gray-600" />
                    Lecture
                  </div>
                </th>
                <th className="w-[100px] p-3 text-center font-semibold text-gray-900">
                  Status
                </th>
                <th className="w-[200px] p-3 text-left font-semibold text-gray-900">
                  Remarks
                </th>
                <th className="w-[140px] p-3 text-center font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendanceData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                      <Calendar className="w-8 h-8 opacity-50" />
                      <p className="text-sm font-medium">
                        No attendance records available
                      </p>
                      <p className="text-xs opacity-75">
                        Add attendance records to get started
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                attendanceData.map((attendance, idx) => {
                  const statusBadge = getStatusBadge(attendance.status);

                  return (
                    <tr
                      key={attendance._id || idx}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="p-3">
                        <div className="font-medium text-gray-900">
                          {attendance.student?.name ||
                            attendance.student ||
                            "-"}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm text-gray-600">
                          {attendance.department?.name ||
                            attendance.department ||
                            "-"}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm text-gray-600">
                          {attendance.course?.name || attendance.course || "-"}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700">
                          {attendance.term || "-"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-6 text-xs font-mono font-medium rounded-md bg-gray-100 text-gray-700">
                          {attendance.semester ?? "-"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="text-sm text-gray-600">
                          {attendance.academicYear || "-"}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(attendance.lectureDate)}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-6 text-xs font-mono font-medium rounded-md bg-gray-100 text-gray-700">
                          {attendance.lectureNumber ?? "-"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full transition-colors ${statusBadge.className}`}
                        >
                          {statusBadge.icon}
                          {attendance.status
                            ? attendance.status.charAt(0).toUpperCase() +
                              attendance.status.slice(1)
                            : "Unknown"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div
                          className="text-sm text-gray-600 max-w-[180px] truncate"
                          title={attendance.remarks || ""}
                        >
                          {attendance.remarks || "-"}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEdit(attendance)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(attendance._id)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with record count */}
        {attendanceData.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Total Records: {attendanceData.length}</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>Absent</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>Late</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Excused</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
