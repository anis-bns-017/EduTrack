import React, { useState, useEffect } from "react";
import axios from "../../api/axios"
import { toast } from "react-hot-toast";

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    student: "",
    classId: "",
    subject: "",
    score: "",
    grade: "",
  });
  const [editId, setEditId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch all grades, students, classes
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [gradesRes, studentsRes, classesRes] = await Promise.all([
        axios.get("/grades"),
        axios.get("/students"),
        axios.get("/classes"),
      ]);
      setGrades(Array.isArray(gradesRes.data) ? gradesRes.data : []);
      setStudents(Array.isArray(studentsRes.data.students) ? studentsRes.data.students : []);
      setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
    } catch (error) {
      toast.error("Failed to load data");
    }
  };

  console.log("Student from Grade: ", students);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open modal and reset form for new grade
  const openAddModal = () => {
    setFormData({
      student: "",
      classId: "",
      subject: "",
      score: "",
      grade: "",
    });
    setEditId(null);
    setModalOpen(true);
  };

  // Handle form submit for add/update
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        // Update existing grade
        await axios.put(`/api/grades/${editId}`, formData);
        toast.success("Grade updated");
      } else {
        // Add new grade
        await axios.post("/api/grades", formData);
        toast.success("Grade added");
      }
      setModalOpen(false);
      fetchData(); // refresh list
    } catch (error) {
      toast.error("Failed to save grade");
    }
  };

  // Handle edit button click
  const handleEdit = (grade) => {
    setFormData({
      student: grade.student._id,
      classId: grade.class._id,
      subject: grade.subject || "",
      score: grade.score || "",
      grade: grade.grade,
    });
    setEditId(grade._id);
    setModalOpen(true);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this grade?")) {
      try {
        await axios.delete(`/api/grades/${id}`);
        toast.success("Grade deleted");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete grade");
      }
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">📈 Grades</h2>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded shadow"
        >
          + Add Grade
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm table-auto">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-3 px-4 text-left">#</th>
              <th className="py-3 px-4 text-left">Student</th>
              <th className="py-3 px-4 text-left">Class</th>
              <th className="py-3 px-4 text-left">Subject</th>
              <th className="py-3 px-4 text-left">Score</th>
              <th className="py-3 px-4 text-left">Grade</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g, i) => (
              <tr key={g._id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4">{i + 1}</td>
                <td className="py-3 px-4">{g.student?.name || "N/A"}</td>
                <td className="py-3 px-4">{g.class?.className || "N/A"}</td>
                <td className="py-3 px-4">{g.subject || "N/A"}</td>
                <td className="py-3 px-4">{g.score}</td>
                <td className="py-3 px-4">{g.grade}</td>
                <td className="py-3 px-4 space-x-2">
                  <button
                    onClick={() => handleEdit(g)}
                    className="bg-yellow-400 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(g._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {grades.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  No grades found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold mb-4">
              {editId ? "Edit Grade" : "Add New Grade"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Student
                </label>
                <select
                  name="student"
                  value={formData.student}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Class</label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.className}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Subject
                </label>
                <input
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Score</label>
                <input
                  type="number"
                  name="score"
                  value={formData.score}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter score"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Grade</label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select grade</option>
                  {["A+", "A", "B+", "B", "C", "D", "F"].map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded"
              >
                {editId ? "Update Grade" : "Save Grade"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Grades;
