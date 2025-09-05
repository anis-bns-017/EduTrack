import { Eye, Edit, Trash2, Building2, Calendar, Frown, Download, Users } from "lucide-react"
import React, { useState } from 'react';
import StudentDetailsModal from "./StudentDetailsModal";

export default function StudentsTable({
  filteredStudents,
  students,
  handleEditClick,
  handleDelete,
  handleAddClick,
}) {
  // State for Student Details Modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Function to handle viewing student details
  const handleViewStudentDetails = (student) => {
    setSelectedStudent(student);
    setIsDetailsModalOpen(true);
  };

  // Function to close the details modal
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedStudent(null);
  };

  if (filteredStudents.length === 0) {
    return (
      <>
        <div className="bg-card shadow-2xl rounded-2xl border border-border backdrop-blur-sm overflow-hidden">
          <div className="text-center py-16 px-8">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-muted rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Frown className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">No students found</h3>
              <p className="text-muted-foreground mb-8 text-lg">
                Get started by adding your first student to the system.
              </p>
              <button
                type="button"
                onClick={handleAddClick}
                className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg font-semibold"
              >
                <Users className="w-6 h-6 mr-2" />
                Add Your First Student
              </button>
            </div>
          </div>
        </div>
        
        {/* Student Details Modal */}
        <StudentDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          student={selectedStudent}
        />
      </>
    )
  }

  return (
    <>
      <div className="bg-card shadow-2xl rounded-2xl border border-border backdrop-blur-sm overflow-hidden">
        {/* Enhanced Results Summary */}
        <div className="p-6 bg-gradient-to-r from-muted/50 to-accent/10 border-b border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-bold text-primary">{filteredStudents.length}</span> of{" "}
                  <span className="font-bold text-foreground">{students.length}</span> students
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {filteredStudents.length === students.length ? "All students displayed" : "Filtered results"}
                </p>
              </div>
            </div>
            {filteredStudents.length > 0 && (
              <button
                onClick={() => {
                  console.log("Export functionality will be implemented")
                }}
                className="inline-flex items-center px-6 py-3 bg-accent text-accent-foreground rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-sm font-semibold"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </button>
            )}
          </div>
        </div>
        
        {/* Enhanced Students Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-muted to-accent/5 border-b border-border">
                <th className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Student</span>
                  </div>
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4" />
                    <span>Program</span>
                  </div>
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Year/Semester</span>
                  </div>
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  GPA
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-5 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStudents.map((student, index) => (
                <tr
                  key={student._id}
                  className={`group hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all duration-300 ${
                    index % 2 === 0 ? "bg-background" : "bg-muted/20"
                  }`}
                >
                  <td className="px-6 py-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {student.profilePicture ? (
                          <img
                            className="h-14 w-14 rounded-full border-2 border-primary/20 shadow-lg group-hover:border-primary/40 transition-all duration-300"
                            src={student.profilePicture || "/placeholder.svg"}
                            alt=""
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold shadow-lg text-lg group-hover:scale-110 transition-all duration-300">
                            {student.name?.charAt(0)?.toUpperCase() || "S"}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-base font-bold text-foreground group-hover:text-primary transition-colors duration-200">
                          {student.name}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center mt-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                            {student.studentId}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="text-sm font-semibold text-foreground">{student.program}</div>
                    <div className="text-sm text-muted-foreground mt-1">{student.programType}</div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="text-sm font-semibold text-foreground flex items-center">
                      <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                      {student.department?.name || student.department || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="text-sm font-semibold text-foreground flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      Year {student.yearOfStudy}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Semester {student.semester}</div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center space-x-2">
                      <div className="text-lg font-bold text-foreground">
                        {student.gpa ? student.gpa.toFixed(2) : "N/A"}
                      </div>
                      <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                          style={{
                            width: student.gpa ? `${(student.gpa / 4) * 100}%` : "0%",
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{student.academicStanding || "N/A"}</div>
                  </td>
                  <td className="px-6 py-6">
                    <span
                      className={`px-4 py-2 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm border transition-all duration-200
                      ${
                        student.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : ""
                      }
                      ${
                        student.status === "Inactive"
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                          : ""
                      }
                      ${
                        student.status === "Graduated" ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" : ""
                      }
                      ${
                        student.status === "Transferred"
                          ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                          : ""
                      }
                      ${student.status === "Suspended" ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" : ""}
                      ${student.status === "On Leave" ? "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100" : ""}
                    `}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => handleViewStudentDetails(student)}
                        className="p-3 text-primary hover:text-primary-foreground hover:bg-primary rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditClick(student)}
                        className="p-3 text-accent hover:text-accent-foreground hover:bg-accent rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Edit Student"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student._id)}
                        className="p-3 text-destructive hover:text-destructive-foreground hover:bg-destructive rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Student Details Modal */}
      <StudentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        student={selectedStudent}
      />
    </>
  )
}