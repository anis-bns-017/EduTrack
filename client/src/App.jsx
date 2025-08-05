import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import SidebarLayout from "./components/SidebarLayout";
import { Toaster } from "react-hot-toast";
import React from "react";
import Students from "./components/Students";
import Teachers from "./pages/Teachers";
import Class from "./pages/Class";
import Grades from "./pages/Grades";
import Attendance from "./pages/Attendance";
import Reports from "./pages/Reports";
 
// Make sure this is imported

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Layout Wrapper */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <SidebarLayout />
            </ProtectedRoute>
          }
        >
          {/* Nested pages inside SidebarLayout */}
          <Route
            index
            element={
              <>
                <h1 className="text-2xl font-bold">
                  Welcome to EduTrack Dashboard
                </h1>
                <p className="mt-2 text-gray-600">
                  Use the sidebar to navigate.
                </p>
              </>
            }
          />
          <Route path="students" element={<Students />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="classes" element={<Class />} />
          <Route path="/grades" element={<Grades />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
