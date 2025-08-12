import React, { useState, useEffect } from "react";
import axios from "../../api/axios"; // Make sure to install axios if not already

export default function StudentFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}) {
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [error, setError] = useState(null);

  const faculties = [
    "Faculty of Science",
    "Faculty of Engineering & Technology",
    "Faculty of Arts",
    "Faculty of Business Studies",
    "Faculty of Law",
    "Faculty of Social Science",
    "Faculty of Biological Science",
    "Faculty of Medicine",
    "Faculty of Fine Arts",
  ];

  const programs = [
    "BSc",
    "BA",
    "BBA",
    "BSS",
    "LLB",
    "MBBS",
    "MSc",
    "MA",
    "MBA",
    "MSS",
    "LLM",
    "PhD",
  ];

  const semesters = [
    "1st Semester",
    "2nd Semester",
    "3rd Semester",
    "4th Semester",
    "5th Semester",
    "6th Semester",
    "7th Semester",
    "8th Semester",
  ];

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    faculty: "",
    department: "",
    program: "",
    batch: "",
    semester: "",
    registrationNumber: "",
    rollNumber: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    guardianName: "",
    guardianPhone: "",
    emergencyContact: "",
    enrollmentDate: "",
    status: "Active",
    bloodGroup: "",
    nationalId: "",
    hallName: "",
    profilePicture: "",
  });

 useEffect(() => {
  const fetchDepartments = async () => {
    try {
      const response = await axios.get("/departments");
      console.log("Full API response:", response);
      console.log("response.data:", response.data);

      // Adjust this line if your data is nested inside response.data.data
      const departmentsData = Array.isArray(response.data.data) ? response.data.data : [];

      console.log("Processed departments:", departmentsData);
      setDepartments(departmentsData);
      setLoadingDepartments(false);
    } catch (err) {
      setError("Failed to load departments");
      setLoadingDepartments(false);
      console.error("Error fetching departments:", err);
      setDepartments([]);
    }
  };

  if (isOpen) {
    fetchDepartments();
  }
}, [isOpen]);


  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        dateOfBirth: initialData.dateOfBirth
          ? new Date(initialData.dateOfBirth).toISOString().substr(0, 10)
          : "",
        enrollmentDate: initialData.enrollmentDate
          ? new Date(initialData.enrollmentDate).toISOString().substr(0, 10)
          : "",
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
    if (
      !formData.name ||
      !formData.email ||
      !formData.department ||
      !formData.program
    ) {
      alert("Please fill all required fields.");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 overflow-auto max-h-[90vh] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-900 text-2xl font-bold"
          type="button"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Edit Student" : "Add Student"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block mb-1 font-semibold">Full Name*</label>
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
              />
            </div>

            {/* Faculty */}
            <div>
              <label className="block mb-1 font-semibold">Faculty*</label>
              <select
                name="faculty"
                value={formData.faculty}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">Select Faculty</option>
                {faculties.map((fac) => (
                  <option key={fac} value={fac}>
                    {fac}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block mb-1 font-semibold">Department*</label>
              {loadingDepartments ? (
                <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 animate-pulse">
                  Loading departments...
                </div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : (
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.length > 0 ? (
                    departments.map((dept) => (
                      <option key={dept._id || dept.name} value={dept.name}>
                        {dept.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No departments available
                    </option>
                  )}
                </select>
              )}
            </div>

            {/* Rest of the form remains the same */}
            {/* Program */}
            <div>
              <label className="block mb-1 font-semibold">Program*</label>
              <select
                name="program"
                value={formData.program}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="">Select Program</option>
                {programs.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch */}
            <div>
              <label className="block mb-1 font-semibold">Session/Batch</label>
              <input
                type="text"
                name="batch"
                placeholder="e.g., 2021-2022"
                value={formData.batch}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            {/* Semester */}
            <div>
              <label className="block mb-1 font-semibold">Semester</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select Semester</option>
                {semesters.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Registration No */}
            <div>
              <label className="block mb-1 font-semibold">
                Registration No
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            {/* Roll No */}
            <div>
              <label className="block mb-1 font-semibold">Roll No</label>
              <input
                type="text"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            {/* DOB */}
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
              />
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="block mb-1 font-semibold">
                Emergency Contact
              </label>
              <input
                type="tel"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            {/* Blood Group */}
            <div>
              <label className="block mb-1 font-semibold">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select Blood Group</option>
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            {/* NID */}
            <div>
              <label className="block mb-1 font-semibold">
                National ID / Birth Certificate No.
              </label>
              <input
                type="text"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            {/* Hall Name */}
            <div>
              <label className="block mb-1 font-semibold">
                Hall Name (if any)
              </label>
              <input
                type="text"
                name="hallName"
                value={formData.hallName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            {/* Enrollment Date */}
            <div>
              <label className="block mb-1 font-semibold">
                Enrollment Date
              </label>
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
                <option value="Dropped">Dropped</option>
              </select>
            </div>

            {/* Profile Picture */}
            <div className="md:col-span-2">
              <label className="block mb-1 font-semibold">
                Profile Picture URL
              </label>
              <input
                type="url"
                name="profilePicture"
                value={formData.profilePicture}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
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
                  faculty: "",
                  department: "",
                  program: "",
                  batch: "",
                  semester: "",
                  registrationNumber: "",
                  rollNumber: "",
                  dateOfBirth: "",
                  gender: "",
                  address: "",
                  guardianName: "",
                  guardianPhone: "",
                  emergencyContact: "",
                  enrollmentDate: "",
                  status: "Active",
                  bloodGroup: "",
                  nationalId: "",
                  hallName: "",
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
