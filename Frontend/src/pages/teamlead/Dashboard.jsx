import React, { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "chart.js/auto";

const TeamLeadDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamMembersCount, setTeamMembersCount] = useState(0);
  const [urole, seturole] = useState(null);
  const [uniqueMembers, setUniqueMembers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      const role = decoded.role;
      if (role !== "teamlead") {
        navigate("/", { replace: true });
      } else {
        seturole(role); // setting this will trigger the next useEffect
      }
    } else {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (urole === "teamlead") {
      const token = localStorage.getItem("token");
      const decoded = jwtDecode(token);
      console.log("urole updated:", urole);
      fetchProjects(decoded.id);  // Safe to call here after role is confirmed
    }
  }, [urole]);

  const fetchProjects = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const role = urole;
      const response = await fetch(`http://localhost:5000/api/projects/getprojects/${role}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();
      if (data.success) {
        setProjects(data.data);

        // Calculate unique team members count across all projects
        // const allMembers = data.data.flatMap(project =>
        //   project.members.map(member => member._id)
        // );
        const allMembers = data.data.flatMap(project => [
          ...project.members,
          project.teamLead // Include team lead as well
        ]);
        const uniqueMembers = new Set(allMembers);
        const uniqueMembersMap = new Map();
        allMembers.forEach(member => {
          if (!uniqueMembersMap.has(member._id)) {
            uniqueMembersMap.set(member._id, {
              id: member._id,
              employeeId: member.employeeId || `EMP-${member._id.slice(-5)}`,
              name: member.name,
              email: member.email,
              role: member.role || "member",
            });
          }
        });

        setTeamMembersCount(uniqueMembers.size);
        setUniqueMembers(Array.from(uniqueMembersMap.values()));


      } else {
        setError(data.message || "Failed to fetch projects");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
        beginAtZero: false,
        ticks: {
          callback: function (value) {
            return `₹${value.toLocaleString()}`;
          },
        },
      },
    },
  };

  // Prepare chart data based on fetched projects
  const prepareChartData = () => {
    if (projects.length === 0) {
      return {
        teamBarData: {
          labels: ["No projects"],
          datasets: [
            {
              label: "Allocated Budget",
              backgroundColor: "#2ecc71",
              data: [0],
            },
            {
              label: "Actual Spending",
              backgroundColor: "#e74c3c",
              data: [0],
            },
          ],
        },
        profitLossData: {
          labels: ["No projects"],
          datasets: [
            {
              label: "Profit/Loss",
              data: [0],
              borderColor: "#1abc9c",
              backgroundColor: "rgba(26, 188, 156, 0.2)",
              tension: 0.5,
              fill: true,
            },
          ],
        },
      };
    }

    // For demonstration - in a real app you would use actual project data
    // Here we're just taking the first 3 projects for the charts
    const displayedProjects = projects.slice(0, 3);

    const teamBarData = {
      labels: displayedProjects.map(project => project.name),
      datasets: [
        {
          label: "Allocated Budget",
          backgroundColor: "#2ecc71",
          data: displayedProjects.map(project => project.budget || 0),
        },
        {
          label: "Actual Spending",
          backgroundColor: "#e74c3c",
          data: displayedProjects.map(project => (project.budget || 0) * 0.8), // Example: 80% of budget
        },
      ],
    };

    const profitLossData = {
      labels: displayedProjects.map(project => project.name),
      datasets: [
        {
          label: "Profit/Loss",
          data: displayedProjects.map(project => (project.budget || 0) * 0.2), // Example: 20% profit
          borderColor: "#1abc9c",
          backgroundColor: "rgba(26, 188, 156, 0.2)",
          tension: 0.5,
          fill: true,
          pointBackgroundColor: "#1abc9c",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#1abc9c",
        },
      ],
    };

    return { teamBarData, profitLossData };
  };

  const { teamBarData, profitLossData } = prepareChartData();

  if (loading) {
    return (
      <div className="pt-20 px-6 pb-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 px-6 pb-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 px-6 pb-6 bg-gray-100 min-h-screen">
      {/* Manage Members Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate("/teamlead/members", { state: { members: uniqueMembers } })}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Manage Members
        </button>
      </div>

      {/* Team-Focused Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => navigate("/ProjectList")}
          className="bg-white p-6 rounded-lg shadow-md text-center cursor-pointer hover:shadow-lg transition"
        >
          <h3 className="text-lg font-semibold text-gray-800">My Projects</h3>
          <p className="text-2xl font-bold text-blue-500 mt-2">{projects.length}</p>
        </div>
        <div
          onClick={() => navigate("/teamlead/members", { state: { members: uniqueMembers } })}
          className="bg-white p-6 rounded-lg shadow-md text-center cursor-pointer hover:shadow-lg transition"
        >
          <h3 className="text-lg font-semibold text-gray-800">Team Members</h3>
          <p className="text-2xl font-bold text-purple-500 mt-2">{teamMembersCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-800">Budget Variance</h3>
          <p className="text-2xl font-bold text-green-500 mt-2">
            {projects.length > 0 ? "+8%" : "N/A"}
          </p>
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
            Profit / Loss Overview
          </h3>
          <div className="w-full h-[300px]">
            <Line data={profitLossData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamLeadDashboard;