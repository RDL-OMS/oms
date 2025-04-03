import React, { useEffect } from "react";
import { Bar, Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "chart.js/auto";

const TeamLeadDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      const role = decoded.role;
      if (role !== "teamlead") {
        navigate("/", { replace: true });
      }
    } else {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // Chart options with Rupees format
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (tooltipItem) {
            return `₹${tooltipItem.raw.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return `₹${value.toLocaleString()}`;
          },
        },
      },
    },
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
        borderColor: "#3498db",
        backgroundColor: "rgba(52, 152, 219, 0.1)",
        tension: 0.3,
        fill: true,
      },
      {
        label: "Actual Progress",
        data: [8, 25, 45, 60, 75, 85],
        borderColor: "#9b59b6",
        backgroundColor: "rgba(155, 89, 182, 0.1)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div className="pt-20 px-6 pb-6 bg-gray-100 min-h-screen">
      {/* Manage Members Button */}
      <div className="flex justify-end mb-4">
        <button onClick={()=> navigate('/teamlead/members')} 
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          Manage Members
        </button>
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
