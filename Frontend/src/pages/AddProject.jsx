import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './pages.css'

const AddProject = () => {
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Project Added:", { projectName, projectDesc });

    // Here you can add API call to save the project details

    navigate("/"); // Redirect back to dashboard
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Add New Project
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Project Name
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Project Description
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md"
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md"
          >
            Add Project
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProject;
