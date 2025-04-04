import React, { useState, useEffect } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "chart.js/auto";
import '../pages.css';

const OwnerDashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const decoded = jwtDecode(token);
        const role = decoded.role;
        if (!token || role !== 'owner') {
            navigate("/", { replace: true });
        }
    }, [navigate]);

    const pieData = {
        labels: ["Project 1", "Project 2", "Project 3", "Project 4", "Project 5"],
        datasets: [
            {
                data: [30, 20, 25, 15, 10],
                backgroundColor: ["#3498db", "#2ecc71", "#f1c40f", "#e74c3c", "#9b59b6"],
            },
        ],
    };

    const barData = {
        labels: ["Project 1", "Project 2", "Project 3", "Project 4", "Project 5"],
        datasets: [
            {
                label: "Allocated Cost",
                backgroundColor: "#2ecc71",
                data: [500000, 400000, 700000, 600000, 900000],
            },
            {
                label: "Actual Cost",
                backgroundColor: "#e74c3c",
                data: [450000, 350000, 650000, 550000, 850000],
            },
        ],
    };

    const lineData = {
        labels: ["Project 1", "Project 2", "Project 3", "Project 4", "Project 5"],
        datasets: [
            {
                label: "Profit",
                data: [200000, 0, 300000, 0, 250000],
                backgroundColor: "rgba(46, 204, 113, 0.2)",
                borderColor: "#2ecc71",
                fill: true,
            },
            {
                label: "Loss",
                data: [0, -50000, 0, -100000, 0],
                backgroundColor: "rgba(231, 76, 60, 0.2)",
                borderColor: "#e74c3c",
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
            <div className="flex justify-end mb-8">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-300"
                >
                    Manage Users
                </button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h3 className="text-lg font-semibold text-gray-800">Total Projects</h3>
                    <p className="text-2xl font-bold text-blue-500 mt-2">25</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h3 className="text-lg font-semibold text-gray-800">Total Budget</h3>
                    <p className="text-2xl font-bold text-purple-500 mt-2">₹2,50,00,000</p>
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

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                        Cost Distribution
                    </h3>
                    <div className="w-[250px] h-[250px]">
                        <Pie data={pieData} options={chartOptions} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                        Profit & Loss of Projects
                    </h3>
                    <div className="w-[300px] h-[250px]">
                        <Line data={lineData} options={chartOptions} />
                    </div>
                </div>

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

export default OwnerDashboard;