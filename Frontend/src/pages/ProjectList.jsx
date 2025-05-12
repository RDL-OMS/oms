// import { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import './pages.css';

// const AddProjectModal = ({ onClose, onAdd }) => {
//   const [formData, setFormData] = useState({
//     projectId: '',
//     name: '',
//     description: '',  
//     budget: ''
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onAdd(formData);
//     onClose();
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
//         <button
//           onClick={onClose}
//           className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl"
//         >
//           &times;
//         </button>
//         <h2 className="text-xl font-semibold mb-4 text-center">Add New Project</h2>
//         <form onSubmit={handleSubmit} className="space-y-3">
//           <input name="projectId" type="text" placeholder="Project ID" onChange={handleChange} required className="w-full border p-2 rounded" />
//           <input name="name" type="text" placeholder="Project Name" onChange={handleChange} required className="w-full border p-2 rounded" />
//           <textarea name="description" placeholder="Project Description" onChange={handleChange} required className="w-full border p-2 rounded h-20" />
//           <input name="budget" type="number" placeholder="₹ Optional" onChange={handleChange} className="w-full border p-2 rounded" />
//           <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Add Project</button>
//         </form>
//       </div>
//     </div>
//   );
// };

// const ProjectList = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [successMessage, setSuccessMessage] = useState(null);
//   const [editingProjectId, setEditingProjectId] = useState(null);
//   const [editedProject, setEditedProject] = useState({});
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [projectToDelete, setProjectToDelete] = useState(null);
//   const [showSaveConfirm, setShowSaveConfirm] = useState(false);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [URole, setrole] = useState(null)

//   const getValidatedRole = () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("No authentication token found");
//       const decoded = jwtDecode(token);
//       if (Date.now() >= decoded.exp * 1000) throw new Error("Token expired");
//       setrole(decoded.role);
//       return decoded.role;
//     } catch (err) {
//       localStorage.removeItem("token");
//       navigate("/login", { state: { error: "Session expired. Please login again." } });
//       throw err;
//     }
//   };

//   useEffect(() => {
//     if (location.state?.success) {
//       setSuccessMessage(location.state.message);
//       window.history.replaceState({}, document.title);
//     }
//   }, [location]);

//   const fetchProjects = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const role = getValidatedRole();
//       const token = localStorage.getItem("token");
//       const response = await fetch(
//         `http://localhost:5000/api/projects/getprojects/${encodeURIComponent(role)}`,
//         { method: 'GET', headers: { "Authorization": `Bearer ${token}` } }
//       );
//       if (!response.ok) throw new Error((await response.json()).message || 'Failed to fetch projects');
//       const data = await response.json();
      
//       if (!data.success || !Array.isArray(data.data)) throw new Error('Invalid projects data format');
//       const sortedProjects = data.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
//       setProjects(sortedProjects);
     
//     } catch (err) {
//       console.error("Fetch error:", err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchProjects(); }, [successMessage]);

//   const handleAddProject = async (newProject) => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch("http://localhost:5000/api/projects", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`
//         },
//         body: JSON.stringify(newProject)
//       });
//       if (!response.ok) throw new Error((await response.json()).message || "Failed to add project");
//       await fetchProjects();
//     } catch (err) {
//       console.error("Add Project error:", err);
//       setError(err.message);
//     }
//   };

//   const handleEdit = (project) => {
//     setEditingProjectId(project._id);
//     setEditedProject({ ...project });
//   };

//   const handleChange = (e, field) => {
//     setEditedProject({ ...editedProject, [field]: e.target.value });
//   };

//   const handleSaveClick = () => setShowSaveConfirm(true);

