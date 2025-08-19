import React, { useState, useEffect, useRef } from "react";
import axios from "../../api/axios";

export default function ClassFormModal({ open, setOpen, onSave, initialData }) {
  const [formData, setFormData] = useState({
    courseCode: "",
    className: "",
    subject: "",
    department: "",
    semester: "",
    credits: "",
    teacher: "",
    room: "",
    schedule: [{ day: "", time: "" }],
  });

  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstInputRef = useRef(null);

  // --- helper: normalize API shapes to an array ---
  const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.departments)) return payload.departments;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  };

  // Load form data
  useEffect(() => {
    if (initialData) {
      setFormData({
        courseCode: initialData.courseCode || "",
        className: initialData.className || "",
        subject: initialData.subject || "",
        department: initialData.department?._id || initialData.department || "",
        semester: initialData.semester || "",
        credits:
          typeof initialData.credits === "number"
            ? String(initialData.credits)
            : "",
        teacher: initialData.teacher?._id || initialData.teacher || "",
        room: initialData.room || "",
        schedule: initialData.schedule?.length
          ? initialData.schedule.map((s) => ({
              day: s.day ?? "",
              time: s.time ?? "",
            }))
          : [{ day: "", time: "" }],
      });
    } else {
      setFormData({
        courseCode: "",
        className: "",
        subject: "",
        department: "",
        semester: "",
        credits: "",
        teacher: "",
        room: "",
        schedule: [{ day: "", time: "" }],
      });
    }
  }, [initialData]);

  // Fetch teachers
  useEffect(() => {
    setLoadingTeachers(true);
    axios
      .get("/teachers")
      .then((res) => setTeachers(toArray(res?.data)))
      .catch(() => setTeachers([]))
      .finally(() => setLoadingTeachers(false));
  }, []);

  // Fetch departments
  useEffect(() => {
    setLoadingDepartments(true);
    axios
      .get("/departments")
      .then((res) => setDepartments(toArray(res?.data)))
      .catch(() => setDepartments([]))
      .finally(() => setLoadingDepartments(false));
  }, []);

  // Focus first input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleChange = (e, index = null, scheduleField = null) => {
    const { name, value } = e.target;
    if (scheduleField !== null && index !== null) {
      const updatedSchedule = [...formData.schedule];
      updatedSchedule[index][scheduleField] = value;
      setFormData((prev) => ({ ...prev, schedule: updatedSchedule }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addScheduleSlot = () => {
    setFormData((prev) => ({
      ...prev,
      schedule: [...prev.schedule, { day: "", time: "" }],
    }));
  };

  const removeScheduleSlot = (index) => {
    setFormData((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Clean + coerce
    const cleanedSchedule = formData.schedule
      .map((s) => ({ day: s.day.trim(), time: s.time.trim() }))
      .filter((s) => s.day && s.time);

    const payload = {
      courseCode: formData.courseCode.trim(),
      className: formData.className.trim(),
      subject: formData.subject.trim(),
      department: formData.department, // string ObjectId (Mongoose will cast)
      semester: formData.semester.trim(),
      credits:
        formData.credits === "" ? undefined : Number(formData.credits),
      teacher: formData.teacher, // string ObjectId
      room: formData.room.trim(),
      schedule: cleanedSchedule,
    };

    if (!payload.className || !payload.subject || !payload.teacher || !payload.department) {
      alert("Please fill Class Name, Subject, Teacher, and Department.");
      return;
    }

    setIsSubmitting(true);
    Promise.resolve(onSave(payload))
      .catch(() => {
        alert("Failed to save class data.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  if (!open) return null;

  const deptList = Array.isArray(departments) ? departments : [];
  const teacherList = Array.isArray(teachers) ? teachers : [];

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => !isSubmitting && setOpen(false)}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 transition-opacity"
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
          role="dialog"
          aria-modal="true"
          aria-labelledby="class-form-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={() => !isSubmitting && setOpen(false)}
            className={`absolute top-4 right-4 text-gray-500 hover:text-red-600 transition text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-red-600 rounded ${
              isSubmitting ? "cursor-not-allowed opacity-50" : ""
            }`}
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            &times;
          </button>

          <div className="p-6">
            <h2
              id="class-form-title"
              className="text-2xl font-semibold mb-6 text-center text-blue-700 select-none"
            >
              {initialData ? "Edit Class" : "Add Class"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 font-medium" htmlFor="courseCode">
                  Course Code
                </label>
                <input
                  id="courseCode"
                  name="courseCode"
                  type="text"
                  value={formData.courseCode}
                  onChange={handleChange}
                  placeholder="Optional, e.g., CS101"
                  className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block mb-2 font-medium" htmlFor="className">
                  Class Name <span className="text-red-600">*</span>
                </label>
                <input
                  id="className"
                  name="className"
                  type="text"
                  value={formData.className}
                  onChange={handleChange}
                  placeholder="e.g., Intro to Computer Science"
                  required
                  ref={firstInputRef}
                  className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block mb-2 font-medium" htmlFor="subject">
                  Subject <span className="text-red-600">*</span>
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science"
                  required
                  className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block mb-2 font-medium" htmlFor="department">
                  Department <span className="text-red-600">*</span>
                </label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  disabled={loadingDepartments || isSubmitting}
                >
                  <option value="">Select Department</option>
                  {deptList.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium" htmlFor="semester">
                  Semester
                </label>
                <input
                  id="semester"
                  name="semester"
                  type="text"
                  value={formData.semester}
                  onChange={handleChange}
                  placeholder="e.g., Fall 2025"
                  className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block mb-2 font-medium" htmlFor="credits">
                  Credits
                </label>
                <input
                  id="credits"
                  name="credits"
                  type="number"
                  min={0}
                  value={formData.credits}
                  onChange={handleChange}
                  placeholder="e.g., 3"
                  className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block mb-2 font-medium" htmlFor="teacher">
                  Teacher <span className="text-red-600">*</span>
                </label>
                <select
                  id="teacher"
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  disabled={loadingTeachers || isSubmitting}
                >
                  <option value="">Select Teacher</option>
                  {teacherList.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium" htmlFor="room">
                  Room
                </label>
                <input
                  id="room"
                  name="room"
                  type="text"
                  value={formData.room}
                  onChange={handleChange}
                  placeholder="e.g., Room 101"
                  className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  disabled={isSubmitting}
                />
              </div>

              {/* Schedule Section */}
              <div>
                <label className="block mb-2 font-medium">Schedule</label>
                {formData.schedule.map((slot, index) => (
                  <div key={index} className="flex gap-2 mb-3 items-center">
                    <input
                      type="text"
                      value={slot.day}
                      onChange={(e) => handleChange(e, index, "day")}
                      placeholder="Day e.g., Monday"
                      aria-label={`Schedule day ${index + 1}`}
                      className="w-1/2 border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                      disabled={isSubmitting}
                    />
                    <input
                      type="text"
                      value={slot.time}
                      onChange={(e) => handleChange(e, index, "time")}
                      placeholder="Time e.g., 9:00 AM - 10:30 AM"
                      aria-label={`Schedule time ${index + 1}`}
                      className="w-1/2 border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                      disabled={isSubmitting}
                    />
                    {formData.schedule.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeScheduleSlot(index)}
                        className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                        aria-label={`Remove schedule slot ${index + 1}`}
                        disabled={isSubmitting}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addScheduleSlot}
                  className="text-blue-600 text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                  disabled={isSubmitting}
                >
                  + Add another schedule
                </button>
              </div>

              <button
                type="submit"
                disabled={loadingTeachers || loadingDepartments || isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-md transition disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-500"
                aria-live="polite"
              >
                {isSubmitting
                  ? initialData
                    ? "Updating Class..."
                    : "Adding Class..."
                  : initialData
                  ? "Update Class"
                  : "Add Class"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
