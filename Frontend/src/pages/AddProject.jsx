import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './pages.css';

const AddProject = () => {
  const [formData, setFormData] = useState({
    projectId: "",
    name: "",
    description: "",
    budget: ""
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    // For budget field, remove any non-digit characters
    if (name === "budget") {
      const digitsOnly = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);


    try {
      // Get the token from where you store it (localStorage, cookies, etc.)
      const token = localStorage.getItem('token'); // or your token storage method

      if (!token) {
        throw new Error('Authentication token not found. Please log in.');
      }


      const response = await fetch('http://localhost:5000/api/projects/createproject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Include the token in the Authorization header
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add project');
      }

      navigate("/ProjectList", { state: { success: 'Project added successfully!' } });
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Unauthorized') || err.message.includes('401')) {
        navigate('/login'); // Redirect to login page
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Add New Project
        </h2>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Project ID
            </label>
            <input
              type="text"
              name="projectId"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.projectId}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Project Name
            </label>
            <input
              type="text"
              name="name"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Project Description
            </label>
            <textarea
              name="description"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Budget (INR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2">₹</span>
              <input
                type="text"
                name="budget"
                className="w-full pl-8 p-2 border border-gray-300 rounded-md"
                value={formData.budget}
                onChange={handleChange}
                pattern="\d*"
                inputMode="numeric"
                placeholder="Optional"
              />
            </div>
          </div>
          <button
            type="submit"
            className={`w-full py-2 rounded-md ${isSubmitting ? 'bg-blue-400' : 'bg-blue-500'} text-white`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Project'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProject;