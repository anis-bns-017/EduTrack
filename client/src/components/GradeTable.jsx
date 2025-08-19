import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import { toast } from "react-hot-toast";

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

  const [departments, setDepartments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get("/departments");
        if (Array.isArray(res.data)) {
          setDepartments(res.data);
        } else {
          setDepartments([]);
        }
      } catch (err) {
        console.error(err);
        setDepartments([]);
      }
    };

    const fetchTeachers = async () => {
      try {
        const res = await axios.get("/teachers");
        if (Array.isArray(res.data)) {
          setTeachers(res.data);
        } else {
          setTeachers([]);
        }
      } catch (err) {
        console.error(err);
        setTeachers([]);
      }
    };

    fetchDepartments();
    fetchTeachers();
  }, []);

  // Load data if editing
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (index, field, value) => {
    const updatedSchedule = [...formData.schedule];
    updatedSchedule[index][field] = value;
    setFormData((prev) => ({ ...prev, schedule: updatedSchedule }));
  };

  const handleAddSchedule = () => {
    setFormData((prev) => ({
      ...prev,
      schedule: [...prev.schedule, { day: "", time: "" }],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData) {
        await axios.put(`/classes/${initialData._id}`, formData);
        toast.success("Class updated successfully");
      } else {
        await axios.post("/classes", formData);
        toast.success("Class created successfully");
      }
      onSave();
      setOpen(false);
    } catch (error) {
      toast.error("Failed to save class");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-2/3">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Edit Class" : "Add Class"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="courseCode"
            placeholder="Course Code"
            value={formData.courseCode}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />

          <input
            type="text"
            name="className"
            placeholder="Class Name"
            value={formData.className}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />

          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />

          {/* Department dropdown */}
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          >
            <option value="">Select Department</option>
            {(departments || []).map((dept) => (
              <option key={dept._id || dept.name} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>

          {/* Teacher dropdown */}
          <select
            name="teacher"
            value={formData.teacher}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          >
            <option value="">Select Teacher</option>
            {(teachers || []).map((t) => (
              <option key={t._id || t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="semester"
            placeholder="Semester"
            value={formData.semester}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />

          <input
            type="number"
            name="credits"
            placeholder="Credits"
            value={formData.credits}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />

          <input
            type="text"
            name="room"
            placeholder="Room"
            value={formData.room}
            onChange={handleChange}
            className="border p-2 w-full"
            required
          />

          {/* Schedule section */}
          <div>
            <label className="font-semibold">Schedule:</label>
            {formData.schedule.map((sch, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Day"
                  value={sch.day}
                  onChange={(e) =>
                    handleScheduleChange(idx, "day", e.target.value)
                  }
                  className="border p-2 flex-1"
                  required
                />
                <input
                  type="text"
                  placeholder="Time"
                  value={sch.time}
                  onChange={(e) =>
                    handleScheduleChange(idx, "time", e.target.value)
                  }
                  className="border p-2 flex-1"
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddSchedule}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              + Add Schedule
            </button>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
