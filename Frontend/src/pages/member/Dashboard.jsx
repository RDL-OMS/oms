import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../pages.css';

const MemberDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole");
    if (!token || role !== 'member') {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="pt-20 px-6 pb-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Dashboard</h1>
        
        {/* Current Projects */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">My Projects</h2>
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-800">Project Alpha</h3>
              <p className="text-gray-600">Status: In Progress</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-800">Project Beta</h3>
              <p className="text-gray-600">Status: Review</p>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activities</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="bg-blue-100 text-blue-800 p-1 rounded-full mr-3">✓</span>
              <span>Task completed: Update project documentation</span>
            </li>
            <li className="flex items-start">
              <span className="bg-green-100 text-green-800 p-1 rounded-full mr-3">!</span>
              <span>New comment on Project Alpha</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;