import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const CostingHead = () => {
  const location = useLocation();
  const { projectId, projectName } = location.state || {};
  const [costingData, setCostingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({
    overheadComponent: '',
    description: '',
  });
  const [subheadModalOpen, setSubheadModalOpen] = useState(false);
  const [currentRowId, setCurrentRowId] = useState(null);
  const [subheadInput, setSubheadInput] = useState('');

  // Fetch overheads from database
  useEffect(() => {
    const fetchOverheads = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/overheads/get/${projectId}`);
        if (!response.ok) throw new Error('Failed to fetch overheads');
        const data = await response.json();
        setCostingData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchOverheads();
  }, [projectId]);

  const handleAddNewRow = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/overheads/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          overheadComponent: '',
          description: '',
          subheads: []
        })
      });

      if (!response.ok) throw new Error('Failed to create overhead');
      
      const newOverhead = await response.json();
      setCostingData([...costingData, newOverhead]);
      setEditId(newOverhead._id);
      setEditData({
        overheadComponent: '',
        description: ''
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/overheads/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      if (!response.ok) throw new Error('Failed to update overhead');
      
      const updatedOverhead = await response.json();
      setCostingData(costingData.map(o => o._id === id ? updatedOverhead : o));
      setEditId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (id) => {
    const item = costingData.find(item => item._id === id);
    setEditId(id);
    setEditData({
      overheadComponent: item.overheadComponent || '',
      description: item.description || ''
    });
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/overheads/delete/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete overhead');
      
      setCostingData(costingData.filter(item => item._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOpenSubheadModal = (id) => {
    setCurrentRowId(id);
    setSubheadModalOpen(true);
    setSubheadInput('');
  };

  const handleCloseSubheadModal = () => {
    setSubheadModalOpen(false);
    setCurrentRowId(null);
    setSubheadInput('');
  };

  const handleAddSubhead = async () => {
    if (!subheadInput.trim()) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/overheads/${currentRowId}/subheads`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: subheadInput.trim() })
        }
      );

      if (!response.ok) throw new Error('Failed to add subhead');
      
      const updatedOverhead = await response.json();
      setCostingData(costingData.map(o => o._id === currentRowId ? updatedOverhead : o));
      setSubheadInput('');
      setSubheadModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-6">Loading overheads...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{projectName}</h1>

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm">
              <th className="p-3 text-left">Sl No</th>
              <th className="p-3 text-left">Overhead Component</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Subheads</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {costingData.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-3 text-center text-gray-500">
                  No overhead data available. Click "Add New Overhead" to start.
                </td>
              </tr>
            ) : (
              costingData.map((item, index) => {
                const isSubheadEnabled = item.overheadComponent?.trim() !== '';

                return (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-left">{index + 1}</td>
                    <td className="p-3 text-left">
                      {editId === item._id ? (
                        <input
                          type="text"
                          name="overheadComponent"
                          value={editData.overheadComponent}
                          onChange={handleInputChange}
                          className="border p-1 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter Overhead Component"
                        />
                      ) : (
                        item.overheadComponent || (
                          <span className="text-gray-400">Not specified</span>
                        )
                      )}
                    </td>
                    <td className="p-3 text-left">
                      {editId === item._id ? (
                        <input
                          type="text"
                          name="description"
                          value={editData.description}
                          onChange={handleInputChange}
                          className="border p-1 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter Description"
                        />
                      ) : (
                        item.description || (
                          <span className="text-gray-400">Not specified</span>
                        )
                      )}
                    </td>
                    <td className="p-3 text-left">
                      {item.subheads && item.subheads.length > 0 ? (
                        <ul className="list-disc pl-5">
                          {item.subheads.map((subhead, idx) => (
                            <li key={idx} className="text-gray-700">
                              {subhead.name || subhead}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400">No subheads</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {editId === item._id ? (
                        <button
                          onClick={() => handleSave(item._id)}
                          className="text-green-500 hover:text-green-700 mr-4"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(item._id)}
                          className="text-blue-500 hover:text-blue-700 mr-4"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenSubheadModal(item._id)}
                        className={`mr-4 ${
                          isSubheadEnabled
                            ? 'text-purple-500 hover:text-purple-700'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!isSubheadEnabled}
                      >
                        Subhead
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <button
          onClick={handleAddNewRow}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
        >
          Add New Overhead
        </button>
      </div>

      {subheadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Subhead</h2>
            <input
              type="text"
              value={subheadInput}
              onChange={(e) => setSubheadInput(e.target.value)}
              className="border p-2 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter subhead"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleAddSubhead}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-200"
              >
                Add
              </button>
              <button
                onClick={handleCloseSubheadModal}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-200"
              >
                Close
              </button>
            </div>
            {currentRowId && costingData.find((item) => item._id === currentRowId)?.subheads?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium">Existing Subheads:</h3>
                <ul className="list-disc pl-5">
                  {costingData
                    .find((item) => item._id === currentRowId)
                    .subheads.map((subhead, idx) => (
                      <li key={idx} className="text-gray-700">
                        {subhead.name || subhead}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CostingHead;