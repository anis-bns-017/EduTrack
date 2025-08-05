import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import ClassFormModal from "../components/ClassFormModal";
import { toast } from "react-hot-toast";

export default function Class() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editClass, setEditClass] = useState(null);

  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/classes");
        setClasses(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const openAddModal = () => {
    setEditClass(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cls) => {
    setEditClass(cls);
    setIsModalOpen(true);
  };

  // Save class (add or update)
  const handleSaveClass = async (classData) => {
    try {
      if (editClass) {
        // Update
        const res = await axios.put(`/classes/${editClass._id}`, classData);
        setClasses((prev) =>
          prev.map((c) => (c._id === editClass._id ? res.data : c))
        );
        toast.success("Class updated successfully");
      } else {
        // Add new
        const res = await axios.post("/classes", classData);
        setClasses((prev) => [...prev, res.data]);
        toast.success("Class added successfully");
      }
      setIsModalOpen(false);
      setEditClass(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save class");
    }
  };

  // Delete class
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;
    try {
      await axios.delete(`/classes/${id}`);
      setClasses((prev) => prev.filter((c) => c._id !== id));
      toast.success("Class deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete class");
    }
  };

  if (loading)
    return (
      <p className="text-center text-gray-600 mt-10 text-lg font-medium">
        Loading classes...
      </p>
    );
  if (error)
    return (
      <p className="text-center text-red-600 mt-10 text-lg font-semibold">
        Error: {error}
      </p>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">All Classes</h2>
        <button
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white font-semibold px-5 py-2 rounded-md shadow transition"
          onClick={openAddModal}
          aria-label="Add Class"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Class
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                "#",
                "Name",
                "Subject",
                "Teacher",
                "Room",
                "Schedule",
                "Actions",
              ].map((head) => (
                <th
                  key={head}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {classes.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-6 text-gray-500 italic select-none"
                >
                  No classes found.
                </td>
              </tr>
            ) : (
              classes.map((cls, index) => (
                <tr
                  key={cls._id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700 font-medium">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-800">
                    {cls.className}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-800">
                    {cls.subject}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-800">
                    {cls.teacher?.name || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-800">
                    {cls.room || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-800">
                    {cls.schedule?.day || "-"} {cls.schedule?.time || ""}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap space-x-4">
                    <button
                      onClick={() => openEditModal(cls)}
                      className="text-blue-600 hover:text-blue-800 font-semibold focus:outline-none"
                      aria-label={`Edit class ${cls.className}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cls._id)}
                      className="text-red-600 hover:text-red-800 font-semibold focus:outline-none"
                      aria-label={`Delete class ${cls.className}`}
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

      {/* Modal Form */}
      <ClassFormModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        onSave={handleSaveClass}
        initialData={editClass}
      />
    </div>
  );
}
