import React, { useEffect, useState } from "react";
import AttendanceTable from "../components/AttendanceTable";
import AttendanceModal from "../components/AttendanceModal";
import axios from "../../api/axios";
import { toast } from "react-hot-toast";

export default function Attendance() {
  const [attendanceList, setAttendanceList] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  const fetchData = async () => {
    try {
      const [attRes, studentsRes, classesRes] = await Promise.all([
        axios.get("/attendance"),
        axios.get("/students"),
        axios.get("/classes"),
      ]);

      setAttendanceList(Array.isArray(attRes.data) ? attRes.data : []);

      if (Array.isArray(studentsRes.data)) {
        setStudents(studentsRes.data);
      } else if (Array.isArray(studentsRes.data.students)) {
        setStudents(studentsRes.data.students);
      } else {
        setStudents([]);
        console.warn("Unexpected /students response:", studentsRes.data);
      }

      setClasses(Array.isArray(classesRes.data) ? classesRes.data : []);
    } catch (error) {
      toast.error("Failed to load data");
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // console.log("hey :", students)

  const handleEdit = (item) => {
    setSelectedAttendance(item);
    setModalOpen(true);
  };

  const handleClose = () => {
    setSelectedAttendance(null);
    setModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <button
          onClick={() => {
            setSelectedAttendance(null);
            setModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Attendance
        </button>
      </div>

      <AttendanceTable
        attendanceList={attendanceList}
        onEdit={handleEdit}
        onDelete={fetchData}
        students={students}
        classes={classes}
      />

      {modalOpen && (
        <AttendanceModal
          key={selectedAttendance?._id || "new"}
          isOpen={modalOpen}
          onClose={handleClose}
          students={students}
          classes={classes}
          selectedAttendance={selectedAttendance}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
