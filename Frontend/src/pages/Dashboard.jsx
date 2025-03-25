import React, { useState,useEffect } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import "chart.js/auto";
import './pages.css';

const Dashboard = () => {
  const [year, setYear] = useState("2025");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/", { replace: true }); // Redirect to login if no token
    }
  }, [navigate]);

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
        data: [500000, 400000, 700000, 600000, 900000, 550000, 800000],
      },
      {
        label: "Actual Cost",
        backgroundColor: "#e74c3c",
        data: [450000, 350000, 650000, 550000, 850000, 500000, 750000],
      },
    ],
  };

  const areaData = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Revenue",
        data: [1000000, 1200000, 900000, 1100000, 1300000, 1250000, 1400000],
        backgroundColor: "rgba(52, 152, 219, 0.2)", 
        borderColor: "#3498db",
        fill: true,
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
  };

  return (
    <div className="pt-20 px-6 pb-6 bg-gray-100 min-h-screen">
      {/* Year Selection in Box */}
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
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-800">Total Projects</h3>
          <p className="text-2xl font-bold text-blue-500 mt-2">25</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-800">Total Cost Allocated</h3>
          <p className="text-2xl font-bold text-green-500 mt-2">₹1,20,00,000</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-800">Actual Cost</h3>
          <p className="text-2xl font-bold text-red-500 mt-2">₹95,00,000</p>
        </div>
      </div>

      {/* Charts Section - All in One Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Overhead Cost Distribution
          </h3>
          <div className="w-[250px] h-[250px]">
            <Pie data={pieData} options={chartOptions} />
          </div>
        </div>

        {/* Area Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Revenue Growth
          </h3>
          <div className="w-[300px] h-[250px]">
            <Line data={areaData} options={chartOptions} />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Cost Comparison
          </h3>
          <div className="w-[300px] h-[250px]">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
