import { useState, useEffect } from "react";
import axios from "../../api/axios";
import toast from "react-hot-toast";
import React from "react";
import {
  FaTimes,
  FaUser,
  FaGraduationCap,
  FaBriefcase,
  FaGlobe,
  FaPlus,
  FaMinus,
} from "react-icons/fa";

export default function TeacherFormModal({
  isOpen,
  onClose,
  onSuccess,
  teacher,
}) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    department: "",
    faculty: "",
    designation: "",
    qualification: "",
    specialization: [""],
    joiningDate: "",
    dateOfBirth: "",
    gender: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    officeLocation: "",
    officeHours: [],
    phone: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
      email: "",
    },
    coursesTeaching: [],
    researchInterests: [""],
    publications: [],
    experience: "",
    salary: "",
    isActive: true,
    role: "teacher",
    profilePhoto: "default.jpg",
    bio: "",
    socialMedia: {
      linkedIn: "",
      twitter: "",
      researchGate: "",
      googleScholar: "",
    },
  });

  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Predefined designations
  const designations = [
    "Professor",
    "Associate Professor",
    "Assistant Professor",
    "Lecturer",
    "Visiting Faculty",
    "Adjunct Professor",
  ];

  // Predefined qualifications
  const qualifications = [
    "PhD",
    "MSc",
    "MBA",
    "MA",
    "MPhil",
    "BSc",
    "BA",
    "Other",
  ];

  // Days for office hours
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [deptsRes, coursesRes] = await Promise.all([
          axios.get("/departments"),
          axios.get("/courses"),
        ]);

        setDepartments(deptsRes.data.data || []);

        setCourses(coursesRes.data.data || []);
      } catch (err) {
        toast.error(
          "Failed to load data: " + (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (teacher) {
      setFormData({
        firstName: teacher.firstName || "",
        lastName: teacher.lastName || "",
        email: teacher.email || "",
        password: "",
        department: teacher.department?._id || teacher.department || "",
        faculty: teacher.faculty?._id || teacher.faculty || "",
        designation: teacher.designation || "",
        qualification: teacher.qualification || "",
        specialization: teacher.specialization || [""],
        joiningDate: teacher.joiningDate
          ? new Date(teacher.joiningDate).toISOString().split("T")[0]
          : "",
        dateOfBirth: teacher.dateOfBirth
          ? new Date(teacher.dateOfBirth).toISOString().split("T")[0]
          : "",
        gender: teacher.gender || "",
        address: teacher.address || {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
        officeLocation: teacher.officeLocation || "",
        officeHours: teacher.officeHours || [],
        phone: teacher.phone || "",
        emergencyContact: teacher.emergencyContact || {
          name: "",
          relationship: "",
          phone: "",
          email: "",
        },
        coursesTeaching: teacher.coursesTeaching || [],
        researchInterests: teacher.researchInterests || [""],
        publications: teacher.publications || [],
        experience: teacher.experience || "",
        salary: teacher.salary || "",
        isActive: teacher.isActive !== undefined ? teacher.isActive : true,
        role: teacher.role || "teacher",
        profilePhoto: teacher.profilePhoto || "default.jpg",
        bio: teacher.bio || "",
        socialMedia: teacher.socialMedia || {
          linkedIn: "",
          twitter: "",
          researchGate: "",
          googleScholar: "",
        },
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        department: "",
        faculty: "",
        designation: "",
        qualification: "",
        specialization: [""],
        joiningDate: "",
        dateOfBirth: "",
        gender: "",
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
        officeLocation: "",
        officeHours: [],
        phone: "",
        emergencyContact: {
          name: "",
          relationship: "",
          phone: "",
          email: "",
        },
        coursesTeaching: [],
        researchInterests: [""],
        publications: [],
        experience: "",
        salary: "",
        isActive: true,
        role: "teacher",
        profilePhoto: "default.jpg",
        bio: "",
        socialMedia: {
          linkedIn: "",
          twitter: "",
          researchGate: "",
          googleScholar: "",
        },
      });
    }
  }, [teacher]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("socialMedia.")) {
      const platform = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [platform]: value,
        },
      }));
    } else if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }));
    } else if (name.startsWith("emergencyContact.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value,
        },
      }));
    } else if (name === "specialization") {
      setFormData((prev) => ({
        ...prev,
        specialization: value.split(",").map((item) => item.trim()),
      }));
    } else if (name === "researchInterests") {
      setFormData((prev) => ({
        ...prev,
        researchInterests: value.split(",").map((item) => item.trim()),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleOfficeHoursChange = (index, field, value) => {
    const updatedOfficeHours = [...formData.officeHours];
    updatedOfficeHours[index] = {
      ...updatedOfficeHours[index],
      [field]: value,
    };
    setFormData((prev) => ({ ...prev, officeHours: updatedOfficeHours }));
  };

  const addOfficeHours = () => {
    setFormData((prev) => ({
      ...prev,
      officeHours: [
        ...prev.officeHours,
        { day: "", startTime: "", endTime: "" },
      ],
    }));
  };

  const removeOfficeHours = (index) => {
    setFormData((prev) => ({
      ...prev,
      officeHours: prev.officeHours.filter((_, i) => i !== index),
    }));
  };

  const addPublication = () => {
    setFormData((prev) => ({
      ...prev,
      publications: [
        ...prev.publications,
        { title: "", journal: "", year: "", doi: "" },
      ],
    }));
  };

  const removePublication = (index) => {
    setFormData((prev) => ({
      ...prev,
      publications: prev.publications.filter((_, i) => i !== index),
    }));
  };

  const handlePublicationChange = (index, field, value) => {
    const updatedPublications = [...formData.publications];
    updatedPublications[index] = {
      ...updatedPublications[index],
      [field]: value,
    };
    setFormData((prev) => ({ ...prev, publications: updatedPublications }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        joiningDate: formData.joiningDate
          ? new Date(formData.joiningDate)
          : null,
        dateOfBirth: formData.dateOfBirth
          ? new Date(formData.dateOfBirth)
          : null,
      };

      // Remove password field if we're editing and it's empty
      if (teacher && !payload.password) {
        delete payload.password;
      }

      if (teacher) {
        await axios.put(`/teachers/${teacher._id}`, payload);
        toast.success("Teacher updated successfully");
      } else {
        await axios.post("/teachers", payload);
        toast.success("Teacher created successfully");
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(
        "Failed to save teacher: " +
          (err.response?.data?.message || "Unknown error")
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <FaUser className="text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {teacher ? "Edit Teacher" : "Add New Teacher"}
                </h2>
                <p className="text-blue-100 text-sm">
                  {teacher
                    ? "Update teacher information"
                    : "Fill in the details to create a new teacher profile"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
              aria-label="Close"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6">
            {loading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 backdrop-blur-sm">
                <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="text-gray-700 font-medium">Loading...</span>
                </div>
              </div>
            )}

            <div className="space-y-8">
              {/* Personal Information Section */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <FaUser className="text-blue-600 text-lg" />
                  <h3 className="text-xl font-semibold text-gray-800">
                    Personal Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {teacher ? "New Password" : "Password *"}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      placeholder={teacher ? "Leave blank to keep current" : ""}
                      required={!teacher}
                      minLength="8"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Salary
                    </label>
                    <input
                      type="number"
                      name="salary"
                      value={formData.salary}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      min="0"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Address
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        name="address.state"
                        value={formData.address.state}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        name="address.zipCode"
                        value={formData.address.zipCode}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Emergency Contact
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        name="emergencyContact.name"
                        value={formData.emergencyContact.name}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Relationship
                      </label>
                      <input
                        type="text"
                        name="emergencyContact.relationship"
                        value={formData.emergencyContact.relationship}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        placeholder="e.g., Spouse, Parent, Sibling"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        name="emergencyContact.phone"
                        value={formData.emergencyContact.phone}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        name="emergencyContact.email"
                        value={formData.emergencyContact.email}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Information Section */}
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <FaGraduationCap className="text-blue-600 text-lg" />
                  <h3 className="text-xl font-semibold text-gray-800">
                    Academic Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Department *
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Faculty *
                    </label>
                    <select
                      name="faculty"
                      value={formData.faculty}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      required
                    >
                      <option value="">Select Faculty</option>
                      {faculties.map((faculty) => (
                        <option key={faculty._id} value={faculty._id}>
                          {faculty.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Designation *
                    </label>
                    <select
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      required
                    >
                      <option value="">Select Designation</option>
                      {designations.map((title, index) => (
                        <option key={index} value={title}>
                          {title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Qualification *
                    </label>
                    <select
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      required
                    >
                      <option value="">Select Qualification</option>
                      {qualifications.map((qual, index) => (
                        <option key={index} value={qual}>
                          {qual}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Specialization *
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization.join(", ")}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      placeholder="Comma separated list of specializations"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Research Interests
                    </label>
                    <input
                      type="text"
                      name="researchInterests"
                      value={formData.researchInterests.join(", ")}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      placeholder="Comma separated research interests"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">
                      Publications
                    </h4>
                    <button
                      type="button"
                      onClick={addPublication}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                    >
                      <FaPlus className="text-sm" />
                      <span>Add Publication</span>
                    </button>
                  </div>

                  {formData.publications.map((publication, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                          </label>
                          <input
                            type="text"
                            value={publication.title}
                            onChange={(e) =>
                              handlePublicationChange(
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Journal
                          </label>
                          <input
                            type="text"
                            value={publication.journal}
                            onChange={(e) =>
                              handlePublicationChange(
                                index,
                                "journal",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Year
                          </label>
                          <input
                            type="number"
                            value={publication.year}
                            onChange={(e) =>
                              handlePublicationChange(
                                index,
                                "year",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            DOI
                          </label>
                          <input
                            type="text"
                            value={publication.doi}
                            onChange={(e) =>
                              handlePublicationChange(
                                index,
                                "doi",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePublication(index)}
                        className="text-red-600 hover:text-red-800 font-medium flex items-center space-x-1"
                      >
                        <FaMinus className="text-sm" />
                        <span>Remove Publication</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional Details Section */}
              <div className="bg-yellow-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <FaBriefcase className="text-yellow-600 text-lg" />
                  <h3 className="text-xl font-semibold text-gray-800">
                    Professional Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Joining Date *
                    </label>
                    <input
                      type="date"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Office Location
                    </label>
                    <input
                      type="text"
                      name="officeLocation"
                      value={formData.officeLocation}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      placeholder="Building and room number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Office Hours
                    </label>
                    {formData.officeHours.map((hour, index) => (
                      <div key={index} className="mb-3 p-3 border rounded-lg">
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Day
                            </label>
                            <select
                              value={hour.day}
                              onChange={(e) =>
                                handleOfficeHoursChange(
                                  index,
                                  "day",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                            >
                              <option value="">Select Day</option>
                              {daysOfWeek.map((day) => (
                                <option key={day} value={day}>
                                  {day}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Start Time
                            </label>
                            <input
                              type="time"
                              value={hour.startTime}
                              onChange={(e) =>
                                handleOfficeHoursChange(
                                  index,
                                  "startTime",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              End Time
                            </label>
                            <input
                              type="time"
                              value={hour.endTime}
                              onChange={(e) =>
                                handleOfficeHoursChange(
                                  index,
                                  "endTime",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeOfficeHours(index)}
                          className="text-red-500 text-xs flex items-center"
                        >
                          <FaTimes className="mr-1" /> Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addOfficeHours}
                      className="text-blue-500 text-sm flex items-center mt-1"
                    >
                      + Add Office Hours
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Courses Teaching
                    </label>
                    <select
                      name="coursesTeaching"
                      value={formData.coursesTeaching}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          coursesTeaching: Array.from(
                            e.target.selectedOptions,
                            (option) => option.value
                          ),
                        }))
                      }
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      multiple
                      size="3"
                    >
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.code} - {course.title}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Hold Ctrl/Cmd to select multiple
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media Section */}
              <div className="bg-green-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <FaGlobe className="text-green-600 text-lg" />
                  <h3 className="text-xl font-semibold text-gray-800">
                    Profile & Social Media
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Profile Photo URL
                    </label>
                    <input
                      type="url"
                      name="profilePhoto"
                      value={formData.profilePhoto}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      placeholder="https://example.com/profile.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="3"
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      maxLength="500"
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.bio.length}/500 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            isActive: e.target.checked,
                          }))
                        }
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="isActive"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Active
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Social Media Links
                    </label>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          LinkedIn
                        </label>
                        <input
                          type="url"
                          name="socialMedia.linkedIn"
                          value={formData.socialMedia.linkedIn}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Twitter
                        </label>
                        <input
                          type="url"
                          name="socialMedia.twitter"
                          value={formData.socialMedia.twitter}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://twitter.com/username"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          ResearchGate
                        </label>
                        <input
                          type="url"
                          name="socialMedia.researchGate"
                          value={formData.socialMedia.researchGate}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://researchgate.net/profile/username"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Google Scholar
                        </label>
                        <input
                          type="url"
                          name="socialMedia.googleScholar"
                          value={formData.socialMedia.googleScholar}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://scholar.google.com/citations?user=ID"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-8 border-t border-gray-200 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="mr-4 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {teacher ? "Update Teacher" : "Create Teacher"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
