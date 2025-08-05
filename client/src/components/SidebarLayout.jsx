import { Link, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React from "react";

export default function SidebarLayout() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate("/login");
  };

  const menuItems = [
    { to: "/", label: "📊 Dashboard" },
    { to: "/students", label: "🎓 Students" },
    { to: "/teachers", label: "👩‍🏫 Teachers" },
    { to: "/classes", label: "🏫 Classes" },
    { to: "/grades", label: "📈 Grades" },
    { to: "/attendance", label: "🕒 Attendance" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r shadow-md p-6">
        <h2 className="text-2xl font-bold text-blue-700 mb-8">EduTrack</h2>
        <nav className="space-y-4">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="block px-3 py-2 rounded hover:bg-blue-100 text-gray-700 font-medium"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="mt-10 bg-red-500 hover:bg-red-600 text-white w-full py-2 rounded shadow-sm"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-6">
        <div className="mb-4 text-sm text-gray-600">
          Logged in as:{" "}
          <span className="font-semibold text-gray-800">{user?.name}</span> (
          {user?.role})
        </div>

        {/* Render nested routes here */}
        <Outlet />
      </main>
    </div>
  );
}
