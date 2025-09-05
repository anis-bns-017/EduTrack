import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import facultyList from "../helper/Faculties";
import { X, User, GraduationCap, MapPin, Phone, DollarSign, Badge, Accessibility, Trash2, Plus, Loader, Users, AlertTriangle, Check } from 'lucide-react';
import toast from "react-hot-toast";
import { FaThermometer } from "react-icons/fa";

export default function StudentFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState({
    departments: true,
    faculties: true
  });
  const [error, setError] = useState(null);

  const programTypes = ["Undergraduate", "Graduate", "PhD", "Diploma", "Certificate"];
  const academicStandings = ["Good", "Probation", "Warning", "Suspended"];
  const statusOptions = ["Active", "Inactive", "Graduated", "Transferred", "Suspended", "On Leave"];
  const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];
  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const idTypes = ["Passport", "National ID", "Driver License", "Other"];
  const [activeTab, setActiveTab] = useState("basic");

  const [formData, setFormData] = useState({
    name: "",
    father_name: "",
    mother_name: "",
    email: "",
    phone: "",
    program: "",
    programType: "",
    rollNumber: "",
    studentId: "",
    dateOfBirth: "",
    gender: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: ""
    },
    emergencyContacts: [{
      name: "",
      relationship: "",
      phone: "",
      email: ""
    }],
    enrollmentDate: new Date().toISOString().substr(0, 10),
    status: "Active",
    academicStanding: "Good",
    profilePicture: "",
    department: "",
    facultyAdvisor: "",
    yearOfStudy: 1,
    semester: 1,
    currentCourses: [],
    completedCourses: [],
    gpa: 0,
    totalCreditsEarned: 0,
    financialInformation: {
      tuitionBalance: 0,
      financialAid: false,
      scholarships: [""]
    },
    nationality: "",
    identification: {
      type: "",
      number: ""
    },
    disabilities: [{
      type: "",
      description: "",
      accommodations: ""
    }]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch departments
        const deptResponse = await axios.get("/departments");
        const departmentsData = Array.isArray(deptResponse.data.data) 
          ? deptResponse.data.data 
          : [];
        setDepartments(departmentsData);

        setLoading({ departments: false, faculties: false });
      } catch (err) {
        setError("Failed to load data");
        setLoading({ departments: false, faculties: false });
        console.error("Error fetching data:", err);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      const processedData = {
        ...initialData,
        dateOfBirth: initialData.dateOfBirth
          ? new Date(initialData.dateOfBirth).toISOString().substr(0, 10)
          : "",
        enrollmentDate: initialData.enrollmentDate
          ? new Date(initialData.enrollmentDate).toISOString().substr(0, 10)
          : new Date().toISOString().substr(0, 10),
        address: initialData.address || {
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: ""
        },
        emergencyContacts: initialData.emergencyContacts || [{
          name: "",
          relationship: "",
          phone: "",
          email: ""
        }],
        financialInformation: initialData.financialInformation || {
          tuitionBalance: 0,
          financialAid: false,
          scholarships: [""]
        },
        identification: initialData.identification || {
          type: "",
          number: ""
        },
        disabilities: initialData.disabilities || [{
          type: "",
      description: "",
      accommodations: ""
    }]
  };
  setFormData(processedData);
} else {
  // Reset form when adding a new student
  setFormData({
    name: "",
    father_name: "",
    mother_name: "",
    email: "",
    phone: "",
    program: "",
    programType: "",
    rollNumber: "",
    studentId: "",
    dateOfBirth: "",
    gender: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: ""
    },
    emergencyContacts: [{
      name: "",
      relationship: "",
      phone: "",
      email: ""
    }],
    enrollmentDate: new Date().toISOString().substr(0, 10),
    status: "Active",
    academicStanding: "Good",
    profilePicture: "",
    department: "",
    facultyAdvisor: "",
    yearOfStudy: 1,
    semester: 1,
    currentCourses: [],
    completedCourses: [],
    gpa: 0,
    totalCreditsEarned: 0,
    financialInformation: {
      tuitionBalance: 0,
      financialAid: false,
      scholarships: [""]
    },
    nationality: "",
    identification: {
      type: "",
      number: ""
    },
    disabilities: [{
      type: "",
      description: "",
      accommodations: ""
    }]
  });
}
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested objects (e.g., address.street)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setFormData(prev => {
      const newArray = [...prev[arrayName]];
      newArray[index] = {
        ...newArray[index],
        [field]: value
      };
      return {
        ...prev,
        [arrayName]: newArray
      };
    });
  };

  const addArrayItem = (arrayName, template) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], template]
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      // Basic validation
      if (!formData.name || !formData.email || !formData.department || !formData.program) {
        toast.error("Please fill all required fields (marked with *)");
        return;
      }

      // Convert string numbers to actual numbers
      const processedData = {
        ...formData,
        yearOfStudy: Number(formData.yearOfStudy),
        semester: Number(formData.semester),
        gpa: Number(formData.gpa),
        totalCreditsEarned: Number(formData.totalCreditsEarned),
        financialInformation: {
          ...formData.financialInformation,
          tuitionBalance: Number(formData.financialInformation.tuitionBalance)
        }
      };
      
      toast.success("Form submitted successfully!");
      onSave(processedData);
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error("Failed to submit form. Please check your input and try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {initialData ? "Edit Student" : "Add New Student"}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-200"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b bg-gray-50 overflow-x-auto">
          {[
            { id: 'basic', label: 'Basic Info', icon: <User className="h-4 w-4 mr-1" /> },
            { id: 'academic', label: 'Academic', icon: <GraduationCap className="h-4 w-4 mr-1" /> },
            { id: 'address', label: 'Address', icon: <MapPin className="h-4 w-4 mr-1" /> },
            { id: 'emergency', label: 'Emergency', icon: <Phone className="h-4 w-4 mr-1" /> },
            { id: 'financial', label: 'Financial', icon: <DollarSign className="h-4 w-4 mr-1" /> },
            { id: 'identification', label: 'ID', icon: <Badge className="h-4 w-4 mr-1" /> },
            { id: 'disabilities', label: 'Disabilities', icon: <Accessibility className="h-4 w-4 mr-1" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`px-4 py-3 font-medium text-sm transition-colors duration-200 whitespace-nowrap flex items-center ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <form id="student-form" onSubmit={handleSubmit} className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {/* Basic Information Section */}
            {activeTab === 'basic' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-500" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Full Name*</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Anisur Rahaman"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  {/* Father's Name */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Father's Name*</label>
                    <input
                      type="text"
                      name="father_name"
                      value={formData.father_name}
                      onChange={handleChange}
                      placeholder="e.g., Moktar"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  {/* Mother's Name */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Mother's Name*</label>
                    <input
                      type="text"
                      name="mother_name"
                      value={formData.mother_name}
                      onChange={handleChange}
                      placeholder="e.g., Jane Kulsuma Khatun"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
 
                  {/* Email */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Email*</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g., john.smith@university.edu"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  {/* Phone */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g., +1 (555) 123-4567"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  {/* Student ID */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Student ID*</label>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      placeholder="e.g., STU20240001"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  {/* Roll Number */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Roll Number</label>
                    <input
                      type="text"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleChange}
                      placeholder="e.g., 24CS101"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  {/* Date of Birth */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  {/* Gender */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select Gender</option>
                      {genderOptions.map(gender => (
                        <option key={gender} value={gender}>{gender}</option>
                      ))}
                    </select>
                  </div>
                  {/* Blood Group */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  {/* Profile Picture */}
                  <div className="md:col-span-2">
                    <label className="block mb-1 font-medium text-gray-700">Profile Picture URL</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="url"
                        name="profilePicture"
                        value={formData.profilePicture}
                        onChange={handleChange}
                        placeholder="e.g., https://example.com/profile.jpg"
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      {formData.profilePicture && (
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300">
                          <img 
                            src={formData.profilePicture} 
                            alt="Profile preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/150";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Academic Information Section */}
            {activeTab === 'academic' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-blue-500" />
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Department */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Department*</label>
                    {loading.departments ? (
                      <div className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 animate-pulse flex items-center">
                        <Loader className="animate-spin h-4 w-4 mr-2 text-gray-500" />
                        Loading departments...
                      </div>
                    ) : error ? (
                      <div className="text-red-500 bg-red-50 p-2 rounded-lg">{error}</div>
                    ) : (
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept._id} value={dept._id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  {/* Program */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Program*</label>
                    <input
                      type="text"
                      name="program"
                      value={formData.program}
                      onChange={handleChange}
                      placeholder="e.g., Computer Science, Business Administration"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  {/* Program Type */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Program Type*</label>
                    <select
                      name="programType"
                      value={formData.programType}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    >
                      <option value="">Select Program Type</option>
                      {programTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  {/* Faculty Advisor */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Faculty Advisor</label>
                    {loading.faculties ? (
                      <div className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 animate-pulse flex items-center">
                        <Loader className="animate-spin h-4 w-4 mr-2 text-gray-500" />
                        Loading faculty...
                      </div>
                    ) : error ? (
                      <div className="text-red-500 bg-red-50 p-2 rounded-lg">{error}</div>
                    ) : (
                      <select
                        name="facultyAdvisor"
                        value={formData.facultyAdvisor}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">Select Faculty Advisor</option>
                        {facultyList.map(faculty => (
                          <option key={faculty._id} value={faculty._id}>
                            {faculty.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  {/* Year of Study */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Year of Study</label>
                    <select
                      name="yearOfStudy"
                      value={formData.yearOfStudy}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select Year</option>
                      {[1, 2, 3, 4, 5, 6].map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  {/* Semester */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Semester</label>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select Semester</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(sem => (
                        <option key={sem} value={sem}>{sem}</option>
                      ))}
                    </select>
                  </div>
                  {/* Enrollment Date */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Enrollment Date</label>
                    <input
                      type="date"
                      name="enrollmentDate"
                      value={formData.enrollmentDate}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  {/* Status */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  {/* Academic Standing */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Academic Standing</label>
                    <select
                      name="academicStanding"
                      value={formData.academicStanding}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      {academicStandings.map(standing => (
                        <option key={standing} value={standing}>{standing}</option>
                      ))}
                    </select>
                  </div>
                  {/* GPA */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">GPA</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="gpa"
                        min="0"
                        max="4"
                        step="0.01"
                        value={formData.gpa}
                        onChange={handleChange}
                        placeholder="e.g., 3.75"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                        /4.0
                      </div>
                    </div>
                  </div>
                  {/* Total Credits Earned */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Total Credits Earned</label>
                    <input
                      type="number"
                      name="totalCreditsEarned"
                      min="0"
                      value={formData.totalCreditsEarned}
                      onChange={handleChange}
                      placeholder="e.g., 90"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Address Information Section */}
            {activeTab === 'address' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                  Address Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Street */}
                  <div className="md:col-span-2">
                    <label className="block mb-1 font-medium text-gray-700">Street</label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      placeholder="e.g., 123 Main Street, Apt 4B"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  {/* City */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      placeholder="e.g., New York"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  {/* State */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">State/Province</label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      placeholder="e.g., New York"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  {/* Postal Code */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Postal Code</label>
                    <input
                      type="text"
                      name="address.postalCode"
                      value={formData.address.postalCode}
                      onChange={handleChange}
                      placeholder="e.g., 10001"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  {/* Country */}
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Country</label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleChange}
                      placeholder="e.g., United States"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Emergency Contacts Section */}
            {activeTab === 'emergency' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-blue-500" />
                  Emergency Contacts
                </h3>
                
                {formData.emergencyContacts.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg mb-4">
                    <Users className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-600">No emergency contacts added yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.emergencyContacts.map((contact, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-800">Contact #{index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeArrayItem('emergencyContacts', index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            aria-label="Remove contact"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
                            <input
                              type="text"
                              value={contact.name}
                              onChange={(e) => handleArrayChange('emergencyContacts', index, 'name', e.target.value)}
                              placeholder="e.g., Sarah Smith"
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Relationship</label>
                            <input
                              type="text"
                              value={contact.relationship}
                              onChange={(e) => handleArrayChange('emergencyContacts', index, 'relationship', e.target.value)}
                              placeholder="e.g., Mother, Father, Guardian"
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Phone</label>
                            <input
                              type="tel"
                              value={contact.phone}
                              onChange={(e) => handleArrayChange('emergencyContacts', index, 'phone', e.target.value)}
                              placeholder="e.g., +1 (555) 987-6543"
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                            <input
                              type="email"
                              value={contact.email}
                              onChange={(e) => handleArrayChange('emergencyContacts', index, 'email', e.target.value)}
                              placeholder="e.g., sarah.smith@email.com"
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => addArrayItem('emergencyContacts', {
                    name: "",
                    relationship: "",
                    phone: "",
                    email: ""
                  })}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="h-5 w-5 mr-1" />
                  Add Emergency Contact
                </button>
              </div>
            )}

            {/* Financial Information Section */}
            {activeTab === 'financial' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
                  Financial Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Tuition Balance</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="financialInformation.tuitionBalance"
                        value={formData.financialInformation.tuitionBalance}
                        onChange={handleChange}
                        placeholder="e.g., 2500.00"
                        className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                    <input
                      type="checkbox"
                      name="financialInformation.financialAid"
                      checked={formData.financialInformation.financialAid}
                      onChange={handleChange}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label className="font-medium text-gray-700">Receiving Financial Aid</label>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block font-medium text-gray-700">Scholarships</label>
                    <span className="text-sm text-gray-500">{formData.financialInformation.scholarships.length} added</span>
                  </div>
                  
                  {formData.financialInformation.scholarships.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg mb-4">
                      <DollarSign className="h-10 w-10 mx-auto text-gray-400" />
                      <p className="mt-2 text-gray-600">No scholarships added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.financialInformation.scholarships.map((scholarship, index) => (
                        <div key={index} className="flex items-center">
                          <input
                            type="text"
                            value={scholarship}
                            onChange={(e) => {
                              const newScholarships = [...formData.financialInformation.scholarships];
                              newScholarships[index] = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                financialInformation: {
                                  ...prev.financialInformation,
                                  scholarships: newScholarships
                                }
                              }));
                            }}
                            placeholder="e.g., Academic Excellence Scholarship"
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newScholarships = formData.financialInformation.scholarships.filter((_, i) => i !== index);
                              setFormData(prev => ({
                                ...prev,
                                financialInformation: {
                                  ...prev.financialInformation,
                                  scholarships: newScholarships
                                }
                              }));
                            }}
                            className="ml-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                            aria-label="Remove scholarship"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        financialInformation: {
                          ...prev.financialInformation,
                          scholarships: [...prev.financialInformation.scholarships, ""]
                        }
                      }));
                    }}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus className="h-5 w-5 mr-1" />
                    Add Scholarship
                  </button>
                </div>
              </div>
            )}

            {/* Identification Section */}
            {activeTab === 'identification' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Badge className="h-5 w-5 mr-2 text-blue-500" />
                  Identification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">ID Type</label>
                    <select
                      name="identification.type"
                      value={formData.identification.type}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select ID Type</option>
                      {idTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">ID Number</label>
                    <input
                      type="text"
                      name="identification.number"
                      value={formData.identification.number}
                      onChange={handleChange}
                      placeholder="e.g., A12345678"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Nationality</label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      placeholder="e.g., American, Canadian, British"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Disabilities Section */}
            {activeTab === 'disabilities' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Accessibility className="h-5 w-5 mr-2 text-blue-500" />
                  Disabilities & Accommodations
                </h3>
                
                {formData.disabilities.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg mb-4">
                    <AlertTriangle className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-600">No disability information added yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.disabilities.map((disability, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-800">Entry #{index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeArrayItem('disabilities', index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            aria-label="Remove disability information"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Type</label>
                            <input
                              type="text"
                              value={disability.type}
                              onChange={(e) => handleArrayChange('disabilities', index, 'type', e.target.value)}
                              placeholder="e.g., Visual impairment, ADHD"
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Description</label>
                            <input
                              type="text"
                              value={disability.description}
                              onChange={(e) => handleArrayChange('disabilities', index, 'description', e.target.value)}
                              placeholder="e.g., Requires large print materials"
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Accommodations</label>
                            <input
                              type="text"
                              value={disability.accommodations}
                              onChange={(e) => handleArrayChange('disabilities', index, 'accommodations', e.target.value)}
                              placeholder="e.g., Extended test time, Note taker"
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                )}
                
                <button
                  type="button"
                  onClick={() => addArrayItem('disabilities', {
                    type: "",
                    description: "",
                    accommodations: ""
                  })}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="h-5 w-5 mr-1" />
                  Add Disability Information
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Footer with Form Actions */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Required fields marked with *
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              form="student-form"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center"
            >
              <Check className="h-5 w-5 mr-1" />
              {initialData ? "Update Student" : "Add Student"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}