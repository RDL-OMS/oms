import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import './pages.css';

const ProjectList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (location.state?.success) {
      setSuccessMessage(location.state.message);
      // Clear the state after showing the message
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/projects/getprojects');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        
        // Sort projects by updatedAt in descending order (newest first)
        const sortedProjects = data.sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        
        setProjects(sortedProjects);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [successMessage]); // Refetch when success message changes

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/deleteproject/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      
      // Update local state after deletion
      setProjects(projects.filter((project) => project._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="p-6 bg-gray-100 min-h-screen">Loading projects...</div>;
  }

  if (error) {
    return <div className="p-6 bg-gray-100 min-h-screen">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Project List</h2>
        {/* <button
          onClick={() => navigate('/add-project')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add New Project
        </button> */}
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      <table className="w-full bg-white shadow-md rounded-lg">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-3 text-left">S.No</th>
            <th className="p-3 text-left">Project ID</th>
            <th className="p-3 text-left">Project Name</th>
            <th className="p-3 text-left">Description</th>
            <th className="p-3 text-left">Last Updated</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project, index) => (
            <tr key={project._id} className="border-b hover:bg-gray-50">
              <td className="p-3">{index + 1}</td>
              <td className="p-3">{project.projectId}</td>
              <td className="p-3">
                <button
                  onClick={() => navigate(`/project-details/${project._id}`, { state: { project } })}
                  className="text-blue-500 hover:underline font-medium"
                >
                  {project.name}
                </button>
              </td>
              <td className="p-3 text-gray-600">{project.description}</td>
              <td className="p-3 text-sm text-gray-500">
                {new Date(project.updatedAt).toLocaleString()}
              </td>
              <td className="p-3 space-x-2">
                <button
                  onClick={() => navigate(`/costinghead`, {
                    state: { projectId: project._id, projectName: project.name },
                  })}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                >
                  Overhead
                </button>
                <button
                  onClick={() => navigate(`/add-project`, { state: { project } })}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(project._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
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