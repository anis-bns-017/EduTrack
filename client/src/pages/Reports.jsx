import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("attendance");
  const [attendanceData, setAttendanceData] = useState([]);
  const [gradeData, setGradeData] = useState([]);

  // Fetch Attendance report data
  const fetchAttendanceReport = async () => {
    try {
      const res = await axios.get("/attendance/report");
      console.log("Attendance report API response:", res.data);
      if (Array.isArray(res.data)) {
        setAttendanceData(res.data);
      } else if (Array.isArray(res.data.data)) {
        setAttendanceData(res.data.data);
      } else {
        setAttendanceData([]);
      }
    } catch (error) {
      toast.error("Failed to load attendance report");
      setAttendanceData([]);
    }
  };

  // Fetch Grade report data
  const fetchGradeReport = async () => {
    try {
      const res = await axios.get("/grades/report");
      console.log("Grade report API response:", res.data);
      if (Array.isArray(res.data)) {
        setGradeData(res.data);
      } else if (Array.isArray(res.data.data)) {
        setGradeData(res.data.data);
      } else {
        setGradeData([]);
      }
    } catch (error) {
      toast.error("Failed to load grade report");
      setGradeData([]);
    }
  };

  useEffect(() => {
    if (activeTab === "attendance") {
      fetchAttendanceReport();
    } else {
      fetchGradeReport();
    }
  }, [activeTab]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>
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

      {activeTab === "attendance" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Attendance Report</h2>
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
                    <td className="border p-2">{record.student?.name || "N/A"}</td>
                    <td className="border p-2">{record.class?.className || "N/A"}</td>
                    <td className="border p-2">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="border p-2">{record.status}</td>
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
        </div>
      )}

      {activeTab === "grades" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Grade Report</h2>
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Student</th>
                <th className="border p-2">Class</th>
                <th className="border p-2">Grade</th>
              </tr>
            </thead>
            <tbody>
              {gradeData.length > 0 ? (
                gradeData.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="border p-2">{record.student?.name || "N/A"}</td>
                    <td className="border p-2">{record.class?.className || "N/A"}</td>
                    <td className="border p-2">{record.grade}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center p-4">
                    No grade records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
