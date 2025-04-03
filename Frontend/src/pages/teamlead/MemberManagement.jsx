import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const membersData = [
  { id: "RDL-EMP-20001", name: "Aarav", role: "Member" },
  { id: "RDL-EMP-20002", name: "Ishita", role: "Member" },
  { id: "RDL-EMP-20003", name: "Rohan", role: "Teamlead" },
  { id: "RDL-EMP-20004", name: "Neha", role: "Member" },
];

const ManageProjectMembers = () => {
  const [members, setMembers] = useState(membersData);
  const navigate = useNavigate();

  const handleRoleChange = (id, newRole) => {
    setMembers(
      members.map((member) =>
        member.id === id ? { ...member, role: newRole } : member
      )
    );
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <div key={member.id} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
            <p className="text-gray-500">ID: {member.id}</p>
            <p className={`mt-1 text-${member.role === "Teamlead" ? "blue" : "green"}-500 font-semibold`}>
              {member.role}
            </p>
            <label className="block mt-4 text-gray-600 font-medium">Change Role</label>
            <select
              value={member.role}
              onChange={(e) => handleRoleChange(member.id, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg mt-2"
            >
              <option value="Member">Member</option>
              <option value="Teamlead">Teamlead</option>
            </select>
            <button className="w-full mt-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
              View Full Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageProjectMembers;
