import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import toast from "react-hot-toast";

export default function AttendanceModal({
  isOpen,
  onClose,
  students,
  selectedAttendance,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    student: "",
    which_class: "",
    date: "",
    status: "Present",
  });

  useEffect(() => {
    if (selectedAttendance) {
      setFormData({
        student: selectedAttendance.student?._id || "",
        which_class: selectedAttendance.which_class || "",
        date: selectedAttendance.date?.split("T")[0] || "",
        status: selectedAttendance.status || "Present",
      });
    } else {
      setFormData({
        student: "",
        which_class: "",
        date: "",
        status: "Present",
      });
    }
  }, [selectedAttendance]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedAttendance
        ? `/attendance/${selectedAttendance._id}`
        : "/attendance";
      const method = selectedAttendance ? "put" : "post";

      await axios[method](url, formData);
      onSuccess();
      onClose();
      toast.success("Attendance submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit attendance");
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          {selectedAttendance ? "Edit Attendance" : "Add Attendance"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student */}
          <div>
            <label htmlFor="student" className="block mb-2 text-sm font-semibold text-gray-700">
              Student
            </label>
            <select
              id="student"
              name="student"
              value={formData.student}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            >
              <option value="" disabled>Select Student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>

          {/* Class */}
          <div>
            <label htmlFor="which_class" className="block mb-2 text-sm font-semibold text-gray-700">
              Class
            </label>
            <select
              id="which_class"
              name="which_class"
              value={formData.which_class}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            >
              <option value="" disabled>Select Class</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={`Class ${i + 1}`}>
                  Class {i + 1}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block mb-2 text-sm font-semibold text-gray-700">
              Date
            </label>
            <input
              id="date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block mb-2 text-sm font-semibold text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Excuse">Excuse</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border rounded-lg text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {selectedAttendance ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
