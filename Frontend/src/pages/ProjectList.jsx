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
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editedProject, setEditedProject] = useState({});

  useEffect(() => {
    if (location.state?.success) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/projects/getprojects');
        if (!response.ok) throw new Error('Failed to fetch projects');

        const data = await response.json();
        const sortedProjects = data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setProjects(sortedProjects);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [successMessage]);

  const handleEdit = (project) => {
    setEditingProjectId(project._id);
    setEditedProject({ ...project });
  };

  const handleChange = (e, field) => {
    setEditedProject({ ...editedProject, [field]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/updateproject/${editingProjectId}`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedProject),
      });

      if (!response.ok) throw new Error('Failed to update project');

      setProjects(projects.map(proj => (proj._id === editingProjectId ? editedProject : proj)));
      setEditingProjectId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/deleteproject/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete project');

      setProjects(projects.filter((project) => project._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-6 bg-gray-100 min-h-screen">Loading projects...</div>;
  if (error) return <div className="p-6 bg-gray-100 min-h-screen">Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Project List</h2>

      {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{successMessage}</div>}

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
                {editingProjectId === project._id ? (
                  <input
                    type="text"
                    value={editedProject.name}
                    onChange={(e) => handleChange(e, "name")}
                    className="border rounded px-2 py-1 w-full"
                  />
                ) : (
                  <button onClick={() => navigate(`/project-details/${project._id}`, { state: { project } })}
                    className="text-blue-500 hover:underline font-medium">
                    {project.name}
                  </button>
                )}
              </td>
              <td className="p-3">
                {editingProjectId === project._id ? (
                  <input
                    type="text"
                    value={editedProject.description}
                    onChange={(e) => handleChange(e, "description")}
                    className="border rounded px-2 py-1 w-full"
                  />
                ) : (
                  <span className="text-gray-600">{project.description}</span>
                )}
              </td>
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
                
                {editingProjectId === project._id ? (
                  <button
                    onClick={handleSave}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => handleEdit(project)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Edit
                  </button>
                )}

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
