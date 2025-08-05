import React from "react";

const Dashboard = () => {
  const stats = [
    { label: "Total Students", value: 320, icon: "👨‍🎓", color: "bg-blue-100 text-blue-600" },
    { label: "Total Teachers", value: 24, icon: "👩‍🏫", color: "bg-green-100 text-green-600" },
    { label: "Total Classes", value: 12, icon: "🏫", color: "bg-yellow-100 text-yellow-600" },
    { label: "Attendance Today", value: "89%", icon: "📈", color: "bg-purple-100 text-purple-600" },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 tracking-tight">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform hover:scale-105 hover:shadow-lg"
          >
            <div
              className={`w-14 h-14 flex items-center justify-center rounded-full mb-4 text-3xl ${item.color} shadow`}
            >
              {item.icon}
            </div>
            <div className="text-4xl font-bold text-gray-900">{item.value}</div>
            <div className="mt-2 text-base text-gray-500 font-medium">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
