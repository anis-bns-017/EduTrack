import { useState, useEffect } from "react";
import axios from "../../api/axios";
import toast from "react-hot-toast";
import React from 'react';
import {
  FaTimes,
  FaUser,
  FaGraduationCap,
  FaBriefcase,
  FaGlobe,
  FaPlus,
  FaMinus,
  FaAward,
  FaCertificate,
  FaBook,
  FaClock,
  FaBuilding,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaHeart,
  FaLinkedin,
  FaTwitter,
  FaGoogle,
  FaGithub,
  FaGlobeAmericas,
  FaIdCard,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

export default function TeacherFormModal({
  isOpen,
  onClose,
  onSuccess,
  teacher,
  faculties, 
  departments
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    title: "",
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    nationality: "",
    email: "",
    phone: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
    },
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    password: "",
    department: "",
    faculty: "",
    designation: "",
    employmentType: "Full-time",
    joiningDate: "",
    contractEndDate: "",
    status: "Active",
    qualifications: [{
      degree: "",
      field: "",
      institution: "",
      year: new Date().getFullYear(),
      country: "",
      grade: "",
      thesisTitle: "",
      supervisor: "",
      isHighest: false
    }],
    certifications: [],
    professionalDevelopment: [],
    teachingCredentials: [],
    specialization: [""],
    researchInterests: [""],
    areasOfExpertise: [""],
    publications: [],
    coursesTeaching: [],
    officeLocation: "",
    officeHours: [],
    officeExtension: "",
    teachingLoad: 12,
    experience: {
      teaching: 0,
      industry: 0,
      research: 0
    },
    previousInstitutions: [],
    isActive: true,
    role: "teacher",
    profilePhoto: "default.jpg",
    bio: "",
    socialMedia: {
      linkedIn: "",
      twitter: "",
      researchGate: "",
      googleScholar: "",
      website: "",
      github: "",
      orcid: ""
    },
    awards: [],
    salaryGrade: "",
    bankAccount: {
      bankName: "",
      accountNumber: "",
      branchCode: "",
    }
  });

  const [filteredDepartments, setFilteredDepartments] = useState(departments);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    contact: false,
    professional: false,
    experience: false,
    qualifications: false,
    expertise: false,
    officeHours: false,
    social: false,
    additional: false
  });
  const [courses, setCourses] = useState([]);

  // Predefined options
  const titles = ["Dr.", "Prof.", "Mr.", "Mrs.", "Ms.", "Mx."];
  const designations = [
    "Professor",
    "Associate Professor",
    "Assistant Professor",
    "Senior Lecturer",
    "Lecturer",
    "Visiting Faculty",
    "Adjunct Professor",
    "Research Fellow",
    "Teaching Assistant",
  ];
  const employmentTypes = ["Full-time", "Part-time", "Contract", "Visiting", "Adjunct"];
  const statusOptions = ["Active", "On Leave", "Sabbatical", "Retired", "Resigned", "Terminated"];
  const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
  const degreeOptions = ["High School", "Associate", "Bachelor", "Master", "Doctorate", "Postdoctoral", "Diploma", "Certificate", "Other"];
  const credentialTypes = ["State License", "National Board", "Subject Specific", "International", "Other"];
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    if (teacher) {
      // Transform the teacher data to match our form structure
      setFormData({
        employeeId: teacher.employeeId || "",
        title: teacher.title || "",
        firstName: teacher.firstName || "",
        middleName: teacher.middleName || "",
        lastName: teacher.lastName || "",
        dateOfBirth: teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toISOString().split("T")[0] : "",
        gender: teacher.gender || "",
        bloodGroup: teacher.bloodGroup || "",
        nationality: teacher.nationality || "",
        email: teacher.email || "",
        phone: teacher.phone || "",
        emergencyContact: teacher.emergencyContact || {
          name: "",
          relationship: "",
          phone: "",
        },
        address: teacher.address || {
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
        password: "",
        department: teacher.department?._id || teacher.department || "",
        faculty: teacher.faculty?._id || teacher.faculty || "",
        designation: teacher.designation || "",
        employmentType: teacher.employmentType || "Full-time",
        joiningDate: teacher.joiningDate ? new Date(teacher.joiningDate).toISOString().split("T")[0] : "",
        contractEndDate: teacher.contractEndDate ? new Date(teacher.contractEndDate).toISOString().split("T")[0] : "",
        status: teacher.status || "Active",
        qualifications: teacher.qualifications || [{
          degree: "",
          field: "",
          institution: "",
          year: new Date().getFullYear(),
          country: "",
          grade: "",
          thesisTitle: "",
          supervisor: "",
          isHighest: false
        }],
        certifications: teacher.certifications || [],
        professionalDevelopment: teacher.professionalDevelopment || [],
        teachingCredentials: teacher.teachingCredentials || [],
        specialization: teacher.specialization || [""],
        researchInterests: teacher.researchInterests || [""],
        areasOfExpertise: teacher.areasOfExpertise || [""],
        publications: teacher.publications || [],
        coursesTeaching: teacher.coursesTeaching || [],
        officeLocation: teacher.officeLocation || "",
        officeHours: teacher.officeHours || [],
        officeExtension: teacher.officeExtension || "",
        teachingLoad: teacher.teachingLoad || 12,
        experience: teacher.experience || {
          teaching: 0,
          industry: 0,
          research: 0
        },
        previousInstitutions: teacher.previousInstitutions || [],
        isActive: teacher.isActive !== undefined ? teacher.isActive : true,
        role: teacher.role || "teacher",
        profilePhoto: teacher.profilePhoto || "default.jpg",
        bio: teacher.bio || "",
        socialMedia: teacher.socialMedia || {
          linkedIn: "",
          twitter: "",
          researchGate: "",
          googleScholar: "",
          website: "",
          github: "",
          orcid: ""
        },
        awards: teacher.awards || [],
        salaryGrade: teacher.salaryGrade || "",
        bankAccount: teacher.bankAccount || {
          bankName: "",
          accountNumber: "",
          branchCode: "",
        }
      });
    } else {
      // Reset to default empty form
      setFormData({
        employeeId: "",
        title: "",
        firstName: "",
        middleName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        bloodGroup: "",
        nationality: "",
        email: "",
        phone: "",
        emergencyContact: {
          name: "",
          relationship: "",
          phone: "",
        },
        address: {
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
        password: "",
        department: "",
        faculty: "",
        designation: "",
        employmentType: "Full-time",
        joiningDate: "",
        contractEndDate: "",
        status: "Active",
        qualifications: [{
          degree: "",
          field: "",
          institution: "",
          year: new Date().getFullYear(),
          country: "",
          grade: "",
          thesisTitle: "",
          supervisor: "",
          isHighest: false
        }],
        certifications: [],
        professionalDevelopment: [],
        teachingCredentials: [],
        specialization: [""],
        researchInterests: [""],
        areasOfExpertise: [""],
        publications: [],
        coursesTeaching: [],
        officeLocation: "",
        officeHours: [],
        officeExtension: "",
        teachingLoad: 12,
        experience: {
          teaching: 0,
          industry: 0,
          research: 0
        },
        previousInstitutions: [],
        isActive: true,
        role: "teacher",
        profilePhoto: "default.jpg",
        bio: "",
        socialMedia: {
          linkedIn: "",
          twitter: "",
          researchGate: "",
          googleScholar: "",
          website: "",
          github: "",
          orcid: ""
        },
        awards: [],
        salaryGrade: "",
        bankAccount: {
          bankName: "",
          accountNumber: "",
          branchCode: "",
        }
      });
    }
  }, [teacher]);

  // Filter departments based on selected faculty
  useEffect(() => {
    if (formData.faculty) {
      const filtered = departments.filter(dept => dept.faculty === formData.faculty);
      setFilteredDepartments(filtered);
      
      // If the current department is not in the filtered list, clear it
      if (formData.department && !filtered.some(dept => dept._id === formData.department)) {
        setFormData(prev => ({ ...prev, department: "" }));
      }
    } else {
      setFilteredDepartments(departments);
    }
  }, [formData.faculty, departments]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "faculty") {
      setFormData(prev => ({ 
        ...prev, 
        faculty: value,
        department: "" // Clear department when faculty changes
      }));
      return;
    }
    
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
    } else if (name.startsWith("bankAccount.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        bankAccount: {
          ...prev.bankAccount,
          [field]: value,
        },
      }));
    } else if (name.startsWith("experience.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        experience: {
          ...prev.experience,
          [field]: parseInt(value) || 0,
        },
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayFieldChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value.split(",").map((item) => item.trim()).filter(item => item !== ""),
    }));
  };

  const handleQualificationChange = (index, field, value) => {
    const updatedQualifications = [...formData.qualifications];
    updatedQualifications[index] = {
      ...updatedQualifications[index],
      [field]: value,
    };
    setFormData((prev) => ({ ...prev, qualifications: updatedQualifications }));
  };

  const addQualification = () => {
    setFormData((prev) => ({
      ...prev,
      qualifications: [
        ...prev.qualifications,
        {
          degree: "",
          field: "",
          institution: "",
          year: new Date().getFullYear(),
          country: "",
          grade: "",
          thesisTitle: "",
          supervisor: "",
          isHighest: false
        }
      ],
    }));
  };

  const removeQualification = (index) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index),
    }));
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
        { day: "", startTime: "", endTime: "", byAppointment: false },
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
        { title: "", journal: "", year: "", doi: "", type: "Journal", authors: [] },
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
    setLoading(true);
    try {
      const payload = {
        ...formData,
        joiningDate: formData.joiningDate ? new Date(formData.joiningDate) : null,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
        contractEndDate: formData.contractEndDate ? new Date(formData.contractEndDate) : null,
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
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FaUser className="text-xl" />
              <h2 className="text-2xl font-bold">
                {teacher ? "Edit Teacher" : "Add New Teacher"}
              </h2>
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
        
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-120px)]">
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
              <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <span className="text-gray-700 font-medium">Saving teacher data...</span>
              </div>
            </div>
          )}

          <div className="p-6 space-y-4">
            {/* Basic Information Section */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('basic')}
              >
                <div className="flex items-center space-x-2">
                  <FaIdCard className="text-blue-600 text-lg" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Basic Information
                  </h3>
                </div>
                {expandedSections.basic ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              
              {expandedSections.basic && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                      pattern="[A-Z0-9]{6,10}"
                      title="6-10 alphanumeric characters (uppercase)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <select
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">Select Title</option>
                      {titles.map((title) => (
                        <option key={title} value={title}>
                          {title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder={teacher ? "Leave blank to keep current" : ""}
                      minLength="8"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    >
                      <option value="">Select Gender</option>
                      {genderOptions.map((gender) => (
                        <option key={gender} value={gender}>
                          {gender}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Group
                    </label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nationality
                    </label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Contact Information Section */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('contact')}
              >
                <div className="flex items-center space-x-2">
                  <FaMapMarkerAlt className="text-blue-600 text-lg" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Contact Information
                  </h3>
                </div>
                {expandedSections.contact ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              
              {expandedSections.contact && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <h4 className="text-md font-medium text-gray-700 mb-2">Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Street</label>
                        <input
                          type="text"
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">City</label>
                        <input
                          type="text"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">State</label>
                        <input
                          type="text"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Postal Code</label>
                        <input
                          type="text"
                          name="address.postalCode"
                          value={formData.address.postalCode}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-600 mb-1">Country</label>
                        <input
                          type="text"
                          name="address.country"
                          value={formData.address.country}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <h4 className="text-md font-medium text-gray-700 mb-2">Emergency Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Name</label>
                        <input
                          type="text"
                          name="emergencyContact.name"
                          value={formData.emergencyContact.name}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Relationship</label>
                        <input
                          type="text"
                          name="emergencyContact.relationship"
                          value={formData.emergencyContact.relationship}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Phone</label>
                        <input
                          type="tel"
                          name="emergencyContact.phone"
                          value={formData.emergencyContact.phone}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Professional Information Section */}
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('professional')}
              >
                <div className="flex items-center space-x-2">
                  <FaBriefcase className="text-green-600 text-lg" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Professional Information
                  </h3>
                </div>
                {expandedSections.professional ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              
              {expandedSections.professional && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Faculty *
                    </label>
                    <select
                      name="faculty"
                      value={formData.faculty}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department *
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                      disabled={!formData.faculty}
                    >
                      <option value="">Select Department</option>
                      {filteredDepartments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    {!formData.faculty && (
                      <p className="text-xs text-gray-500 mt-1">
                        Please select a faculty first
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Designation *
                    </label>
                    <select
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    >
                      <option value="">Select Designation</option>
                      {designations.map((title) => (
                        <option key={title} value={title}>
                          {title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employment Type *
                    </label>
                    <select
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    >
                      {employmentTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Joining Date *
                    </label>
                    <input
                      type="date"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contract End Date
                    </label>
                    <input
                      type="date"
                      name="contractEndDate"
                      value={formData.contractEndDate}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teaching Load (hours)
                    </label>
                    <input
                      type="number"
                      name="teachingLoad"
                      value={formData.teachingLoad}
                      onChange={handleChange}
                      min="0"
                      max="24"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Office Location
                    </label>
                    <input
                      type="text"
                      name="officeLocation"
                      value={formData.officeLocation}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Office Extension
                    </label>
                    <input
                      type="text"
                      name="officeExtension"
                      value={formData.officeExtension}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Experience Section */}
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('experience')}
              >
                <div className="flex items-center space-x-2">
                  <FaAward className="text-yellow-600 text-lg" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Experience
                  </h3>
                </div>
                {expandedSections.experience ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              
              {expandedSections.experience && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teaching Experience (years)
                    </label>
                    <input
                      type="number"
                      name="experience.teaching"
                      value={formData.experience.teaching}
                      onChange={handleChange}
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Industry Experience (years)
                    </label>
                    <input
                      type="number"
                      name="experience.industry"
                      value={formData.experience.industry}
                      onChange={handleChange}
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Research Experience (years)
                    </label>
                    <input
                      type="number"
                      name="experience.research"
                      value={formData.experience.research}
                      onChange={handleChange}
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Qualifications Section */}
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('qualifications')}
              >
                <div className="flex items-center space-x-2">
                  <FaGraduationCap className="text-purple-600 text-lg" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Qualifications
                  </h3>
                </div>
                {expandedSections.qualifications ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              
              {expandedSections.qualifications && (
                <>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={addQualification}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center text-sm"
                    >
                      <FaPlus className="mr-1" /> Add Qualification
                    </button>
                  </div>
                  
                  {formData.qualifications.map((qual, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-purple-200 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Degree *</label>
                          <select
                            value={qual.degree}
                            onChange={(e) => handleQualificationChange(index, "degree", e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            required
                          >
                            <option value="">Select Degree</option>
                            {degreeOptions.map((degree) => (
                              <option key={degree} value={degree}>{degree}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Field of Study *</label>
                          <input
                            type="text"
                            value={qual.field}
                            onChange={(e) => handleQualificationChange(index, "field", e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Institution *</label>
                          <input
                            type="text"
                            value={qual.institution}
                            onChange={(e) => handleQualificationChange(index, "institution", e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Year *</label>
                          <input
                            type="number"
                            value={qual.year}
                            onChange={(e) => handleQualificationChange(index, "year", e.target.value)}
                            min="1900"
                            max={new Date().getFullYear()}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Country</label>
                          <input
                            type="text"
                            value={qual.country}
                            onChange={(e) => handleQualificationChange(index, "country", e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Grade</label>
                          <input
                            type="text"
                            value={qual.grade}
                            onChange={(e) => handleQualificationChange(index, "grade", e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs text-gray-600 mb-1">Thesis Title</label>
                          <input
                            type="text"
                            value={qual.thesisTitle}
                            onChange={(e) => handleQualificationChange(index, "thesisTitle", e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Supervisor</label>
                          <input
                            type="text"
                            value={qual.supervisor}
                            onChange={(e) => handleQualificationChange(index, "supervisor", e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={qual.isHighest}
                            onChange={(e) => handleQualificationChange(index, "isHighest", e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 block text-xs text-gray-700">Highest Qualification</label>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQualification(index)}
                        className="text-red-500 text-xs flex items-center mt-3"
                      >
                        <FaTimes className="mr-1" /> Remove Qualification
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Specialization & Expertise Section */}
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('expertise')}
              >
                <div className="flex items-center space-x-2">
                  <FaBook className="text-orange-600 text-lg" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Specialization & Expertise
                  </h3>
                </div>
                {expandedSections.expertise ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              
              {expandedSections.expertise && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialization *
                    </label>
                    <input
                      type="text"
                      value={formData.specialization.join(", ")}
                      onChange={(e) => handleArrayFieldChange("specialization", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Comma separated list of specializations"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Research Interests
                    </label>
                    <input
                      type="text"
                      value={formData.researchInterests.join(", ")}
                      onChange={(e) => handleArrayFieldChange("researchInterests", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Comma separated research interests"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Areas of Expertise
                    </label>
                    <input
                      type="text"
                      value={formData.areasOfExpertise.join(", ")}
                      onChange={(e) => handleArrayFieldChange("areasOfExpertise", e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Comma separated areas of expertise"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Office Hours Section */}
            <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('officeHours')}
              >
                <div className="flex items-center space-x-2">
                  <FaClock className="text-teal-600 text-lg" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Office Hours
                  </h3>
                </div>
                {expandedSections.officeHours ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              
              {expandedSections.officeHours && (
                <>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={addOfficeHours}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center text-sm"
                    >
                      <FaPlus className="mr-1" /> Add Office Hours
                    </button>
                  </div>
                  
                  {formData.officeHours.map((hour, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-teal-200 mt-3">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Day</label>
                          <select
                            value={hour.day}
                            onChange={(e) => handleOfficeHoursChange(index, "day", e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                          >
                            <option value="">Select Day</option>
                            {daysOfWeek.map((day) => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                          <input
                            type="time"
                            value={hour.startTime}
                            onChange={(e) => handleOfficeHoursChange(index, "startTime", e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">End Time</label>
                          <input
                            type="time"
                            value={hour.endTime}
                            onChange={(e) => handleOfficeHoursChange(index, "endTime", e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={hour.byAppointment || false}
                            onChange={(e) => handleOfficeHoursChange(index, "byAppointment", e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 block text-xs text-gray-700">By Appointment</label>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeOfficeHours(index)}
                        className="text-red-500 text-xs flex items-center mt-2"
                      >
                        <FaTimes className="mr-1" /> Remove
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Social Media Section */}
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('social')}
              >
                <div className="flex items-center space-x-2">
                  <FaGlobe className="text-indigo-600 text-lg" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Social Media & Online Presence
                  </h3>
                </div>
                {expandedSections.social ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              
              {expandedSections.social && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaLinkedin className="text-blue-600 mr-2 text-sm" /> LinkedIn
                    </label>
                    <input
                      type="url"
                      name="socialMedia.linkedIn"
                      value={formData.socialMedia.linkedIn}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaTwitter className="text-blue-400 mr-2 text-sm" /> Twitter
                    </label>
                    <input
                      type="url"
                      name="socialMedia.twitter"
                      value={formData.socialMedia.twitter}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaBook className="text-green-600 mr-2 text-sm" /> ResearchGate
                    </label>
                    <input
                      type="url"
                      name="socialMedia.researchGate"
                      value={formData.socialMedia.researchGate}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="https://researchgate.net/profile/username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaGoogle className="text-red-500 mr-2 text-sm" /> Google Scholar
                    </label>
                    <input
                      type="url"
                      name="socialMedia.googleScholar"
                      value={formData.socialMedia.googleScholar}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="https://scholar.google.com/citations?user=ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaGithub className="text-gray-800 mr-2 text-sm" /> GitHub
                    </label>
                    <input
                      type="url"
                      name="socialMedia.github"
                      value={formData.socialMedia.github}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="https://github.com/username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaGlobeAmericas className="text-purple-600 mr-2 text-sm" /> Website
                    </label>
                    <input
                      type="url"
                      name="socialMedia.website"
                      value={formData.socialMedia.website}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ORCID ID</label>
                    <input
                      type="text"
                      name="socialMedia.orcid"
                      value={formData.socialMedia.orcid}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="0000-0000-0000-0000"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Additional Information Section */}
            <div className="bg-pink-50 rounded-xl p-4 border border-pink-200">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('additional')}
              >
                <div className="flex items-center space-x-2">
                  <FaCertificate className="text-pink-600 text-lg" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Additional Information
                  </h3>
                </div>
                {expandedSections.additional ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              
              {expandedSections.additional && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profile Photo URL
                    </label>
                    <input
                      type="url"
                      name="profilePhoto"
                      value={formData.profilePhoto}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Salary Grade
                    </label>
                    <input
                      type="text"
                      name="salaryGrade"
                      value={formData.salaryGrade}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      maxLength="500"
                      placeholder="Brief biography (max 500 characters)"
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.bio.length}/500 characters
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end p-6 border-t border-gray-200 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="mr-4 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              {teacher ? "Update Teacher" : "Create Teacher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}