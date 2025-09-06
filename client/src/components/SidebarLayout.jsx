import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React, { useState } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import Logo from "../helper/Logo";

export default function NavbarLayout() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    { to: "/reports", label: "📄 Reports" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md py-4 px-6">
        <div className="flex items-center justify-between">
          {/* Logo and Menu Toggle for Mobile */}
          <div className="flex items-center">
            <button
              onClick={toggleMenu}
              className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-2 rounded-md font-medium ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-blue-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User Info and Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <User size={16} className="mr-1" />
              <span className="font-semibold text-gray-800">{user?.name}</span>
              <span className="text-gray-500 ml-1">({user?.role})</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium"
            >
              <LogOut size={16} className="mr-1" />
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-3 py-2 rounded-md font-medium ${
                      isActive
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-blue-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <User size={16} className="mr-1" />
                  <span className="font-semibold text-gray-800">
                    {user?.name}
                  </span>
                  <span className="text-gray-500 ml-1">({user?.role})</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium"
                >
                  <LogOut size={16} className="mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Mobile User Info Bar */}
        <div className="md:hidden mb-4 p-3 bg-white rounded-lg shadow-sm flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <User size={16} className="mr-1" />
            <span className="font-semibold text-gray-800">{user?.name}</span>
            <span className="text-gray-500 ml-1">({user?.role})</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium"
          >
            <LogOut size={14} className="mr-1" />
            Logout
          </button>
        </div>

        {/* Render nested routes here */}
        <Outlet />
      </main>
    </div>
  );
}
