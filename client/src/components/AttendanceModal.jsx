import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import toast from "react-hot-toast";

export default function AttendanceModal({
  isOpen,
  onClose,
  students = [],
  departments = [],
  courses = [],
  selectedAttendance,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    student: "",
    department: "",
    course: "",
    term: "",
    semester: "",
    academicYear: "",
    lectureDate: "",
    lectureNumber: "",
    status: "Present",
    remarks: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  // console.log("course: ", courses);

  useEffect(() => {
    if (selectedAttendance) {
      setFormData({
        student: selectedAttendance.student?._id || "",
        department: selectedAttendance.department?._id || "",
        course: selectedAttendance.course?._id || "",
        term: selectedAttendance.term ?? "",
        semester: selectedAttendance.semester ?? "",
        academicYear: selectedAttendance.academicYear ?? "",
        lectureDate:
          typeof selectedAttendance.lectureDate === "string"
            ? selectedAttendance.lectureDate.split("T")[0]
            : selectedAttendance.lectureDate instanceof Date
            ? selectedAttendance.lectureDate.toISOString().split("T")[0]
            : "",
        lectureNumber: selectedAttendance.lectureNumber ?? "",
        status: selectedAttendance.status || "Present",
        remarks: selectedAttendance.remarks ?? "",
      });
    } else {
      setFormData({
        student: "",
        department: "",
        course: "",
        term: "",
        semester: "",
        academicYear: "",
        lectureDate: "",
        lectureNumber: "",
        status: "Present",
        remarks: "",
      });
    }
  }, [selectedAttendance]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = selectedAttendance
        ? `/attendance/${selectedAttendance._id}`
        : "/attendance";
      const method = selectedAttendance ? "put" : "post";

      await axios[method](url, formData);
      onSuccess?.();
      onClose?.();
      toast.success("Attendance submitted successfully!");
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to submit attendance";
      toast.error(errMsg);
      console.error("Error submitting attendance:", error);
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-labelledby="attendance-modal-title"
      tabIndex={-1}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-opacity duration-300"
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-8 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2
          id="attendance-modal-title"
          className="text-3xl font-extrabold text-gray-900 mb-6 text-center border-b-2 border-blue-600 pb-2"
        >
          {selectedAttendance ? "Edit Attendance" : "Add Attendance"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Use grid for responsive two-column layout */}
          <div className="grid gap-6 sm:grid-cols-2">

            {/* Student */}
            <div>
              <label
                htmlFor="student"
                className="block mb-2 text-sm font-semibold text-gray-700"
              >
                Student
              </label>
              <select
                id="student"
                name="student"
                value={formData.student}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="" disabled>
                  Select Student
                </option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <label
                htmlFor="department"
                className="block mb-2 text-sm font-semibold text-gray-700"
              >
                Department
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="" disabled>
                  Select Department
                </option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Course */}
            <div>
              <label
                htmlFor="course"
                className="block mb-2 text-sm font-semibold text-gray-700"
              >
                Course
              </label>
              <select
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="" disabled>
                  Select Course
                </option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Term */}
            <div>
              <label
                htmlFor="term"
                className="block mb-2 text-sm font-semibold text-gray-700"
              >
                Term
              </label>
              <input
                id="term"
                type="text"
                name="term"
                value={formData.term}
                onChange={handleChange}
                placeholder="e.g., Fall"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Semester */}
            <div>
              <label
                htmlFor="semester"
                className="block mb-2 text-sm font-semibold text-gray-700"
              >
                Semester
              </label>
              <input
                id="semester"
                type="number"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                placeholder="e.g., 1"
                required
                min="1"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Academic Year */}
            <div>
              <label
                htmlFor="academicYear"
                className="block mb-2 text-sm font-semibold text-gray-700"
              >
                Academic Year
              </label>
              <input
                id="academicYear"
                type="text"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                placeholder="e.g., 2024/2025"
                required
                pattern="^\d{4}/\d{4}$"
                title="Format: YYYY/YYYY"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Lecture Date */}
            <div>
              <label
                htmlFor="lectureDate"
                className="block mb-2 text-sm font-semibold text-gray-700"
              >
                Lecture Date
              </label>
              <input
                id="lectureDate"
                type="date"
                name="lectureDate"
                value={formData.lectureDate}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Lecture Number */}
            <div>
              <label
                htmlFor="lectureNumber"
                className="block mb-2 text-sm font-semibold text-gray-700"
              >
                Lecture Number
              </label>
              <input
                id="lectureNumber"
                type="number"
                name="lectureNumber"
                value={formData.lectureNumber}
                onChange={handleChange}
                placeholder="e.g., 5"
                required
                min="1"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="block mb-2 text-sm font-semibold text-gray-700"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Excused">Excused</option>
              </select>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label
              htmlFor="remarks"
              className="block mb-2 text-sm font-semibold text-gray-700"
            >
              Remarks
            </label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Optional notes..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {selectedAttendance ? (isSubmitting ? "Updating..." : "Update") : (isSubmitting ? "Adding..." : "Add")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
