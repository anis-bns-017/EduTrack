import React, { useEffect, useState } from "react";
import axios from "../../api/axios"
import { toast } from "react-hot-toast";

export default function GradeTable() {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ student: "", classId: "", grade: "" });
  const [editId, setEditId] = useState(null);

  const fetchGrades = async () => {
    try {
      const res = await axios.get("/api/grades");
      setGrades(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Failed to fetch grades");
    }
  };

  const fetchStudentsAndClasses = async () => {
    try {
      const [studentRes, classRes] = await Promise.all([
        axios.get("/api/students"),
        axios.get("/api/classes"),
      ]);
      console.log("students: ", studentRes);
      
      setStudents(Array.isArray(studentRes.data) ? studentRes.data : []);
      setClasses(Array.isArray(classRes.data) ? classRes.data : []);
    } catch (err) {
      toast.error("Failed to fetch data");
    }
  };

  useEffect(() => {
    fetchGrades();
    fetchStudentsAndClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`/api/grades/${editId}`, form);
        toast.success("Grade updated");
      } else {
        await axios.post("/api/grades", form);
        toast.success("Grade added");
      }
      setForm({ student: "", classId: "", grade: "" });
      setEditId(null);
      fetchGrades();
    } catch {
      toast.error("Failed to submit grade");
    }
  };

  const handleEdit = (grade) => {
    setForm({
      student: grade.student._id,
      classId: grade.class._id,
      grade: grade.grade,
    });
    setEditId(grade._id);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this grade?")) {
      try {
        await axios.delete(`/api/grades/${id}`);
        toast.success("Grade deleted");
        fetchGrades();
      } catch {
        toast.error("Failed to delete grade");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-2">
        📊 Manage Grades
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 bg-white p-6 rounded-lg shadow-md"
      >
        <select
          className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.student}
          onChange={(e) => setForm({ ...form, student: e.target.value })}
          required
        >
          <option value="" disabled>
            Select Student
          </option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.classId}
          onChange={(e) => setForm({ ...form, classId: e.target.value })}
          required
        >
          <option value="" disabled>
            Select Class
          </option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.className}
            </option>
          ))}
        </select>

        <input
          type="text"
          className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Grade (e.g., A+)"
          value={form.grade}
          onChange={(e) => setForm({ ...form, grade: e.target.value })}
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition duration-200"
        >
          {editId ? "Update Grade" : "Add Grade"}
        </button>
      </form>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Student", "Class", "Grade", "Actions"].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {grades.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-4 text-center text-gray-400 italic"
                >
                  No grades available.
                </td>
              </tr>
            ) : (
              grades.map((g) => (
                <tr
                  key={g._id}
                  className="hover:bg-blue-50 transition duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                    {g.student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {g.class.className}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {g.grade}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-3">
                    <button
                      onClick={() => handleEdit(g)}
                      className="px-3 py-1 rounded-md bg-yellow-400 hover:bg-yellow-500 text-white font-semibold transition duration-150"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(g._id)}
                      className="px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white font-semibold transition duration-150"
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
    </div>
  );
}