//   const handleSaveConfirm = async (confirmed) => {
//     setShowSaveConfirm(false);
//     if (!confirmed) return;
//     try {
//       setIsProcessing(true);
//       const token = localStorage.getItem("token");
//       const response = await fetch(`http://localhost:5000/api/projects/${editingProjectId}`, {
//         method: 'PUT',
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`
//         },
//         body: JSON.stringify(editedProject)
//       });
//       if (!response.ok) throw new Error((await response.json()).message || 'Failed to update project');
//       setEditingProjectId(null);
//       await fetchProjects();
//     } catch (err) {
//       console.error("Update error:", err);
//       setError(err.message);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleDeleteClick = (id) => {
//     setProjectToDelete(id);
//     setShowDeleteConfirm(true);
//   };

//   const handleDeleteConfirm = async (confirmed) => {
//     setShowDeleteConfirm(false);
//     if (!confirmed) return;
//     try {
//       setIsProcessing(true);
//       const token = localStorage.getItem("token");
//       const response = await fetch(`http://localhost:5000/api/projects/${projectToDelete}`, {
//         method: 'DELETE',
//         headers: { "Authorization": `Bearer ${token}` }
//       });
//       if (!response.ok) throw new Error((await response.json()).message || 'Failed to delete project');
//       setProjects(projects.filter(project => project._id !== projectToDelete));
//     } catch (err) {
//       console.error("Delete error:", err);
//       setError(err.message);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   if (loading) return <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center"><div className="text-lg">Loading projects...</div></div>;
//   if (error) return <div className="p-6 bg-gray-100 min-h-screen"><div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">Error: {error}<button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">×</button></div><button onClick={fetchProjects} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Retry</button></div>;

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen pt-20">
//       {showDeleteConfirm && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
//             <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
//             <p className="mb-6">Are you sure you want to delete this project? This action cannot be undone.</p>
//             <div className="flex justify-end space-x-3">
//               <button onClick={() => handleDeleteConfirm(false)} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100">Cancel</button>
//               <button onClick={() => handleDeleteConfirm(true)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {showSaveConfirm && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
//             <h3 className="text-lg font-semibold mb-4">Confirm Changes</h3>
//             <p className="mb-6">Are you sure you want to save these changes?</p>
//             <div className="flex justify-end space-x-3">
//               <button onClick={() => handleSaveConfirm(false)} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100">Cancel</button>
//               <button onClick={() => handleSaveConfirm(true)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Save Changes</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {showAddModal && (
//         <AddProjectModal onClose={() => setShowAddModal(false)} onAdd={handleAddProject} />
//       )}

//       <div className="flex justify-between items-center mb-6">
//         <div className="flex items-center space-x-4">
//           {URole == 'owner' && (
//           <button onClick={() => navigate("/admin/dashboard")} className="text-2xl font-bold text-green-600 hover:text-green-800">←</button>
//         )}
//          {URole == 'teamlead' && (
//           <button onClick={() => navigate("/teamlead/dashboard")} className="text-2xl font-bold text-green-600 hover:text-green-800">←</button>
//         )}
//           <h2 className="text-2xl font-semibold text-gray-800">Project List</h2>
//         </div>
//         {URole=='owner' && ( 
//         <button onClick={() => setShowAddModal(true)} className="bg-green-500 text-white px-4 py-2 rounded">Add New Project</button>
//       )}
//       </div>

//       {successMessage && (
//         <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">{successMessage}</div>
//       )}

//       <div className="bg-white shadow-md rounded-lg overflow-hidden">
//         <table className="w-full">
//           <thead className="bg-gray-200">
//             <tr>
//               <th className="p-3 text-left">S.No</th>
//               <th className="p-3 text-left">Project ID</th>
//               <th className="p-3 text-left">Project Name</th>
//               <th className="p-3 text-left">Description</th>
//               <th className="p-3 text-left">Last Updated</th>
//               <th className="p-3 text-left">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {projects.map((project, index) => (
//               <tr key={project._id} className="border-b hover:bg-gray-50">
//                 <td className="p-3">{index + 1}</td>
//                 <td className="p-3">{project.projectId}</td>
//                 <td className="p-3">
//                   {editingProjectId === project._id ? (
//                     <input type="text" value={editedProject.name} onChange={(e) => handleChange(e, "name")} className="border rounded px-2 py-1 w-full" />
//                   ) : (
//                     <button onClick={() => navigate(`/projectdetails`, { state: { project: project } })} className="text-blue-500 hover:underline font-medium">{project.name}</button>
//                   )}
//                 </td>
//                 <td className="p-3">
//                   {editingProjectId === project._id ? (
//                     <input type="text" value={editedProject.description} onChange={(e) => handleChange(e, "description")} className="border rounded px-2 py-1 w-full" />
//                   ) : (
//                     <span className="text-gray-600">{project.description || "-"}</span>
//                   )}
//                 </td>
//                 <td className="p-3 text-sm text-gray-500">{new Date(project.updatedAt).toLocaleString()}</td>
//                 <td className="p-3 space-x-2">
//                   <button onClick={() => navigate(`/costinghead`, { state: { projectId: project.projectId, projectName: project.name } })} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600" disabled={isProcessing}>Overhead</button>
//                   {editingProjectId === project._id ? (
//                     <button onClick={handleSaveClick} className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600" disabled={isProcessing}>{isProcessing ? "Saving..." : "Save"}</button>
//                   ) : (
//                     <button onClick={() => handleEdit(project)} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600" disabled={isProcessing}>Edit</button>
//                   )}
//                   <button onClick={() => handleDeleteClick(project._id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600" disabled={isProcessing}>Delete</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {projects.length === 0 && !loading && (
//         <div className="mt-6 p-4 bg-white rounded shadow text-center text-gray-500">No projects found</div>
//       )}
//     </div>
//   );
// };

