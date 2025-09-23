import { useEffect, useState } from "react";
import axios from "../../api/axios";
import toast from "react-hot-toast";
import React from "react";
import { X, User, BookOpen, Calendar, Hash, MessageSquare, Save, MapPin, Clock } from "lucide-react";

const AttendanceModal = (props) => {
  const {
    isOpen,
    onClose,
    students = [],
    departments = [],
    courses = [],
    selectedAttendance,
    onSuccess,
  } = props;
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
  const [errors, setErrors] = useState({});

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
      // Set default values for new attendance
      const today = new Date().toISOString().split('T')[0];
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      
      setFormData({
        student: "",
        department: "",
        course: "",
        term: "Fall",
        semester: "1",
        academicYear: `${currentYear}/${nextYear}`,
        lectureDate: today,
        lectureNumber: "1",
        status: "Present",
        remarks: "",
      });
    }
  }, [selectedAttendance]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.student) newErrors.student = "Student is required";
    if (!formData.department) newErrors.department = "Department is required";
    if (!formData.course) newErrors.course = "Course is required";
    if (!formData.term) newErrors.term = "Term is required";
    if (!formData.semester) newErrors.semester = "Semester is required";
    if (!formData.academicYear) newErrors.academicYear = "Academic year is required";
    if (!formData.lectureDate) newErrors.lectureDate = "Lecture date is required";
    if (!formData.lectureNumber) newErrors.lectureNumber = "Lecture number is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const url = selectedAttendance
        ? `/attendance/${selectedAttendance._id}`
        : "/attendance";
      const method = selectedAttendance ? "put" : "post";
      
      await axios[method](url, formData);
      onSuccess?.();
      onClose?.();
      toast.success(`Attendance ${selectedAttendance ? 'updated' : 'added'} successfully!`);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full relative max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2
                id="attendance-modal-title"
                className="text-2xl font-bold"
              >
                {selectedAttendance ? "Edit Attendance" : "Add Attendance"}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {selectedAttendance ? "Update attendance record" : "Create a new attendance record"}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="text-white hover:text-gray-200 hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
              disabled={isSubmitting}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Form Grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Student */}
              <div>
                <label
                  className="mb-2 text-sm font-semibold text-gray-700 flex items-center"
                >
                  <User className="w-4 h-4 mr-1 text-blue-500" />
                  Student <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  id="student"
                  name="student"
                  value={formData.student}
                  onChange={handleChange}
                  required
                  className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 transition-colors ${
                    errors.student
                      ? "border-red-500 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 hover:border-blue-500 focus:ring-blue-600"
                  }`}
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
                {errors.student && (
                  <p className="mt-1 text-sm text-red-600">{errors.student}</p>
                )}
              </div>

              {/* Department */}
              <div>
                <label
                  htmlFor="department"
                  className="block mb-2 text-sm font-semibold text-gray-700 flex items-center"
                >
                  <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                  Department <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 transition-colors ${
                    errors.department
                      ? "border-red-500 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 hover:border-blue-500 focus:ring-blue-600"
                  }`}
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
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                )}
              </div>

              {/* Course */}
              <div>
                <label
                  htmlFor="course"
                  className="block mb-2 text-sm font-semibold text-gray-700 flex items-center"
                >
                  <BookOpen className="w-4 h-4 mr-1 text-blue-500" />
                  Course <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                  className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 transition-colors ${
                    errors.course
                      ? "border-red-500 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 hover:border-blue-500 focus:ring-blue-600"
                  }`}
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
                {errors.course && (
                  <p className="mt-1 text-sm text-red-600">{errors.course}</p>
                )}
              </div>

              {/* Term */}
              <div>
                <label
                  htmlFor="term"
                  className="block mb-2 text-sm font-semibold text-gray-700 flex items-center"
                >
                  <Calendar className="w-4 h-4 mr-1 text-blue-500" />
                  Term <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="term"
                  type="text"
                  name="term"
                  value={formData.term}
                  onChange={handleChange}
                  placeholder="e.g., Fall"
                  required
                  className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 transition-colors ${
                    errors.term
                      ? "border-red-500 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 hover:border-blue-500 focus:ring-blue-600"
                  }`}
                />
                {errors.term && (
                  <p className="mt-1 text-sm text-red-600">{errors.term}</p>
                )}
              </div>

              {/* Semester */}
              <div>
                <label
                  htmlFor="semester"
                  className="block mb-2 text-sm font-semibold text-gray-700 flex items-center"
                >
                  <Hash className="w-4 h-4 mr-1 text-blue-500" />
                  Semester <span className="text-red-500 ml-1">*</span>
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
                  className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 transition-colors ${
                    errors.semester
                      ? "border-red-500 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 hover:border-blue-500 focus:ring-blue-600"
                  }`}
                />
                {errors.semester && (
                  <p className="mt-1 text-sm text-red-600">{errors.semester}</p>
                )}
              </div>

              {/* Academic Year */}
              <div>
                <label
                  htmlFor="academicYear"
                  className="block mb-2 text-sm font-semibold text-gray-700 flex items-center"
                >
                  <Calendar className="w-4 h-4 mr-1 text-blue-500" />
                  Academic Year <span className="text-red-500 ml-1">*</span>
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
                  className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 transition-colors ${
                    errors.academicYear
                      ? "border-red-500 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 hover:border-blue-500 focus:ring-blue-600"
                  }`}
                />
                {errors.academicYear && (
                  <p className="mt-1 text-sm text-red-600">{errors.academicYear}</p>
                )}
              </div>

              {/* Lecture Date */}
              <div>
                <label
                  htmlFor="lectureDate"
                  className="block mb-2 text-sm font-semibold text-gray-700 flex items-center"
                >
                  <Calendar className="w-4 h-4 mr-1 text-blue-500" />
                  Lecture Date <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  id="lectureDate"
                  type="date"
                  name="lectureDate"
                  value={formData.lectureDate}
                  onChange={handleChange}
                  required
                  className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 transition-colors ${
                    errors.lectureDate
                      ? "border-red-500 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 hover:border-blue-500 focus:ring-blue-600"
                  }`}
                />
                {errors.lectureDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.lectureDate}</p>
                )}
              </div>

              {/* Lecture Number */}
              <div>
                <label
                  htmlFor="lectureNumber"
                  className="block mb-2 text-sm font-semibold text-gray-700 flex items-center"
                >
                  <Hash className="w-4 h-4 mr-1 text-blue-500" />
                  Lecture Number <span className="text-red-500 ml-1">*</span>
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
                  className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 transition-colors ${
                    errors.lectureNumber
                      ? "border-red-500 focus:ring-red-500 bg-red-50"
                      : "border-gray-300 hover:border-blue-500 focus:ring-blue-600"
                  }`}
                />
                {errors.lectureNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.lectureNumber}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="block mb-2 text-sm font-semibold text-gray-700 flex items-center"
                >
                  <Clock className="w-4 h-4 mr-1 text-blue-500" />
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors"
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
                className="block mb-2 text-sm font-semibold text-gray-700 flex items-center"
              >
                <MessageSquare className="w-4 h-4 mr-1 text-blue-500" />
                Remarks
              </label>
              <textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Optional notes..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium flex items-center transition-colors ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {selectedAttendance ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {selectedAttendance ? "Update" : "Add"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AttendanceModal;