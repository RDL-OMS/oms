import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ManageProjectMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const decoded = jwtDecode(token);
        if (decoded.role !== "teamlead") {
          navigate("/dashboard");
          return;
        }

        // First fetch projects to get members
        const projectsResponse = await fetch(
          `http://localhost:5000/api/projects/getprojects/teamlead`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!projectsResponse.ok) {
          throw new Error("Failed to fetch projects");
        }

        const projectsData = await projectsResponse.json();
        if (!projectsData.success) {
          throw new Error(projectsData.message || "Failed to fetch projects");
        }

        // Extract unique members from all projects
        const allMembers = projectsData.data.flatMap((project) => [
          ...project.members,
          project.teamLead, // Include team lead as well
        ]);

        // Create a map to ensure uniqueness by member ID
        const uniqueMembersMap = new Map();
        allMembers.forEach((member) => {
          if (!uniqueMembersMap.has(member._id)) {
            uniqueMembersMap.set(member._id, {
              id: member._id,
              employeeId: member.employeeId || `EMP-${member._id.slice(-5)}`,
              name: member.name,
              email: member.email,
              role: member.role || "Member", // Default to Member if role not specified
            });
          }
        });

        setMembers(Array.from(uniqueMembersMap.values()));
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMembers();
  }, [navigate]);

  const handleRoleChange = async (memberId, newRole) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/users/update-role/${memberId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to update role");
      }

      // Update local state if API call succeeds
      setMembers(
        members.map((member) =>
          member.id === memberId ? { ...member, role: newRole } : member
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading team members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Project Members</h2>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>

      {members.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p>No team members found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div key={member.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
              <p className="text-gray-500">ID: {member.employeeId}</p>
              <p className="text-gray-500">Email: {member.email}</p>
              <p
                className={`mt-1 text-${
                  member.role === "teamlead" ? "blue" : "green"
                }-500 font-semibold`}
              >
                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
              </p>

              <label className="block mt-4 text-gray-600 font-medium">
                Change Role
              </label>
              <select
                value={member.role}
                onChange={(e) => handleRoleChange(member.id, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg mt-2"
                disabled={member.role === "owner"} // Can't change owner's role
              >
                <option value="member">Member</option>
                <option value="teamlead">Teamlead</option>
              </select>

              <button
                onClick={() => navigate(`/profile/${member.id}`)}
                className="w-full mt-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
              >
                View Full Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageProjectMembers;