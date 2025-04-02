import React, { useState, useEffect } from "react";
import { Bar, Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "chart.js/auto";
import '../pages.css';

const TeamLeadDashboard = () => {
  
  const [year, setYear] = useState("2025");
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    const role=decoded.role;
    console.log("token",role);
    if (!token || role !== 'teamlead') {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // Chart options configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        }
      }
    }
  };

  // Team performance data
  const teamBarData = {
    labels: ["Project A", "Project B", "Project C"],
    datasets: [
      {
        label: "Allocated Budget",
        backgroundColor: "#2ecc71",
        data: [500000, 400000, 300000],
      },
      {
        label: "Actual Spending",
        backgroundColor: "#e74c3c",
        data: [450000, 350000, 280000],
      },
    ],
  };

  // Timeline progress data
  const timelineData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Planned Progress",
        data: [10, 30, 50, 70, 80, 90],
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: "Actual Progress",
        data: [8, 25, 45, 60, 75, 85],
        borderColor: '#9b59b6',
        backgroundColor: 'rgba(155, 89, 182, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  return (
    <div className="pt-20 px-6 pb-6 bg-gray-100 min-h-screen">
      {/* Year Selection */}
      <div className="flex justify-center mb-8">
        <div className="p-4 bg-white shadow-lg rounded-lg flex items-center">
          <label htmlFor="year" className="font-semibold mr-3 text-gray-700 text-lg">
            Select Year:
          </label>
          <select
            id="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-300"
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
      </div>

      {/* Team-Focused Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-800">My Projects</h3>
          <p className="text-2xl font-bold text-blue-500 mt-2">3</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-800">Team Members</h3>
          <p className="text-2xl font-bold text-purple-500 mt-2">5</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-800">Budget Variance</h3>
          <p className="text-2xl font-bold text-green-500 mt-2">+8%</p>
        </div>
      </div>

      {/* Team Performance Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Project Budgets
          </h3>
          <div className="w-full h-[300px]">
            <Bar data={teamBarData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Timeline Progress
          </h3>
          <div className="w-full h-[300px]">
            <Line data={timelineData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamLeadDashboard;