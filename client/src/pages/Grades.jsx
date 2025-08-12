import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import { toast } from "react-hot-toast";

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);

  const [formData, setFormData] = useState({
    student: "",
    department: "",
    course: "",
    term: "",
    semester: "",
    academicYear: "",
    creditHours: "",
    assessments: [],
    finalGrade: "",
    gradePoint: "",
    resultStatus: "Incomplete",
    remarks: "",
  });

  const [editId, setEditId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch all required data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [gradesRes, studentsRes, departmentsRes, coursesRes] =
        await Promise.all([
          axios.get("/grades"),
          axios.get("/students"),
          axios.get("/departments"),
          axios.get("/courses"),
        ]);

      setGrades(Array.isArray(gradesRes.data) ? gradesRes.data : []);
      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
      setDepartments(
        Array.isArray(departmentsRes.data) ? departmentsRes.data : []
      );
      setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
    } catch (error) {
      console.error("Fetch error:", error.response?.data || error.message);
      toast.error("Failed to load data");
    }
  };

  // Handle input change for normal inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle changes in assessments list
  const handleAssessmentChange = (index, field, value) => {
    const updatedAssessments = [...formData.assessments];
    updatedAssessments[index] = {
      ...updatedAssessments[index],
      [field]: value,
    };
    setFormData((prev) => ({ ...prev, assessments: updatedAssessments }));
  };

  // Add a new empty assessment
  const addAssessment = () => {
    setFormData((prev) => ({
      ...prev,
      assessments: [
        ...prev.assessments,
        { title: "", score: "", maxScore: "", weight: "" },
      ],
    }));
  };

  // Remove an assessment by index
  const removeAssessment = (index) => {
    const updated = formData.assessments.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, assessments: updated }));
  };

  // Open modal for adding new grade
  const openAddModal = () => {
    setFormData({
      student: "",
      department: "",
      course: "",
      term: "",
      semester: "",
      academicYear: "",
      creditHours: "",
      assessments: [],
      finalGrade: "",
      gradePoint: "",
      resultStatus: "Incomplete",
      remarks: "",
    });
    setEditId(null);
    setModalOpen(true);
  };

  // Handle form submit (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation (you can enhance this)
    if (
      !formData.student ||
      !formData.department ||
      !formData.course ||
      !formData.term ||
      !formData.academicYear ||
      !formData.creditHours
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      if (editId) {
        await axios.put(`/grades/${editId}`, formData);
        toast.success("Grade updated successfully");
      } else {
        await axios.post("/grades", formData);
        toast.success("Grade added successfully");
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Save error:", error.response?.data || error.message);
      toast.error("Failed to save grade");
    }
  };

  // Edit existing grade
  const handleEdit = (grade) => {
    setFormData({
      student: grade.student?._id || "",
      department: grade.department?._id || "",
      course: grade.course?._id || "",
      term: grade.term || "",
      semester: grade.semester || "",
      academicYear: grade.academicYear || "",
      creditHours: grade.creditHours || "",
      assessments:
        grade.assessments?.map((a) => ({
          title: a.title || "",
          score: a.score || "",
          maxScore: a.maxScore || "",
          weight: a.weight || "",
        })) || [],
      finalGrade: grade.finalGrade || "",
      gradePoint: grade.gradePoint || "",
      resultStatus: grade.resultStatus || "Incomplete",
      remarks: grade.remarks || "",
    });
    setEditId(grade._id);
    setModalOpen(true);
  };

  // Delete grade
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this grade?")) {
      try {
        await axios.delete(`/grades/${id}`);
        toast.success("Grade deleted");
        fetchData();
      } catch (error) {
        console.error("Delete error:", error.response?.data || error.message);
        toast.error("Failed to delete grade");
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <span>📊</span> University Grades
        </h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold px-6 py-3 rounded-lg shadow-md focus:outline-none focus:ring-4 focus:ring-blue-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Grade
        </button>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="min-w-full text-sm divide-y divide-gray-200">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              {[
                "#",
                "Student",
                "Department",
                "Course",
                "Term",
                "Semester",
                "Academic Year",
                "Credit Hours",
                "Final Grade",
                "Grade Point",
                "Result Status",
                "Remarks",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="whitespace-nowrap py-3 px-4 text-left text-gray-700 font-semibold select-none"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {grades.length === 0 ? (
              <tr>
                <td
                  colSpan={13}
                  className="text-center py-8 text-gray-500 italic"
                >
                  No grades found.
                </td>
              </tr>
            ) : (
              grades.map((g, i) => (
                <tr
                  key={g._id}
                  className="hover:bg-blue-50 transition-colors even:bg-white odd:bg-gray-50"
                >
                  <td className="py-3 px-4 font-medium text-gray-700">
                    {i + 1}
                  </td>
                  <td className="py-3 px-4">{g.student?.name || "N/A"}</td>
                  <td className="py-3 px-4">{g.department?.name || "N/A"}</td>
                  <td className="py-3 px-4">{g.course?.courseName || "N/A"}</td>
                  <td className="py-3 px-4">{g.term || "N/A"}</td>
                  <td className="py-3 px-4">{g.semester || "N/A"}</td>
                  <td className="py-3 px-4">{g.academicYear || "N/A"}</td>
                  <td className="py-3 px-4">{g.creditHours || "N/A"}</td>
                  <td className="py-3 px-4 font-semibold">
                    {g.finalGrade || "N/A"}
                  </td>
                  <td className="py-3 px-4">{g.gradePoint ?? "N/A"}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        g.resultStatus === "Pass"
                          ? "bg-green-100 text-green-800"
                          : g.resultStatus === "Fail"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {g.resultStatus || "N/A"}
                    </span>
                  </td>
                  <td className="py-3 px-4">{g.remarks || "N/A"}</td>
                  <td className="py-3 px-4 space-x-2">
                    <button
                      onClick={() => handleEdit(g)}
                      className="inline-flex items-center gap-1 bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-md text-sm shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300"
                      aria-label="Edit grade"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536M9 11l6 6-9 3 3-9z"
                        />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(g._id)}
                      className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                      aria-label="Delete grade"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
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

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-4xl p-6 rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-5 text-gray-400 hover:text-gray-700 text-3xl font-bold transition-colors focus:outline-none"
              aria-label="Close modal"
            >
              &times;
            </button>

            <h3 className="text-2xl font-bold mb-6 text-gray-900">
              {editId ? "Edit Grade" : "Add New Grade"}
            </h3>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 overflow-y-auto pr-4"
              style={{ scrollbarGutter: "stable" }}
            >
              {/* Group inputs in sections */}
              {/* Student, Department, Course */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block font-semibold mb-2">Student *</label>
                  <select
                    name="student"
                    value={formData.student}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Select Student</option>
                    {students.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Department *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-2">Course *</label>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.courseName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Term, Semester, Academic Year, Credit Hours */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block font-semibold mb-2">Term *</label>
                  <input
                    type="text"
                    name="term"
                    value={formData.term}
                    onChange={handleInputChange}
                    placeholder="e.g. Fall, Spring"
                    required
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Semester (1-12)
                  </label>
                  <input
                    type="number"
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    min={1}
                    max={12}
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Academic Year *
                  </label>
                  <input
                    type="text"
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleInputChange}
                    placeholder="e.g. 2024-2025"
                    required
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Credit Hours *
                  </label>
                  <input
                    type="number"
                    name="creditHours"
                    value={formData.creditHours}
                    onChange={handleInputChange}
                    min={0}
                    step="0.1"
                    required
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>

              {/* Assessments Section */}
              <div>
                <label className="block font-semibold mb-3 text-lg">
                  Assessments
                </label>
                {formData.assessments.length === 0 && (
                  <p className="text-gray-500 italic mb-3">
                    No assessments added yet.
                  </p>
                )}
                {formData.assessments.map((a, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr_1fr_auto] gap-3 items-center mb-3"
                  >
                    <input
                      type="text"
                      placeholder="Title"
                      value={a.title}
                      onChange={(e) =>
                        handleAssessmentChange(idx, "title", e.target.value)
                      }
                      className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Score"
                      value={a.score}
                      onChange={(e) =>
                        handleAssessmentChange(idx, "score", e.target.value)
                      }
                      min={0}
                      className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Max Score"
                      value={a.maxScore}
                      onChange={(e) =>
                        handleAssessmentChange(idx, "maxScore", e.target.value)
                      }
                      min={1}
                      className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Weight (%)"
                      value={a.weight}
                      onChange={(e) =>
                        handleAssessmentChange(idx, "weight", e.target.value)
                      }
                      min={0}
                      className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeAssessment(idx)}
                      className="ml-2 text-red-600 font-bold text-2xl hover:text-red-800 transition-colors"
                      title="Remove assessment"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAssessment}
                  className="mt-1 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition-colors focus:outline-none focus:ring-4 focus:ring-green-400"
                >
                  + Add Assessment
                </button>
              </div>

              {/* Final Grade and Grade Point */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold mb-2">
                    Final Grade
                  </label>
                  <input
                    type="text"
                    name="finalGrade"
                    value={formData.finalGrade}
                    onChange={handleInputChange}
                    placeholder="e.g. A+, B"
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Grade Point (0 - 4)
                  </label>
                  <input
                    type="number"
                    name="gradePoint"
                    value={formData.gradePoint}
                    onChange={handleInputChange}
                    min={0}
                    max={4}
                    step="0.01"
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>

              {/* Result Status and Remarks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold mb-2">
                    Result Status *
                  </label>
                  <select
                    name="resultStatus"
                    value={formData.resultStatus}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                    <option value="Incomplete">Incomplete</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-2">Remarks</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Optional remarks"
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-lg shadow-lg transition-colors focus:outline-none focus:ring-4 focus:ring-blue-400"
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
