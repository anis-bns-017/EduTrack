import React from "react";

export default function TeacherTable({ teachers, onEdit, onDelete }) {

  console.log("Teachers: ", teachers);
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
              "Experience (yrs)",
              "Joining Date",
              "Status",
              "Actions",
            ].map((header) => (
              <th
                key={header}
                className={`p-4 text-left text-sm font-semibold ${
                  header === "Experience (yrs)" || header === "Status" || header === "Actions"
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
              <td colSpan={11} className="p-6 text-center text-gray-500 italic">
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
                <td className="p-4 max-w-xs truncate">{teacher.address || "-"}</td>
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
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors duration-300 ${
                      teacher.status === "active"
                        ? "bg-green-200 text-green-800 hover:bg-green-300"
                        : "bg-red-200 text-red-800 hover:bg-red-300"
                    }`}
                    aria-label={`Status: ${teacher.status || "unknown"}`}
                    title={`Status: ${teacher.status || "unknown"}`}
                  >
                    {teacher.status || "-"}
                  </span>
                </td>
                <td className="p-4 text-center space-x-2 whitespace-nowrap">
                  <button
                    onClick={() => onEdit(teacher)}
                    aria-label={`Edit ${teacher.name}`}
                    title="Edit"
                    className="inline-flex items-center gap-1 rounded px-3 py-1 bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-shadow shadow-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 5h6M6 12l6-6 6 6M6 19h6m3-3v4m-3-4v4m-6-4v4"
                      />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(teacher._id)}
                    aria-label={`Delete ${teacher.name}`}
                    title="Delete"
                    className="inline-flex items-center gap-1 rounded px-3 py-1 bg-red-600 text-white text-sm font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-shadow shadow-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
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