// export default ProjectList;


import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import './pages.css';

const AddProjectModal = ({ onClose, onAdd, projects }) => {
  const [formData, setFormData] = useState({
    projectId: '',
    name: '',
    description: '',
    budget: '',
    teamLead: ''
  });
  const [teamLeads, setTeamLeads] = useState([]);
  const [loadingTeamLeads, setLoadingTeamLeads] = useState(false);

  useEffect(() => {
    const nextId = generateNextProjectId(projects);
    setFormData(prev => ({ ...prev, projectId: nextId }));

    const fetchTeamLeads = async () => {
      try {
        setLoadingTeamLeads(true);
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/users", {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Failed to fetch team leads");
        const data = await response.json();
        setTeamLeads(data.data || []);
      } catch (error) {
        console.error("Error fetching team leads:", error);
      } finally {
        setLoadingTeamLeads(false);
      }
    };

    fetchTeamLeads();
  }, [projects]);

  function generateNextProjectId(projects) {
    if (!projects || projects.length === 0) return 'PROJ-001';
    
    const existingIds = projects.map(project => {
      const match = project.projectId?.match(/PROJ-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    }).filter(id => !isNaN(id));
    
    const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    return `PROJ-${(maxId + 1).toString().padStart(3, '0')}`;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.teamLead) {
      alert("Please select a team lead");
      return;
    }
    onAdd(formData);
    onClose();
  };

  return (
    
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
        
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4 text-center">Add New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Project ID</label>
            <input 
              name="projectId" 
              type="text" 
              value={formData.projectId} 
              readOnly 
              className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed" 
            />
          </div>
          <input name="name" type="text" placeholder="Project Name" onChange={handleChange} required className="w-full border p-2 rounded" />
          <textarea name="description" placeholder="Project Description" onChange={handleChange} required className="w-full border p-2 rounded h-20" />
          <input name="budget" type="number" placeholder="₹ Optional" onChange={handleChange} className="w-full border p-2 rounded" />
          
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Team Lead</label>
            <select
              name="teamLead"
              value={formData.teamLead}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
              disabled={loadingTeamLeads}
            >
              <option value="">Select Team Lead</option>
              {teamLeads.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {loadingTeamLeads && <div className="text-sm text-gray-500 mt-1">Loading team leads...</div>}
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            disabled={loadingTeamLeads}
          >
            {loadingTeamLeads ? "Loading..." : "Add Project"}
          </button>
        </form>
      </div>
    </div>
  );
};

