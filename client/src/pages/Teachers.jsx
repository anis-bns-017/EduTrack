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

  // Filter states
  const [searchName, setSearchName] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Fetch teachers from API
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

  // Edit teacher
  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setIsModalOpen(true);
  };

  // Delete teacher
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

  // Close modal
  const handleFormClose = () => {
    setEditingTeacher(null);
    setIsModalOpen(false);
  };

  // After successful add/edit
  const handleFormSuccess = () => {
    fetchTeachers();
    handleFormClose();
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Filter teachers with safe checks and case-insensitive where needed
  const filteredTeachers = teachers.filter((t) => {
    const nameMatch = t.name?.toLowerCase().includes(searchName.toLowerCase());
    const departmentMatch = filterDepartment ? t.department === filterDepartment : true;
    const statusMatch = filterStatus ? (t.status?.toLowerCase() === filterStatus.toLowerCase()) : true;

    return nameMatch && departmentMatch && statusMatch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">Teachers</h2>
          <p className="mt-1 text-gray-600 text-sm sm:text-base">Manage your teaching staff here.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 text-white font-semibold px-6 py-3 rounded-lg shadow transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Teacher
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search by name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-1/3"
        />
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-1/3"
        >
          <option value="">All Departments</option>
          <option value="Math">Math</option>
          <option value="Science">Science</option>
          <option value="English">English</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-1/3"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="On Leave">On Leave</option>
          <option value="Retired">Retired</option>
        </select>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-md p-6 min-h-[300px]">
        {loading ? (
          <p className="text-center text-gray-500 text-lg">Loading teachers...</p>
        ) : error ? (
          <p className="text-center text-red-600 text-lg">{error}</p>
        ) : filteredTeachers.length === 0 ? (
          <p className="text-center text-gray-500 text-lg italic">No teachers match the filters.</p>
        ) : (
          <TeacherTable
            teachers={filteredTeachers}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        )}
      </div>

      {/* Modal form for add/edit */}
      {isModalOpen && (
        <TeacherFormModal
          isOpen={isModalOpen}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          editingTeacher={editingTeacher}
        />
      )}
    </div>
  );
}
