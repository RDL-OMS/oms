import React, { useState, useEffect } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "chart.js/auto";
import dashboardService from "../../../services/DashboardService";
import '../pages.css';

const OwnerDashboard = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const decoded = jwtDecode(token);
                const role = decoded.role;

                if (!token || role !== 'owner') {
                    navigate("/", { replace: true });
                    return;
                }

                const data = await dashboardService.getDashboardData(token);
                console.log("heyeyeyy",data);
                
                setDashboardData(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    if (loading) {
        return <div className="pt-20 px-6 pb-6 bg-gray-100 min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (error) {
        return <div className="pt-20 px-6 pb-6 bg-gray-100 min-h-screen flex items-center justify-center">Error: {error}</div>;
    }

    if (!dashboardData) {
        return <div className="pt-20 px-6 pb-6 bg-gray-100 min-h-screen flex items-center justify-center">No data available</div>;
    }

    // Prepare chart data from dashboardData
    const pieData = {
        labels: dashboardData.projects.map(project => project.name),
        datasets: [
            {
                data: dashboardData.projects.map(project => project.costAllocated),
                backgroundColor: ["#3498db", "#2ecc71", "#f1c40f", "#e74c3c", "#9b59b6"],
            },
        ],
    };

    const barData = {
        labels: dashboardData.projects.map(project => project.name),
        datasets: [
            {
                label: "Allocated Cost",
                backgroundColor: "#2ecc71",
                data: dashboardData.projects.map(project => project.costAllocated),
            },
            {
                label: "Actual Cost",
                backgroundColor: "#e74c3c",
                data: dashboardData.projects.map(project => project.actualCost),
            },
        ],
    };

    const lineData = {
        labels: dashboardData.projects.map(project => project.name),
        datasets: [
            {
                label: "Profit",
                data: dashboardData.projects.map(project => Math.max(0, project.profitLoss)),
                backgroundColor: "rgba(46, 204, 113, 0.2)",
                borderColor: "#2ecc71",
                fill: true,
            },
            {
                label: "Loss",
                data: dashboardData.projects.map(project => Math.min(0, project.profitLoss)),
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
                <div 
                    className="bg-white p-6 rounded-lg shadow-md text-center cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate('/ProjectList')}
                >
                    <h3 className="text-lg font-semibold text-gray-800">Total Projects</h3>
                    <p className="text-2xl font-bold text-blue-500 mt-2">{dashboardData.summary.totalProjects}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h3 className="text-lg font-semibold text-gray-800">Total Budget</h3>
                    <p className="text-2xl font-bold text-purple-500 mt-2">₹{dashboardData.summary.totalBudget.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h3 className="text-lg font-semibold text-gray-800">Total Cost Allocated</h3>
                    <p className="text-2xl font-bold text-green-500 mt-2">₹{dashboardData.summary.totalCostAllocated.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h3 className="text-lg font-semibold text-gray-800">Actual Cost</h3>
                    <p className="text-2xl font-bold text-red-500 mt-2">₹{dashboardData.summary.totalActualCost.toLocaleString('en-IN')}</p>
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