const ProjectList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editedProject, setEditedProject] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [URole, setrole] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');

  const getValidatedRole = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      const decoded = jwtDecode(token);
      if (Date.now() >= decoded.exp * 1000) throw new Error("Token expired");
      setrole(decoded.role);
      return decoded.role;
    } catch (err) {
      localStorage.removeItem("token");
      navigate("/login", { state: { error: "Session expired. Please login again." } });
      throw err;
    }
  };

  useEffect(() => {
    if (location.state?.success) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const role = getValidatedRole();
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/projects/getprojects/${encodeURIComponent(role)}`,
        { method: 'GET', headers: { "Authorization": `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error((await response.json()).message || 'Failed to fetch projects');
      const data = await response.json();
      if (!data.success || !Array.isArray(data.data)) throw new Error('Invalid projects data format');
      const sortedProjects = data.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      setProjects(sortedProjects);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, [successMessage]);

  const handleAddProject = async (newProject) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newProject)
      });
      if (!response.ok) throw new Error((await response.json()).message || "Failed to add project");
      await fetchProjects();
    } catch (err) {
      console.error("Add Project error:", err);
      setError(err.message);
    }
  };

  const handleEdit = (project) => {
    setEditingProjectId(project._id);
    setEditedProject({ ...project });
  };

  const handleChange = (e, field) => {
    setEditedProject({ ...editedProject, [field]: e.target.value });
  };

  const handleSaveClick = () => setShowSaveConfirm(true);

  const handleSaveConfirm = async (confirmed) => {
    setShowSaveConfirm(false);
    if (!confirmed) return;
    try {
      setIsProcessing(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/projects/${editingProjectId}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editedProject)
      });
      if (!response.ok) throw new Error((await response.json()).message || 'Failed to update project');
      setEditingProjectId(null);
      await fetchProjects();
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteClick = (id) => {
    setProjectToDelete(id);
    setShowDeleteConfirm(true);
    setDeleteReason(''); // Reset reason when opening modal
  };

  const handleDeleteConfirm = async (confirmed) => {
    setShowDeleteConfirm(false);
    if (!confirmed) return;
    try {
      setIsProcessing(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/projects/${projectToDelete}`, {
        method: 'DELETE',
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ reason: deleteReason })
      });
      if (!response.ok) throw new Error((await response.json()).message || 'Failed to delete project');
      setProjects(projects.filter(project => project._id !== projectToDelete));
      setDeleteReason('');
      setSuccessMessage("Project deleted successfully");
      setTimeout(() => {
        setSuccessMessage(null)
      }, 2000);
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center"><div className="text-lg">Loading projects...</div></div>;
  if (error) return <div className="p-6 bg-gray-100 min-h-screen"><div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">Error: {error}<button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">×</button></div><button onClick={fetchProjects} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Retry</button></div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen pt-20">
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-4">Are you sure you want to delete this project? This action cannot be undone.</p>
            
            <div className="mb-4">
              <label htmlFor="deleteReason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for deletion (required)
              </label>
              <textarea
                id="deleteReason"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                required
                className="w-full border p-2 rounded h-20"
                placeholder="Please specify the reason for deleting this project..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteReason('');
                }} 
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteConfirm(true)} 
                className={`px-4 py-2 text-white rounded ${
                  deleteReason.trim() === '' 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
                disabled={deleteReason.trim() === '' || isProcessing}
              >
                {isProcessing ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Changes</h3>
            <p className="mb-6">Are you sure you want to save these changes?</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => handleSaveConfirm(false)} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100">Cancel</button>
              <button onClick={() => handleSaveConfirm(true)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddProjectModal 
          onClose={() => setShowAddModal(false)} 
          onAdd={handleAddProject}
          projects={projects}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          {URole == 'owner' && (
            <button onClick={() => navigate("/admin/dashboard")} className="text-2xl font-bold text-green-600 hover:text-green-800">←</button>
          )}
          {URole == 'teamlead' && (
            <button onClick={() => navigate("/teamlead/dashboard")} className="text-2xl font-bold text-green-600 hover:text-green-800">←</button>
          )}
          <h2 className="text-2xl font-semibold text-gray-800">Project List</h2>
        </div>
         <button
                    onClick={() => navigate('/report')}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md transition duration-300"
                >
                    Report
                </button>
        {URole=='owner' && ( 
          <button onClick={() => setShowAddModal(true)} className="bg-green-500 text-white px-4 py-2 rounded">Add New Project</button>
        )}
      </div>

      {successMessage && (
        
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">{successMessage}</div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
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
                    <input type="text" value={editedProject.name} onChange={(e) => handleChange(e, "name")} className="border rounded px-2 py-1 w-full" />
                  ) : (
                    <button onClick={() => navigate(`/projectdetails`, { state: { project: project } })} className="text-blue-500 hover:underline font-medium">{project.name}</button>
                  )}
                </td>
                <td className="p-3">
                  {editingProjectId === project._id ? (
                    <input type="text" value={editedProject.description} onChange={(e) => handleChange(e, "description")} className="border rounded px-2 py-1 w-full" />
                  ) : (
                    <span className="text-gray-600">{project.description || "-"}</span>
                  )}
                </td>
                <td className="p-3 text-sm text-gray-500">{new Date(project.updatedAt).toLocaleString()}</td>
                <td className="p-3 space-x-2">
                  <button onClick={() => navigate(`/costinghead`, { state: { projectId: project.projectId, projectName: project.name } })} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600" disabled={isProcessing}>Overhead</button>
                  {editingProjectId === project._id ? (
                    <button onClick={handleSaveClick} className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600" disabled={isProcessing}>{isProcessing ? "Saving..." : "Save"}</button>
                  ) : (
                    <button onClick={() => handleEdit(project)} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600" disabled={isProcessing}>Edit</button>
                  )}
                  <button onClick={() => handleDeleteClick(project._id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600" disabled={isProcessing}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {projects.length === 0 && !loading && (
        <div className="mt-6 p-4 bg-white rounded shadow text-center text-gray-500">No projects found</div>
      )}
    </div>
  );
};

export default ProjectList;