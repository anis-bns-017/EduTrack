import React, { useState, useEffect } from "react";
import StudentFormModal from "../components/StudentFormModal";
import axios from "../../api/axios";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);

  // 🔍 Filter States - added new filters
  const [searchName, setSearchName] = useState("");
  const [filterProgram, setFilterProgram] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterYearOfStudy, setFilterYearOfStudy] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/students");
        const list = Array.isArray(res.data.students) ? res.data.students : [];
        setStudents(list);
        setFilteredStudents(list);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // 🛠 Filter Logic with new fields included
  useEffect(() => {
    let result = [...students];

    if (searchName.trim()) {
      result = result.filter((s) =>
        s.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    if (filterProgram) {
      result = result.filter((s) => s.program === filterProgram);
    }
    if (filterDepartment) {
      result = result.filter((s) => s.department === filterDepartment);
    }
    if (filterGender) {
      result = result.filter((s) => s.gender === filterGender);
    }
    if (filterStatus) {
      result = result.filter((s) => s.status === filterStatus);
    }
    if (filterYearOfStudy) {
      result = result.filter(
        (s) => String(s.yearOfStudy) === String(filterYearOfStudy)
      );
    }

    setFilteredStudents(result);
  }, [
    searchName,
    filterProgram,
    filterDepartment,
    filterGender,
    filterStatus,
    filterYearOfStudy,
    students,
  ]);

  const handleAddClick = () => {
    setEditStudent(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (student) => {
    setEditStudent(student);
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (studentData) => {
    try {
      if (editStudent) {
        const res = await axios.put(
          `/students/${editStudent._id}`,
          studentData
        );
        setStudents((prev) =>
          prev.map((s) => (s._id === editStudent._id ? res.data : s))
        );
      } else {
        const res = await axios.post("/students", studentData);
        setStudents((prev) => [...prev, res.data]);
      }
      setIsModalOpen(false);
      setEditStudent(null);
    } catch (err) {
      alert(err.response?.data?.message || "Error saving student");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      await axios.delete(`/students/${id}`);
      setStudents((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting student");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-opacity-50"></div>
        <span className="ml-4 text-lg text-gray-600">Loading students...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-600 bg-red-50 px-6 py-3 rounded shadow">
          {error}
        </p>
      </div>
    );

  // Extract unique values for filters
  const uniquePrograms = [...new Set(students.map((s) => s.program).filter(Boolean))];
  const uniqueDepartments = [...new Set(students.map((s) => s.department).filter(Boolean))];
  const uniqueYears = [...new Set(students.map((s) => s.yearOfStudy).filter(Boolean))];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 🔍 Advanced Filter Bar */}
      <div className="bg-gray-50 p-4 rounded-lg shadow mb-6 grid grid-cols-1 sm:grid-cols-6 gap-4">
        <input
          type="text"
          placeholder="Search by Name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
        <select
          value={filterProgram}
          onChange={(e) => setFilterProgram(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">All Programs</option>
          {uniquePrograms.map((prog) => (
            <option key={prog} value={prog}>
              {prog}
            </option>
          ))}
        </select>
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">All Departments</option>
          {uniqueDepartments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        <select
          value={filterGender}
          onChange={(e) => setFilterGender(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Graduated">Graduated</option>
          <option value="Transferred">Transferred</option>
        </select>
        <select
          value={filterYearOfStudy}
          onChange={(e) => setFilterYearOfStudy(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">All Years</option>
          {uniqueYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-blue-800 tracking-tight">
          Students
        </h1>
        <button
          className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-2 rounded-lg shadow hover:from-blue-700 hover:to-blue-500 transition font-semibold flex items-center"
          onClick={handleAddClick}
        >
          + Add Student
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white rounded-lg">
          <thead>
            <tr className="bg-blue-100 text-blue-900 uppercase text-xs tracking-wider">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Program</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Roll No.</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Gender</th>
              <th className="py-3 px-4">Year</th>
              <th className="py-3 px-4">CGPA</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="11" className="text-center py-8 text-gray-500">
                  😕 No students match your filters.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student, idx) => (
                <tr
                  key={student._id}
                  className={`border-t ${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-blue-50 transition`}
                >
                  <td className="py-3 px-4 font-medium">{student.name}</td>
                  <td className="py-3 px-4">{student.email}</td>
                  <td className="py-3 px-4">{student.program || "-"}</td>
                  <td className="py-3 px-4">{student.department || "-"}</td>
                  <td className="py-3 px-4">{student.rollNumber || "-"}</td>
                  <td className="py-3 px-4">{student.phone || "-"}</td>
                  <td className="py-3 px-4">{student.gender || "-"}</td>
                  <td className="py-3 px-4">{student.yearOfStudy || "-"}</td>
                  <td className="py-3 px-4">{student.cgpa || "-"}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        student.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : student.status === "Inactive"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {student.status || "-"}
                    </span>
                  </td>
                  <td className="py-3 px-4 space-x-2">
                    <button
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm font-medium"
                      onClick={() => handleEditClick(student)}
                    >
                      Edit
                    </button>
                    <button
                      className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm font-medium"
                      onClick={() => handleDelete(student._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <StudentFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditStudent(null);
        }}
        onSave={handleSaveStudent}
        initialData={editStudent}
      />
    </div>
  );
}
