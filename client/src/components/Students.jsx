import React, { useState, useEffect } from "react";
import StudentFormModal from "../components/StudentFormModal";
import axios from "../../api/axios";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/students");
        setStudents(Array.isArray(res.data.students) ? res.data.students : []);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

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
        setStudents(Array.isArray(res.data) ? res.data : []);
      }
      setIsModalOpen(false);
      setEditStudent(null);
    } catch (err) {
      alert(err.response?.data?.message || "Error saving student");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-blue-800 tracking-tight">
          <span className="inline-block align-middle mr-2">
            <svg
              className="w-8 h-8 text-blue-500 inline"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m13-6.13A4 4 0 0012 4a4 4 0 00-4 4v1a4 4 0 004 4 4 4 0 004-4V8z"
              />
            </svg>
          </span>
          Students
        </h1>
        <button
          className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-2 rounded-lg shadow hover:from-blue-700 hover:to-blue-500 transition font-semibold flex items-center"
          onClick={handleAddClick}
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Student
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white rounded-lg">
          <thead>
            <tr className="bg-blue-100 text-blue-900 uppercase text-xs tracking-wider">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Class</th>
              <th className="py-3 px-4">Roll No.</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Gender</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  <span className="text-2xl">😕</span>
                  <div>No students found.</div>
                </td>
              </tr>
            ) : (
              students.map((student, idx) => (
                <tr
                  key={student._id}
                  className={`border-t ${
                    idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-blue-50 transition`}
                >
                  <td className="py-3 px-4 font-medium">{student.name}</td>
                  <td className="py-3 px-4">{student.email}</td>
                  <td className="py-3 px-4">{student.class}</td>
                  <td className="py-3 px-4">{student.rollNumber || "-"}</td>
                  <td className="py-3 px-4">{student.phone || "-"}</td>
                  <td className="py-3 px-4">{student.gender || "-"}</td>
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
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6m2 2H7v-4a2 2 0 012-2h4"
                        />
                      </svg>
                      Edit
                    </button>
                    <button
                      className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm font-medium"
                      onClick={() => handleDelete(student._id)}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
