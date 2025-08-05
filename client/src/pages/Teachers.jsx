import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import TeacherTable from "../components/TeacherTable";
import TeacherFormModal from "../components/TeacherFormModal";
import { toast } from "react-hot-toast";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("/teachers");
      setTeachers(res.data);
    } catch (err) {
      setError("Failed to fetch teachers.");
      toast.error("Failed to fetch teachers");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this teacher?")) return;

    try {
      await axios.delete(`/teachers/${id}`);
      toast.success("Teacher deleted successfully");
      fetchTeachers();
    } catch (err) {
      toast.error("Failed to delete teacher");
    }
  };

  const handleFormClose = () => {
    setEditingTeacher(null);
    setIsModalOpen(false);
  };

  const handleFormSuccess = () => {
    fetchTeachers();
    handleFormClose();
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">Teachers</h2>
          <p className="mt-1 text-gray-600 text-sm sm:text-base">
            Manage your teaching staff here.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 text-white font-semibold px-6 py-3 rounded-lg shadow transition"
          aria-label="Add Teacher"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Teacher
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-md p-6 min-h-[300px]">
        {loading ? (
          <p className="text-center text-gray-500 text-lg">Loading teachers...</p>
        ) : error ? (
          <p className="text-center text-red-600 text-lg">{error}</p>
        ) : teachers.length === 0 ? (
          <p className="text-center text-gray-500 italic select-none">No teachers found.</p>
        ) : (
          <TeacherTable
            teachers={teachers}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Modal */}
      <TeacherFormModal
        isOpen={isModalOpen}
        onClose={handleFormClose}
        teacher={editingTeacher}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
