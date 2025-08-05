import React, { useState, useEffect } from "react";
import axios from "../../api/axios";

export default function ClassFormModal({ open, setOpen, onSave, initialData }) {
  const [formData, setFormData] = useState({
    className: "",
    subject: "",
    teacher: "",
    room: "",
    schedule: { day: "", time: "" },
  });

  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        className: initialData.className || "",
        subject: initialData.subject || "",
        teacher: initialData.teacher?._id || "",
        room: initialData.room || "",
        schedule: {
          day: initialData.schedule?.day || "",
          time: initialData.schedule?.time || "",
        },
      });
    } else {
      setFormData({
        className: "",
        subject: "",
        teacher: "",
        room: "",
        schedule: { day: "", time: "" },
      });
    }
  }, [initialData]);

  useEffect(() => {
    const fetchTeachers = async () => {
      setLoadingTeachers(true);
      try {
        const res = await axios.get("/teachers");
        setTeachers(res.data);
      } catch {
        setTeachers([]);
      } finally {
        setLoadingTeachers(false);
      }
    };
    fetchTeachers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "day" || name === "time") {
      setFormData((prev) => ({
        ...prev,
        schedule: { ...prev.schedule, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.className || !formData.subject || !formData.teacher) {
      alert("Please fill Class Name, Subject, and select Teacher.");
      return;
    }
    onSave(formData);
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
          {/* Close button */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition text-2xl font-bold"
            aria-label="Close modal"
          >
            &times;
          </button>

          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-6 text-center text-blue-700">
              {initialData ? "Edit Class" : "Add Class"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="className" className="block mb-1 font-medium">
                  Class Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="className"
                  name="className"
                  type="text"
                  value={formData.className}
                  onChange={handleChange}
                  placeholder="e.g., Class 6"
                  required
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block mb-1 font-medium">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="e.g., Mathematics"
                  required
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>

              <div>
                <label htmlFor="teacher" className="block mb-1 font-medium">
                  Teacher <span className="text-red-500">*</span>
                </label>
                <select
                  id="teacher"
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleChange}
                  disabled={loadingTeachers}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="room" className="block mb-1 font-medium">
                  Room
                </label>
                <input
                  id="room"
                  name="room"
                  type="text"
                  value={formData.room}
                  onChange={handleChange}
                  placeholder="e.g., Room 101"
                  className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="day" className="block mb-1 font-medium">
                    Schedule Day
                  </label>
                  <input
                    id="day"
                    name="day"
                    type="text"
                    value={formData.schedule.day}
                    onChange={handleChange}
                    placeholder="e.g., Monday"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  />
                </div>

                <div>
                  <label htmlFor="time" className="block mb-1 font-medium">
                    Schedule Time
                  </label>
                  <input
                    id="time"
                    name="time"
                    type="text"
                    value={formData.schedule.time}
                    onChange={handleChange}
                    placeholder="e.g., 9:00 AM - 10:30 AM"
                    className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition"
              >
                {initialData ? "Update Class" : "Add Class"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
