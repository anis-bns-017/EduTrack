import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import { toast } from "react-hot-toast";

// Helper: Convert data to CSV and trigger download
const exportToCSV = (filename, rows) => {
  if (!rows.length) return toast.error("No data to export");

  const header = Object.keys(rows[0]);
  const csv = [
    header.join(","), // headers
    ...rows.map((row) =>
      header.map((fieldName) => JSON.stringify(row[fieldName] ?? "")).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState("attendance");
  const [attendanceData, setAttendanceData] = useState([]);
  const [gradeData, setGradeData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [className, setClassName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studentsList, setStudentsList] = useState([]);

  // Fetch students for dropdown filter
  const fetchStudents = async () => {
    try {
      const res = await axios.get("/students");
      if (Array.isArray(res.data)) {
        setStudentsList(res.data);
      } else {
        console.error("Unexpected students response:", res.data);
        setStudentsList([]);
      }
    } catch (err) {
      console.error("Error loading students:", err);
      setStudentsList([]);
    }
  };

  // Fetch Reports
  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/reports", {
        className,
        studentId,
        fromDate,
        toDate,
      });
      setAttendanceData(res.data.attendance || []);
      setGradeData(res.data.grades || []);
    } catch (error) {
      console.error("Error loading reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchReports();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>

      {/* Filters */}
      <div className="bg-white shadow p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Class Name</label>
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="e.g. Grade 10A"
            className="border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Student</label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="border rounded p-2"
          >
            <option value="">All</option>
            {Array.isArray(studentsList) &&
              studentsList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
          </select>
        </div>
        <div>
          <button
            onClick={fetchReports}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="flex mb-4 border-b">
        <button
          className={`px-6 py-2 font-semibold ${
            activeTab === "attendance"
              ? "border-b-4 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-blue-600"
          }`}
          onClick={() => setActiveTab("attendance")}
        >
          Attendance Report
        </button>
        <button
          className={`ml-4 px-6 py-2 font-semibold ${
            activeTab === "grades"
              ? "border-b-4 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-blue-600"
          }`}
          onClick={() => setActiveTab("grades")}
        >
          Grade Report
        </button>
      </div>

      {/* Attendance Table */}
      {activeTab === "attendance" && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Attendance Report</h2>
            <button
              onClick={() =>
                exportToCSV(
                  "attendance_report.csv",
                  attendanceData.map((r) => ({
                    Student: r.student?.name || "",
                    Class: r.student?.class || "",
                    Date: r.date ? new Date(r.date).toLocaleDateString() : "",
                    Status: r.status || "",
                  }))
                )
              }
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Export CSV
            </button>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Student</th>
                  <th className="border p-2">Class</th>
                  <th className="border p-2">Date</th>
                  <th className="border p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.length > 0 ? (
                  attendanceData.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="border p-2">
                        {record.student?.name || "N/A"}
                      </td>
                      <td className="border p-2">
                        {record.student?.class || "N/A"}
                      </td>
                      <td className="border p-2">
                        {record.date
                          ? new Date(record.date).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="border p-2">{record.status || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center p-4">
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Grades Table */}
      {activeTab === "grades" && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Grade Report</h2>
            <button
              onClick={() =>
                exportToCSV(
                  "grade_report.csv",
                  gradeData.map((r) => ({
                    Student: r.student?.name || "",
                    Class: r.student?.class || "",
                    Grade: r.grade || "",
                    Date: r.date ? new Date(r.date).toLocaleDateString() : "",
                  }))
                )
              }
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Export CSV
            </button>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">Student</th>
                  <th className="border p-2">Class</th>
                  <th className="border p-2">Grade</th>
                  <th className="border p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {gradeData.length > 0 ? (
                  gradeData.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="border p-2">
                        {record.student?.name || "N/A"}
                      </td>
                      <td className="border p-2">
                        {record.student?.class || "N/A"}
                      </td>
                      <td className="border p-2">{record.grade || "N/A"}</td>
                      <td className="border p-2">
                        {record.date
                          ? new Date(record.date).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center p-4">
                      No grade records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
