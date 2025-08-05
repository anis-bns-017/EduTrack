import React from "react";

export default function TeacherTable({ teachers, onEdit, onDelete }) {
  return (
    <table className="min-w-full bg-white rounded shadow">
      <thead>
        <tr className="bg-gray-200 text-left">
          <th className="p-3">Name</th>
          <th className="p-3">Email</th>
          <th className="p-3">Department</th>
          <th className="p-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {teachers.map((teacher) => (
          <tr key={teacher._id} className="border-b hover:bg-gray-50">
            <td className="p-3">{teacher.name}</td>
            <td className="p-3">{teacher.email}</td>
            <td className="p-3">{teacher.department}</td>
            <td className="p-3 space-x-2">
              <button
                onClick={() => onEdit(teacher)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(teacher._id)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
