import React, { useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import "chart.js/auto";
import './pages.css'

const Dashboard = () => {
  const [year, setYear] = useState("2025");

  const pieData = {
    labels: ["Infrastructure", "Operations", "IT", "HR", "Marketing"],
    datasets: [
      {
        data: [30, 20, 15, 25, 10],
        backgroundColor: ["#3498db", "#2ecc71", "#f1c40f", "#e74c3c", "#9b59b6"],
      },
    ],
  };

  const barData = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Allocated Cost",
        backgroundColor: "#2ecc71",
        data: [50, 40, 70, 60, 90, 55, 80],
      },
      {
        label: "Actual Cost",
        backgroundColor: "#e74c3c",
        data: [45, 35, 65, 55, 85, 50, 75],
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
  };

  return (
    <div className="pt-20 px-6 pb-6 bg-gray-100 min-h-screen ">
      {/* Year Selection */}
      <div className="flex justify-center mb-8">
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
          <option value="2023">2023</option>
          <option value="2022">2022</option>
        </select>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-800">Total Projects</h3>
          <p className="text-2xl font-bold text-blue-500 mt-2">25</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-800">Total Cost Allocated</h3>
          <p className="text-2xl font-bold text-green-500 mt-2">$1,200,000</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-800">Actual Cost</h3>
          <p className="text-2xl font-bold text-red-500 mt-2">$950,000</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Overhead Cost Distribution
          </h3>
          <div className="w-64 h-64">
            <Pie data={pieData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Cost Comparison
          </h3>
          <div className="w-64 h-64">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
