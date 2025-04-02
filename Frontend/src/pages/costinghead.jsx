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
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showSubheadDeleteConfirm, setShowSubheadDeleteConfirm] = useState(false);
  const [subheadToDelete, setSubheadToDelete] = useState(null);

  // Fetch overheads from database
  useEffect(() => {
    const fetchOverheads = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:5000/api/overheads/get/${projectId}`);

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        const result = await response.json();
        const data = result.data || result;

        if (!Array.isArray(data)) {
          throw new Error('Expected array data but received:', data);
        }

        const validatedData = data.map(item => ({
          _id: item._id || Math.random().toString(36).substring(2, 9),
          overheadComponent: item.overheadComponent || '',
          description: item.description || '',
          subheads: Array.isArray(item.subheads) ? item.subheads : []
        }));

        setCostingData(validatedData);
      } catch (err) {
        setError(err.message);
        setCostingData([]);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchOverheads();
  }, [projectId]);

  const handleAddNewRow = async () => {
    try {
      setError(null);
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

      if (!response.ok) throw new Error(`Server responded with status ${response.status}`);

      const result = await response.json();
      const newItem = result.data || result;

      if (!newItem._id) {
        throw new Error('New item missing required _id field');
      }

      setCostingData(prev => [...prev, {
        _id: newItem._id,
        overheadComponent: newItem.overheadComponent || '',
        description: newItem.description || '',
        subheads: newItem.subheads || []
      }]);

      setEditId(newItem._id);
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

  const handleSaveClick = () => {
    setShowSaveConfirm(true);
  };

  const handleSaveConfirm = async (confirmed) => {
    setShowSaveConfirm(false);
    if (!confirmed || !editId) return;

    try {
      setError(null);
      const response = await fetch(`http://localhost:5000/api/overheads/update/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      if (!response.ok) throw new Error(`Server responded with status ${response.status}`);

      const result = await response.json();
      const updatedItem = result.data || result;

      setCostingData(prev =>
        prev.map(item => item._id === editId ? {
          ...item,
          overheadComponent: updatedItem.overheadComponent || item.overheadComponent,
          description: updatedItem.description || item.description
        } : item)
      );
      setEditId(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (id) => {
    const item = costingData.find(item => item._id === id);
    if (!item) {
      setError('Item not found for editing');
      return;
    }

    setEditId(id);
    setEditData({
      overheadComponent: item.overheadComponent || '',
      description: item.description || ''
    });
  };

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async (confirmed) => {
    setShowDeleteConfirm(false);
    if (!confirmed || !itemToDelete) return;

    try {
      setError(null);
      const response = await fetch(`http://localhost:5000/api/overheads/delete/${itemToDelete}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error(`Server responded with status ${response.status}`);

      setCostingData(prev => prev.filter(item => item._id !== itemToDelete));
    } catch (err) {
      setError(err.message);
    } finally {
      setItemToDelete(null);
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
    if (!subheadInput.trim()) {
      setError('Subhead cannot be empty');
      return;
    }

    try {
      setError(null);
      const response = await fetch(
        `http://localhost:5000/api/overheads/${currentRowId}/subheads`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: subheadInput.trim() })
        }
      );

      if (!response.ok) throw new Error(`Server responded with status ${response.status}`);

      const result = await response.json();
      const updatedItem = result.data || result;

      setCostingData(prev =>
        prev.map(item => item._id === currentRowId ? {
          ...item,
          subheads: updatedItem.subheads || [...(item.subheads || []), { name: subheadInput.trim() }]
        } : item)
      );

      setSubheadInput('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSubheadClick = (subheadName) => {
    setSubheadToDelete(subheadName);
    setSubheadModalOpen(false);
    setShowSubheadDeleteConfirm(true);
  };

  const handleDeleteSubheadConfirm = async (confirmed) => {
    setShowSubheadDeleteConfirm(false);
    if (!confirmed || !subheadToDelete || !currentRowId) {
      setSubheadModalOpen(true);
      return;
    }

    try {
      setError(null);
      const response = await fetch(
        `http://localhost:5000/api/overheads/${currentRowId}/subheads`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: subheadToDelete })
        }
      );

      if (!response.ok) throw new Error(`Server responded with status ${response.status}`);

      const result = await response.json();
      const updatedItem = result.data || result;

      setCostingData(prev =>
        prev.map(item => item._id === currentRowId ? {
          ...item,
          subheads: updatedItem.subheads || (item.subheads || []).filter(sh => sh.name !== subheadToDelete)
        } : item)
      );

      setSubheadModalOpen(true);
    } catch (err) {
      setError(err.message);
      setSubheadModalOpen(true);
    } finally {
      setSubheadToDelete(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="p-6">
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
        <p>Error: {error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-2 bg-red-500 text-white px-3 py-1 rounded"
        >
          Dismiss
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        {projectName || 'Untitled Project'}
      </h1>

      {/* Save Confirmation Modal */}
      {showSaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Save</h3>
            <p className="mb-6">Are you sure you want to save these changes?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => handleSaveConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveConfirm(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete this overhead component? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => handleDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteConfirm(true)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subhead Delete Confirmation Modal */}
      {showSubheadDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-70">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Subhead Deletion</h3>
            <p className="mb-6">Are you sure you want to delete the subhead "{subheadToDelete}"?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => handleDeleteSubheadConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSubheadConfirm(true)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subhead Management Modal */}
      {subheadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Manage Subheads</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Add New Subhead:</label>
              <div className="flex">
                <input
                  type="text"
                  value={subheadInput}
                  onChange={(e) => setSubheadInput(e.target.value)}
                  className="border p-2 rounded-l w-full focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter subhead name"
                  required
                />
                <button
                  onClick={handleAddSubhead}
                  className="bg-green-500 text-white px-4 py-2 rounded-r hover:bg-green-600 transition-colors duration-200"
                >
                  Add
                </button>
              </div>
            </div>

            {currentRowId && costingData.find((item) => item._id === currentRowId)?.subheads?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Existing Subheads:</h3>
                <ul className="border rounded divide-y">
                  {costingData
                    .find((item) => item._id === currentRowId)
                    ?.subheads?.map((subhead, idx) => (
                      <li key={idx} className="p-2 flex justify-between items-center">
                        <span className="text-gray-700">
                          {subhead.name || subhead}
                        </span>
                        <button
                          onClick={() => handleDeleteSubheadClick(subhead.name || subhead)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseSubheadModal}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
                          required
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
                      {item.subheads?.length > 0 ? (
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
                          onClick={handleSaveClick}
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
                        className={`mr-4 ${isSubheadEnabled
                            ? 'text-purple-500 hover:text-purple-700'
                            : 'text-gray-400 cursor-not-allowed'
                          }`}
                        disabled={!isSubheadEnabled}
                      >
                        Subhead
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item._id)}
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
    </div>
  );
};

export default CostingHead;