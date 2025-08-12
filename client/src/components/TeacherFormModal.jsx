import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import toast from "react-hot-toast";

export default function TeacherFormModal({ isOpen, onClose, onSuccess, teacher }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    gender: "",
    address: "",
    experience: "",
    joiningDate: "",
    status: "Active",
    qualifications: "",
    officeRoom: "",
    profilePicture: "",
  });

  // List of common Bangladeshi university departments
  const departments = [
    "Computer Science and Engineering (CSE)",
    "Electrical and Electronic Engineering (EEE)",
    "Civil Engineering (CE)",
    "Mechanical Engineering (ME)",
    "Industrial and Production Engineering (IPE)",
    "Architecture",
    "Chemical Engineering",
    "Biomedical Engineering",
    "Textile Engineering",
    "Business Administration (BBA)",
    "Accounting",
    "Finance",
    "Marketing",
    "Management",
    "Economics",
    "Statistics",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biochemistry and Molecular Biology",
    "Pharmacy",
    "Law",
    "English",
    "Bangla",
    "History",
    "Political Science",
    "Sociology",
    "Anthropology",
    "Psychology",
    "Public Administration",
    "International Relations",
    "Geography and Environment",
    "Environmental Science",
    "Agriculture",
    "Fisheries",
    "Food and Nutrition",
    "Education",
    "Fine Arts",
    "Music",
    "Islamic Studies",
    "Other"
  ];

  useEffect(() => {
    if (teacher) {
      setFormData({
        ...teacher,
        experience: teacher.experience != null ? teacher.experience : "",
        joiningDate: teacher.joiningDate
          ? new Date(teacher.joiningDate).toISOString().substr(0, 10)
          : "",
        status: teacher.status || "Active",
        gender: teacher.gender || "",
        qualifications: teacher.qualifications || "",
        officeRoom: teacher.officeRoom || "",
        profilePicture: teacher.profilePicture || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        department: "",
        designation: "",
        gender: "",
        address: "",
        experience: "",
        joiningDate: "",
        status: "Active",
        qualifications: "",
        officeRoom: "",
        profilePicture: "",
      });
    }
  }, [teacher]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    // For experience (number), ensure empty string if invalid input
    if (name === "experience") {
      const val = value === "" ? "" : Number(value);
      setFormData((prev) => ({ ...prev, [name]: val }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (teacher) {
        await axios.post(`/teachers/${teacher._id}`, formData);
        toast.success("Teacher updated successfully");
      } else {
        await axios.post("/teachers", formData);
        toast.success("Teacher added successfully");
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.error(
        "Failed to save teacher: " +
          (err.response?.data?.message || "Unknown error")
      );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-[95%] md:w-[600px] max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-600 text-2xl transition"
          aria-label="Close"
          type="button"
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-center text-green-700">
          {teacher ? "Edit Teacher" : "Add Teacher"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Name"
                onChange={handleChange}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Email"
                onChange={handleChange}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Phone"
                onChange={handleChange}
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium mb-1">Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              >
                <option value="" disabled>
                  Select Department
                </option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-medium mb-1">Designation *</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Designation"
                onChange={handleChange}
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium mb-1">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Address"
                onChange={handleChange}
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium mb-1">Experience (years)</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Experience"
                onChange={handleChange}
                min={0}
              />
            </div>

            {/* Joining Date */}
            <div>
              <label className="block text-sm font-medium mb-1">Joining Date</label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                onChange={handleChange}
              />
            </div>

            {/* Qualifications */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Qualifications</label>
              <input
                type="text"
                name="qualifications"
                value={formData.qualifications}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="E.g., PhD in Computer Science"
                onChange={handleChange}
              />
            </div>

            {/* Office Room */}
            <div>
              <label className="block text-sm font-medium mb-1">Office Room</label>
              <input
                type="text"
                name="officeRoom"
                value={formData.officeRoom}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Office location or room number"
                onChange={handleChange}
              />
            </div>

            {/* Profile Picture URL */}
            <div>
              <label className="block text-sm font-medium mb-1">Profile Picture URL</label>
              <input
                type="url"
                name="profilePicture"
                value={formData.profilePicture}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Optional"
                onChange={handleChange}
              />
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                onChange={handleChange}
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
          >
            {teacher ? "Update Teacher" : "Add Teacher"}
          </button>
        </form>
      </div>
    </div>
  );
}
