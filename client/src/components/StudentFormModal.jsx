import React, { useState, useEffect } from "react";

export default function StudentFormModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    class: "",
    rollNumber: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    guardianName: "",
    guardianPhone: "",
    enrollmentDate: "",
    status: "Active",
    profilePicture: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        class: initialData.class || "",
        rollNumber: initialData.rollNumber || "",
        dateOfBirth: initialData.dateOfBirth
          ? new Date(initialData.dateOfBirth).toISOString().substr(0, 10)
          : "",
        gender: initialData.gender || "",
        address: initialData.address || "",
        guardianName: initialData.guardianName || "",
        guardianPhone: initialData.guardianPhone || "",
        enrollmentDate: initialData.enrollmentDate
          ? new Date(initialData.enrollmentDate).toISOString().substr(0, 10)
          : "",
        status: initialData.status || "Active",
        profilePicture: initialData.profilePicture || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        class: "",
        rollNumber: "",
        dateOfBirth: "",
        gender: "",
        address: "",
        guardianName: "",
        guardianPhone: "",
        enrollmentDate: "",
        status: "Active",
        profilePicture: "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation for required fields
    if (!formData.name || !formData.email || !formData.class) {
      alert("Name, Email, and Class are required.");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 overflow-auto max-h-[90vh] relative">
        {/* Cross close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-gray-600 hover:text-red-900 text-2xl font-bold"
          type="button"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Edit Student" : "Add Student"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block mb-1 font-semibold">Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1 font-semibold">Email*</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block mb-1 font-semibold">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Optional"
              />
            </div>

            {/* Class */}
            <div>
              <label className="block mb-1 font-semibold">Class*</label>
              <input
                type="text"
                name="class"
                value={formData.class}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g., Class 6"
                required
              />
            </div>

            {/* Roll Number */}
            <div>
              <label className="block mb-1 font-semibold">Roll Number</label>
              <input
                type="text"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Optional"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block mb-1 font-semibold">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block mb-1 font-semibold">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block mb-1 font-semibold">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="w-full border border-gray-300 rounded px-3 py-2 resize-none"
                placeholder="Optional"
              ></textarea>
            </div>

            {/* Guardian Name */}
            <div>
              <label className="block mb-1 font-semibold">Guardian Name</label>
              <input
                type="text"
                name="guardianName"
                value={formData.guardianName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Optional"
              />
            </div>

            {/* Guardian Phone */}
            <div>
              <label className="block mb-1 font-semibold">Guardian Phone</label>
              <input
                type="tel"
                name="guardianPhone"
                value={formData.guardianPhone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Optional"
              />
            </div>

            {/* Enrollment Date */}
            <div>
              <label className="block mb-1 font-semibold">Enrollment Date</label>
              <input
                type="date"
                name="enrollmentDate"
                value={formData.enrollmentDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block mb-1 font-semibold">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Graduated">Graduated</option>
                <option value="Transferred">Transferred</option>
              </select>
            </div>

            {/* Profile Picture URL */}
            <div className="md:col-span-2">
              <label className="block mb-1 font-semibold">Profile Picture URL</label>
              <input
                type="url"
                name="profilePicture"
                value={formData.profilePicture}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => {
                onClose();
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  class: "",
                  rollNumber: "",
                  dateOfBirth: "",
                  gender: "",
                  address: "",
                  guardianName: "",
                  guardianPhone: "",
                  enrollmentDate: "",
                  status: "Active",
                  profilePicture: "",
                });
              }}
              className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {initialData ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
