import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import { toast } from "react-hot-toast";

export default function GradeTable() {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({
    student: "",
    class: "",
    term: "",
    gradeValue: "",
    remarks: "",
  });
  const [editId, setEditId] = useState(null);

  const fetchGrades = async () => {
    try {
      const res = await axios.get("/grades");
      setGrades(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to fetch grades");
    }
  };

  const fetchStudentsAndClasses = async () => {
    try {
      const [studentRes, classRes] = await Promise.all([
        axios.get("/students"),
        axios.get("/classes"),
      ]);
      setStudents(Array.isArray(studentRes.data) ? studentRes.data : []);
      setClasses(Array.isArray(classRes.data) ? classRes.data : []);
    } catch {
      toast.error("Failed to fetch students/classes");
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
        await axios.put(`/grades/${editId}`, form);
        toast.success("Grade updated");
      } else {
        await axios.post("/grades", form);
        toast.success("Grade added");
      }
      setForm({ student: "", class: "", term: "", gradeValue: "", remarks: "" });
      setEditId(null);
      fetchGrades();
    } catch {
      toast.error("Failed to submit grade");
    }
  };

  const handleEdit = (grade) => {
    setForm({
      student: grade.student?._id || "",
      class: grade.class?._id || "",
      term: grade.term || "",
      gradeValue: grade.gradeValue || "",
      remarks: grade.remarks || "",
    });
    setEditId(grade._id);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this grade?")) {
      try {
        await axios.delete(`/grades/${id}`);
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

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-10 bg-white p-6 rounded-xl shadow-lg"
      >
        {/* Student */}
        <select
          value={form.student}
          onChange={(e) => setForm({ ...form, student: e.target.value })}
          required
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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

        {/* Class */}
        <select
          value={form.class}
          onChange={(e) => setForm({ ...form, class: e.target.value })}
          required
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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

        {/* Term */}
        <input
          type="text"
          placeholder="Term (e.g., Fall 2025)"
          value={form.term}
          onChange={(e) => setForm({ ...form, term: e.target.value })}
          required
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />

        {/* Grade */}
        <input
          type="text"
          placeholder="Grade (e.g., A+)"
          value={form.gradeValue}
          onChange={(e) => setForm({ ...form, gradeValue: e.target.value })}
          required
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />

        {/* Remarks */}
        <input
          type="text"
          placeholder="Remarks"
          value={form.remarks}
          onChange={(e) => setForm({ ...form, remarks: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />

        {/* Submit button full width on small and bigger screens */}
        <button
          type="submit"
          className="col-span-1 sm:col-span-2 md:col-span-5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold px-6 py-3 shadow-md transition"
        >
          {editId ? "Update Grade" : "Add Grade"}
        </button>
      </form>

      {/* TABLE WITH VERTICAL + HORIZONTAL SCROLL */}
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="min-w-[700px] divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {["Student", "Class", "Term", "Grade", "Remarks", "Actions"].map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide select-none"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {grades.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-400 italic">
                  No grades available.
                </td>
              </tr>
            ) : (
              grades.map((g) => (
                <tr
                  key={g._id}
                  className="hover:bg-blue-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">{g.student?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{g.class?.className}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{g.term}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{g.gradeValue}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{g.remarks}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-3">
                    <button
                      onClick={() => handleEdit(g)}
                      className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded-md shadow-sm transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(g._id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md shadow-sm transition"
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
