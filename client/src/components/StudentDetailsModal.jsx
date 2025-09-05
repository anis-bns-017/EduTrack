import React from "react";
import { format } from "date-fns";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Building2,
  Award,
  Star,
  TrendingUp,
  CreditCard,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  BookOpen,
  Target,
  Activity,
  Zap,
  Shield,
  Globe,
  IdCard,
  Heart,
  PhoneCall,
  MessageCircle,
  UserCheck,
} from "lucide-react";

const StudentDetailsModal = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "Graduated":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Transferred":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Suspended":
        return "bg-red-100 text-red-800 border-red-200";
      case "On Leave":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="w-4 h-4" />;
      case "Inactive":
        return <Clock className="w-4 h-4" />;
      case "Graduated":
        return <GraduationCap className="w-4 h-4" />;
      case "Transferred":
        return <Activity className="w-4 h-4" />;
      case "Suspended":
        return <AlertTriangle className="w-4 h-4" />;
      case "On Leave":
        return <Calendar className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getAcademicStandingColor = (standing) => {
    switch (standing) {
      case "Good":
        return "bg-emerald-100 text-emerald-800";
      case "Probation":
        return "bg-yellow-100 text-yellow-800";
      case "Warning":
        return "bg-orange-100 text-orange-800";
      case "Suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getGradeColor = (grade) => {
    if (!grade) return "text-gray-500";
    const upperGrade = grade.toUpperCase();
    if (upperGrade.startsWith("A")) return "text-emerald-600 font-bold";
    if (upperGrade.startsWith("B")) return "text-blue-600 font-semibold";
    if (upperGrade.startsWith("C")) return "text-yellow-600 font-semibold";
    return "text-red-600 font-semibold";
  };

  const getProgramTypeColor = (type) => {
    switch (type) {
      case "Undergraduate":
        return "bg-blue-100 text-blue-800";
      case "Graduate":
        return "bg-purple-100 text-purple-800";
      case "PhD":
        return "bg-emerald-100 text-emerald-800";
      case "Diploma":
        return "bg-orange-100 text-orange-800";
      case "Certificate":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Modal Header */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-6 py-6">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex justify-between items-center text-white">
              <div className="flex items-center space-x-4">
                {student.profilePicture ? (
                  <img
                    src={student.profilePicture}
                    alt="Profile"
                    className="h-16 w-16 rounded-full object-cover border-3 border-white/30 shadow-xl"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold border-3 border-white/30">
                    {student.name?.charAt(0)?.toUpperCase() || "S"}
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold">{student.name || "Student Details"}</h3>
                  <div className="flex items-center mt-1 text-sm text-blue-100">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                      {student.studentId}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{student.program}</span>
                    <span className="mx-2">•</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getProgramTypeColor(student.programType)}`}>
                      {student.programType}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          {/* Modal Content - Scrollable */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="px-6 py-6">
              {/* Quick Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                        Email
                      </p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {student.email || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Phone className="w-5 h-5 text-green-500 flex-shrink-0" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-green-600 uppercase tracking-wider">
                        Phone
                      </p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {student.phone || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <UserCheck className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-purple-600 uppercase tracking-wider">
                        Status
                      </p>
                      <span className={`inline-flex items-center mt-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}>
                        {getStatusIcon(student.status)}
                        <span className="ml-1">{student.status || "N/A"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Target className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-orange-600 uppercase tracking-wider">
                        GPA
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {student.gpa ? student.gpa.toFixed(2) : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Full Name
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {student.name || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Father's Name
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {student.father_name || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Mother's Name
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {student.mother_name || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Student ID
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {student.studentId || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Roll Number
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {student.rollNumber || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Date of Birth
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {student.dateOfBirth
                        ? format(new Date(student.dateOfBirth), "PPP")
                        : "N/A"}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Age
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {student.dateOfBirth
                        ? `${Math.floor((Date.now() - new Date(student.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} years`
                        : "N/A"}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Gender
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {student.gender || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Nationality
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {student.nationality || "N/A"}
                    </p>
                  </div>

                  {student.identification && (
                    <>
                      <div className="bg-white p-4 rounded-lg border border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                          ID Type
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {student.identification.type || "N/A"}
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                          ID Number
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {student.identification.number || "N/A"}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Address Section */}
                {student.address && Object.values(student.address).some(val => val) && (
                  <div className="mt-6">
                    <h5 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                      Address Information
                    </h5>
                    <div className="bg-white p-4 rounded-lg border border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {student.address.street && `${student.address.street}, `}
                        {student.address.city && `${student.address.city}, `}
                        {student.address.state && `${student.address.state} `}
                        {student.address.postalCode && `${student.address.postalCode}, `}
                        {student.address.country}
                      </p>
                    </div>
                  </div>
                )}

                {/* Emergency Contacts */}
                {student.emergencyContacts && student.emergencyContacts.length > 0 && (
                  <div className="mt-6">
                    <h5 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                      <PhoneCall className="w-4 h-4 mr-2 text-gray-500" />
                      Emergency Contacts
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {student.emergencyContacts.map((contact, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg border border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="font-semibold text-gray-900">{contact.name}</h6>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {contact.relationship}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="w-3 h-3 mr-2" />
                              {contact.phone}
                            </div>
                            {contact.email && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="w-3 h-3 mr-2" />
                                {contact.email}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Academic Information Section */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <GraduationCap className="w-4 h-4 text-green-600" />
                  </div>
                  Academic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Program
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {student.program || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Program Type
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getProgramTypeColor(student.programType)}`}>
                      {student.programType || "N/A"}
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Department
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {student.department?.name ||
                        student.department ||
                        "N/A"}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Faculty Advisor
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {student.facultyAdvisor || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Year/Semester
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      Year {student.yearOfStudy || "N/A"} •
                      Sem {student.semester || "N/A"}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      GPA
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {student.gpa ? student.gpa.toFixed(2) : "N/A"}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Academic Standing
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getAcademicStandingColor(student.academicStanding)}`}>
                      {student.academicStanding || "N/A"}
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Total Credits
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {student.totalCreditsEarned || 0} credits
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Enrollment Date
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {student.enrollmentDate
                        ? format(new Date(student.enrollmentDate), "PPP")
                        : "N/A"}
                    </p>
                  </div>

                  {student.expectedGraduationDate && (
                    <div className="bg-white p-4 rounded-lg border border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                        Expected Graduation
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {format(new Date(student.expectedGraduationDate), "PPP")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Current Courses */}
                {student.currentCourses && student.currentCourses.length > 0 && (
                  <div className="mt-6">
                    <h5 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2 text-gray-500" />
                      Current Courses
                    </h5>
                    <div className="bg-white rounded-lg border border-gray-100">
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {student.currentCourses.map((course, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm font-semibold text-gray-900">
                                {course.name || `Course ${index + 1}`}
                              </p>
                              <p className="text-xs text-gray-500">
                                {course.code || `Course Code`}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Completed Courses */}
                {student.completedCourses && student.completedCourses.length > 0 && (
                  <div className="mt-6">
                    <h5 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                      <Award className="w-4 h-4 mr-2 text-gray-500" />
                      Completed Courses
                    </h5>
                    <div className="bg-white rounded-lg border border-gray-100">
                      <div className="p-4">
                        <div className="space-y-3">
                          {student.completedCourses.map((course, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {course.course?.name || `Course ${index + 1}`}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {course.semester} • Year {course.year}
                                </p>
                              </div>
                              <span className={`text-sm font-bold ${getGradeColor(course.grade)}`}>
                                {course.grade || "N/A"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Financial Information Section */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                  </div>
                  Financial Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Tuition Balance
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {student.financialInformation?.tuitionBalance
                        ? `$${student.financialInformation.tuitionBalance.toFixed(2)}`
                        : "$0.00"}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Financial Aid
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                      student.financialInformation?.financialAid
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {student.financialInformation?.financialAid ? "Yes" : "No"}
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Scholarships
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {student.financialInformation?.scholarships?.length
                        ? student.financialInformation.scholarships.join(", ")
                        : "None"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Disabilities Section */}
              {student.disabilities && student.disabilities.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                      <Heart className="w-4 h-4 text-yellow-600" />
                    </div>
                    Disabilities & Accommodations
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {student.disabilities.map((disability, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <h6 className="font-semibold text-gray-900">{disability.type}</h6>
                          <Shield className="w-4 h-4 text-yellow-500" />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{disability.description}</p>
                        <div className="bg-yellow-50 p-2 rounded-lg">
                          <p className="text-xs font-medium text-yellow-800 mb-1">Accommodations:</p>
                          <p className="text-xs text-yellow-700">{disability.accommodations}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata Section */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg mr-3">
                    <Activity className="w-4 h-4 text-gray-600" />
                  </div>
                  System Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Created At
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {student.createdAt
                        ? format(new Date(student.createdAt), "PPP")
                        : "N/A"}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Last Updated
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {student.updatedAt
                        ? format(new Date(student.updatedAt), "PPP")
                        : "N/A"}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Last Login
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {student.lastLogin
                        ? format(new Date(student.lastLogin), "PPP")
                        : "Never"}
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                      Account Status
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}>
                      {getStatusIcon(student.status)}
                      <span className="ml-1">{student.status}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;