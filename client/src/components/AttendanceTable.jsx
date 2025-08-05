import React from "react";
import axios from "../../api/axios";
import { toast } from "react-hot-toast";

export default function AttendanceTable({ attendanceList, onEdit, onDelete, students }) {


  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this attendance record?")) {
      try {
        await axios.delete(`/attendance/${id}`);
        toast.success("Deleted successfully");
        onDelete();
      } catch (err) {
        toast.error("Delete failed");
      }
    }
  };

  return (
    <div className="overflow-x-auto rounded-2xl shadow-lg bg-white border border-gray-200">
      <table className="min-w-full text-sm text-gray-700">
        <thead className="bg-gray-100 text-xs text-gray-600 uppercase">
          <tr>
            <th className="px-6 py-4 text-left">Student</th>
            <th className="px-6 py-4 text-left">Class</th>
            <th className="px-6 py-4 text-left">Date</th>
            <th className="px-6 py-4 text-left">Status</th>
            <th className="px-6 py-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {attendanceList.map((item, index) => (
            <tr
              key={item._id}
              className={`border-t hover:bg-gray-50 transition duration-150 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
            >
              <td className="px-6 py-4 font-medium">{item?.student?.name }</td>
              <td className="px-6 py-4">{item.which_class}</td>
              <td className="px-6 py-4">
                {new Date(item.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    item.status === "Present"
                      ? "bg-green-100 text-green-700"
                      : item.status === "Absent"
                      ? "bg-red-100 text-red-700"
                      : item.status === "Late"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4 space-x-2">
                <button
                  onClick={() => onEdit(item)}
                  className="px-4 py-2 text-xs font-semibold bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="px-4 py-2 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {attendanceList.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center py-6 text-gray-500">
                No attendance records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
