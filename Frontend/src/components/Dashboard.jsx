import React, { useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./Dashboard.css";

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

  return (
    <div className="dashboard">
      {/* Removed the header title */}
      
      {/* Year selection dropdown is placed at the top */}
      <div className="year-selection">
        <label htmlFor="year">Select Year:</label>
        <select
          id="year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="year-dropdown"
        >
          <option value="2025">2025</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
        </select>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Projects</h3>
          <p>25</p>
        </div>
        <div className="stat-card">
          <h3>Total Cost Allocated</h3>
          <p>$1,200,000</p>
        </div>
        <div className="stat-card">
          <h3>Actual Cost</h3>
          <p>$950,000</p>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card">
          <h3>Overhead Cost Distribution</h3>
          <Pie data={pieData} />
        </div>
        <div className="chart-card">
          <h3>Cost Comparison</h3>
          <Bar data={barData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
