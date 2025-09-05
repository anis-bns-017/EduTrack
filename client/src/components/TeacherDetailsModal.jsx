import React from "react";
import { 
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  Calendar,
  Award,
  BookOpen,
  X,
  User,
  Globe,
  Link,
  Clock,
  GraduationCap,
  Sparkles,
  Star,
  CheckCircle,
  Home,
  Heart,
  BookOpenText,
  FileText,
  Shield,
  DollarSign,
  Crown,
  Target,
  BarChart3,
  Clock4,
  Bookmark,
  Trophy,
  Globe2,
  Github,
  Twitter,
  Linkedin
} from "lucide-react";

export default function TeacherDetailsModal({ isOpen, onClose, teacher }) {
  if (!isOpen || !teacher) return null;

  // Prevent event bubbling when clicking inside the modal
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  // Helper function to format address
  const formatAddress = (address) => {
    if (!address) return "Not specified";
    const { street, city, state, postalCode, country } = address;
    const parts = [street, city, state, postalCode, country].filter(Boolean);
    return parts.join(", ") || "Not specified";
  };

  // Helper function to get highest qualification
  const getHighestQualification = () => {
    if (!teacher.qualifications || teacher.qualifications.length === 0) {
      return "Not specified";
    }
    
    const highest = teacher.qualifications.find(q => q.isHighest) || 
                   teacher.qualifications.reduce((highest, current) => {
                     const degreeOrder = {
                       "Postdoctoral": 8,
                       "Doctorate": 7,
                       "Master": 6,
                       "Bachelor": 5,
                       "Associate": 4,
                       "Diploma": 3,
                       "Certificate": 2,
                       "High School": 1,
                       "Other": 0
                     };
                     
                     return (degreeOrder[current.degree] > degreeOrder[highest.degree]) ? current : highest;
                   }, teacher.qualifications[0]);
    
    return `${highest.degree} in ${highest.field}`;
  };

  // Helper function to format experience
  const formatExperience = (experience) => {
    if (!experience) return "0 years";
    if (typeof experience === "object") {
      const { teaching = 0, industry = 0, research = 0 } = experience;
      const total = teaching + industry + research;
      return `${total} years (Teaching: ${teaching}, Industry: ${industry}, Research: ${research})`;
    }
    return `${experience} years`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Enhanced backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"></div>
      
      {/* Modal container */}
      <div 
        className="relative z-10 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto border border-white/30 animate-in zoom-in-95 fade-in duration-300"
        onClick={handleModalClick}
      >
        {/* Enhanced Header with Gradient */}
        <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-8 rounded-t-3xl overflow-hidden">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                {teacher.profilePhoto && teacher.profilePhoto !== "default.jpg" ? (
                  <img
                    className="w-20 h-20 rounded-3xl object-cover border-4 border-white/30 shadow-xl"
                    src={teacher.profilePhoto}
                    alt={`${teacher.firstName} ${teacher.lastName}`}
                  />
                ) : (
                  <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center shadow-xl">
                    <User className="w-10 h-10 text-white" />
                  </div>
                )}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-black text-white mb-1">
                  {teacher.title ? `${teacher.title} ` : ""}{teacher.firstName} {teacher.lastName}
                </h3>
                <p className="text-blue-100 text-lg font-semibold">
                  {teacher.designation}
                </p>
                <p className="text-blue-200 font-medium">
                  {teacher.department?.name || "No department specified"}
                </p>
                <p className="text-blue-100 text-sm mt-1">
                  Employee ID: {teacher.employeeId}
                </p>
              </div>
              <div className="hidden lg:block">
                <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
              </div>
            </div>
            <button
              onClick={onClose}
              className="group p-3 text-white/80 hover:text-white hover:bg-white/20 rounded-2xl transition-all duration-300"
            >
              <X className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Enhanced Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* Personal Information */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <h4 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                Personal Information
                <Star className="w-4 h-4 text-blue-500" />
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Date of Birth</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toLocaleDateString() : "Not specified"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-green-200 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Gender</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">
                      {teacher.gender || "Not specified"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-purple-200 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                    <Globe2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Nationality</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {teacher.nationality || "Not specified"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-red-200 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Blood Group</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {teacher.bloodGroup || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <h4 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                Contact Information
                <Star className="w-4 h-4 text-purple-500" />
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Email</p>
                    <p className="text-sm font-semibold text-gray-900">{teacher.email}</p>
                  </div>
                </div>
                
                {teacher.phone && (
                  <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-green-200 shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Phone</p>
                      <p className="text-sm font-semibold text-gray-900">{teacher.phone}</p>
                    </div>
                  </div>
                )}
                
                {teacher.address && (
                  <div className="flex items-start gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-purple-200 shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                      <Home className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Address</p>
                      <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                        {formatAddress(teacher.address)}
                      </p>
                    </div>
                  </div>
                )}

                {teacher.emergencyContact && (
                  <div className="flex items-start gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-amber-200 shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Emergency Contact</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {teacher.emergencyContact.name} ({teacher.emergencyContact.relationship})
                      </p>
                      <p className="text-sm text-gray-700">{teacher.emergencyContact.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Details */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <h4 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                Professional Details
                <Star className="w-4 h-4 text-green-500" />
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-200 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Designation</p>
                    <p className="text-sm font-semibold text-gray-900">{teacher.designation}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-purple-200 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Department</p>
                    <p className="text-sm font-semibold text-gray-900">{teacher.department?.name || "No department"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Faculty</p>
                    <p className="text-sm font-semibold text-gray-900">{teacher.faculty?.name || "No faculty"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-amber-200 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Joining Date</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {teacher.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-yellow-200 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Experience</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatExperience(teacher.experience)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-green-200 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Employment Type</p>
                    <p className="text-sm font-semibold text-gray-900">{teacher.employmentType || "Not specified"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-red-200 shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Status</p>
                    <p className="text-sm font-semibold text-gray-900">{teacher.status || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Qualifications */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <h4 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                Qualifications
                <Star className="w-4 h-4 text-amber-500" />
              </h4>
              {teacher.qualifications?.length ? (
                <div className="space-y-4">
                  {teacher.qualifications.map((qual, index) => (
                    <div key={index} className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-amber-200 shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-black text-gray-900">{qual.degree}</p>
                        {qual.year && (
                          <span className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full font-bold shadow-lg">
                            {qual.year}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-amber-700 font-semibold mb-1">{qual.institution}</p>
                      <p className="text-sm text-gray-700 mb-1">{qual.field}</p>
                      {qual.country && (
                        <p className="text-xs text-gray-600">{qual.country}</p>
                      )}
                      {qual.isHighest && (
                        <span className="inline-block mt-2 text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full font-bold">
                          Highest Qualification
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/70 p-6 rounded-xl border border-gray-200 text-center">
                  <BookOpenText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium italic">No qualifications listed</p>
                </div>
              )}
            </div>
            
            {/* Specialization & Expertise */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-100 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <h4 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl shadow-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                Specialization & Expertise
                <Star className="w-4 h-4 text-rose-500" />
              </h4>
              
              {teacher.specialization?.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-bold text-gray-700 mb-2">Specialization:</p>
                  <div className="flex flex-wrap gap-2">
                    {teacher.specialization.map((spec, index) => (
                      <span key={index} className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-medium rounded-full border border-rose-200">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {teacher.researchInterests?.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-bold text-gray-700 mb-2">Research Interests:</p>
                  <div className="flex flex-wrap gap-2">
                    {teacher.researchInterests.map((interest, index) => (
                      <span key={index} className="px-3 py-1 bg-pink-100 text-pink-800 text-xs font-medium rounded-full border border-pink-200">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {teacher.areasOfExpertise?.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2">Areas of Expertise:</p>
                  <div className="flex flex-wrap gap-2">
                    {teacher.areasOfExpertise.map((expertise, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full border border-purple-200">
                        {expertise}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {(teacher.specialization?.length === 0 && 
                teacher.researchInterests?.length === 0 && 
                teacher.areasOfExpertise?.length === 0) && (
                <div className="bg-white/70 p-6 rounded-xl border border-gray-200 text-center">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium italic">No specialization information available</p>
                </div>
              )}
            </div>

            {/* Office Details */}
            <div className="bg-gradient-to-br from-cyan-50 to-teal-100 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <h4 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl shadow-lg">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                Office Details
                <Star className="w-4 h-4 text-cyan-500" />
              </h4>
              <div className="space-y-4">
                {teacher.officeLocation && (
                  <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-200 shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Office Location</p>
                      <p className="text-sm font-semibold text-gray-900">{teacher.officeLocation}</p>
                    </div>
                  </div>
                )}
                
                {teacher.officeExtension && (
                  <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-green-200 shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Phone Extension</p>
                      <p className="text-sm font-semibold text-gray-900">{teacher.officeExtension}</p>
                    </div>
                  </div>
                )}
                
                {teacher.officeHours && teacher.officeHours.length > 0 && (
                  <div className="flex items-start gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-amber-200 shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg">
                      <Clock4 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Office Hours</p>
                      <div className="space-y-2 mt-2">
                        {teacher.officeHours.map((hours, index) => (
                          <div key={index} className="text-sm text-gray-700">
                            <span className="font-medium">{hours.day}:</span> {hours.startTime} - {hours.endTime}
                            {hours.byAppointment && <span className="text-xs text-amber-600 ml-2">(By Appointment)</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Social Media & Online Presence */}
            {(teacher.socialMedia?.linkedIn || teacher.socialMedia?.googleScholar || 
              teacher.socialMedia?.researchGate || teacher.socialMedia?.website ||
              teacher.socialMedia?.twitter || teacher.socialMedia?.github) && (
              <div className="bg-gradient-to-br from-indigo-50 to-blue-100 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <h4 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl shadow-lg">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  Online Presence
                  <Star className="w-4 h-4 text-indigo-500" />
                </h4>
                <div className="space-y-4">
                  {teacher.socialMedia.linkedIn && (
                    <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
                        <Linkedin className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">LinkedIn</p>
                        <a 
                          href={teacher.socialMedia.linkedIn} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors break-all"
                        >
                          View Profile
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {teacher.socialMedia.googleScholar && (
                    <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-green-200 shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Google Scholar</p>
                        <a 
                          href={teacher.socialMedia.googleScholar} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm font-semibold text-green-600 hover:text-green-800 hover:underline transition-colors break-all"
                        >
                          View Profile
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {teacher.socialMedia.researchGate && (
                    <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-purple-200 shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">ResearchGate</p>
                        <a 
                          href={teacher.socialMedia.researchGate} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm font-semibold text-purple-600 hover:text-purple-800 hover:underline transition-colors break-all"
                        >
                          View Profile
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {teacher.socialMedia.website && (
                    <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-cyan-200 shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="p-3 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl shadow-lg">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Personal Website</p>
                        <a 
                          href={teacher.socialMedia.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm font-semibold text-cyan-600 hover:text-cyan-800 hover:underline transition-colors break-all"
                        >
                          Visit Website
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {teacher.socialMedia.twitter && (
                    <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="p-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl shadow-lg">
                        <Twitter className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Twitter</p>
                        <a 
                          href={teacher.socialMedia.twitter} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm font-semibold text-blue-500 hover:text-blue-700 hover:underline transition-colors break-all"
                        >
                          View Profile
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {teacher.socialMedia.github && (
                    <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
                      <div className="p-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl shadow-lg">
                        <Github className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">GitHub</p>
                        <a 
                          href={teacher.socialMedia.github} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm font-semibold text-gray-700 hover:text-gray-900 hover:underline transition-colors break-all"
                        >
                          View Profile
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Enhanced Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 backdrop-blur-sm px-8 py-6 rounded-b-3xl border-t border-white/30">
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="group inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-transparent shadow-xl px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-base font-bold text-white hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 transform hover:scale-105"
            >
              <Clock className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}