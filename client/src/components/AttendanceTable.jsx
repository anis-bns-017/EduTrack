import React from "react";

export default function TeacherTable({ teachers, onEdit, onDelete }) {
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-200 text-green-800 hover:bg-green-300";
      case "inactive":
        return "bg-yellow-200 text-yellow-800 hover:bg-yellow-300";
      case "on leave":
        return "bg-blue-200 text-blue-800 hover:bg-blue-300";
      case "retired":
        return "bg-gray-300 text-gray-800 hover:bg-gray-400";
      default:
        return "bg-red-200 text-red-800 hover:bg-red-300";
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-md">
      <table className="min-w-full bg-white rounded-lg table-auto">
        <thead className="bg-gradient-to-r from-blue-600 to-blue-500 text-white select-none sticky top-0 z-10 shadow-md">
          <tr>
            {[
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
            ].map((header) => (
              <th
                key={header}
                className={`p-4 text-left text-sm font-semibold ${
                  ["Experience (yrs)", "Status", "Actions"].includes(header)
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
          {teachers.length === 0 ? (
            <tr>
              <td colSpan={13} className="p-6 text-center text-gray-500 italic">
                No teacher data available.
              </td>
            </tr>
          ) : (
            teachers.map((teacher, idx) => (
              <tr
                key={teacher._id}
                className={`text-gray-800 text-sm hover:bg-gray-50 transition-shadow border-b ${
                  idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <td className="p-4 font-semibold whitespace-nowrap">{teacher.name || "-"}</td>
                <td className="p-4 whitespace-nowrap">{teacher.email || "-"}</td>
                <td className="p-4 whitespace-nowrap">{teacher.phone || "-"}</td>
                <td className="p-4 whitespace-nowrap">{teacher.department || "-"}</td>
                <td className="p-4 whitespace-nowrap">{teacher.designation || "-"}</td>
                <td className="p-4 capitalize whitespace-nowrap">{teacher.gender || "-"}</td>
                <td className="p-4 max-w-xs truncate" title={teacher.address || ""}>{teacher.address || "-"}</td>
                <td className="p-4 max-w-xs truncate" title={teacher.qualifications || ""}>{teacher.qualifications || "-"}</td>
                <td className="p-4 max-w-xs truncate" title={teacher.officeRoom || ""}>{teacher.officeRoom || "-"}</td>
                <td className="p-4 text-center font-mono tabular-nums whitespace-nowrap">
                  {teacher.experience ?? "-"}
                </td>
                <td className="p-4 whitespace-nowrap">
                  {teacher.joiningDate
                    ? new Date(teacher.joiningDate).toLocaleDateString()
                    : "-"}
                </td>
                <td className="p-4 text-center whitespace-nowrap">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors duration-300 ${getStatusBadgeClass(teacher.status)}`}
                    aria-label={`Status: ${teacher.status || "unknown"}`}
                    title={`Status: ${teacher.status || "unknown"}`}
                  >
                    {teacher.status
                      ? teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)
                      : "-"}
                  </span>
                </td>
                <td className="p-4 text-center space-x-2 whitespace-nowrap">
                  <button
                    onClick={() => onEdit(teacher)}
                    aria-label={`Edit ${teacher.name}`}
                    title="Edit"
                    className="inline-flex items-center gap-1 rounded px-3 py-1 bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow shadow-sm"
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(teacher._id)}
                    aria-label={`Delete ${teacher.name}`}
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