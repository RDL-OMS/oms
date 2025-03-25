import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './pages.css'

const ProjectList = () => {
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([
    { id: 1, name: "Project A", description: "Description A" },
    { id: 2, name: "Project B", description: "Description B" },
    { id: 3, name: "Project C", description: "Description C" },
  ]);

  const handleDelete = (id) => {
    setProjects(projects.filter((project) => project.id !== id));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Project List</h2>
      <table className="w-full bg-white shadow-md rounded-lg">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-3 text-left">S.No</th>
            <th className="p-3 text-left">Project Name</th>
            <th className="p-3 text-left">Project Description</th>
            <th className="p-3 text-left">Overhead</th>
            <th className="p-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project, index) => (
            <tr key={project.id} className="border-b">
              <td className="p-3">{index + 1}</td>
              <td className="p-3">
                <button
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="text-blue-500 hover:underline"
                >
                  {project.name}
                </button>
              </td>
              <td className="p-3">{project.description}</td>
              <td className="p-3">
                <button
                  onClick={() => navigate(`/overhead/${project.id}`)}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Overhead
                </button>
              </td>
              <td className="p-3">
                <button
                  onClick={() => navigate(`/edit-project/${project.id}`)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectList;
