import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const CostingHead = () => {
  console.log('CostingHead component is rendering');

  // Get the project ID from the URL
  const { id,projectName} = useParams();
  console.log('Project ID from URL:', id);

  // Hardcode project names for now based on ID
  
  // const projectName = projectNames[id] || 'Unknown Project';
  console.log('Project Name:', projectName);

  const [costingData, setCostingData] = useState([]);
  console.log('Costing Data:', costingData);

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({
    overheadComponent: '',
    description: '',
  });

  const [subheadModalOpen, setSubheadModalOpen] = useState(false);
  const [currentRowId, setCurrentRowId] = useState(null);
  const [subheadInput, setSubheadInput] = useState('');

  const handleAddNewRow = () => {
    const newRow = {
      id: costingData.length + 1,
      overheadComponent: '',
      description: '',
      subheads: [],
    };
    setCostingData([...costingData, newRow]);
    setEditId(newRow.id);
    setEditData({
      overheadComponent: '',
      description: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleSave = (id) => {
    const updatedData = costingData.map((item) =>
      item.id === id ? { ...item, ...editData } : item
    );
    setCostingData(updatedData);
    setEditId(null);
  };

  const handleEdit = (id) => {
    const item = costingData.find((item) => item.id === id);
    setEditId(id);
    setEditData({
      overheadComponent: item.overheadComponent || '',
      description: item.description || '',
    });
  };

  const handleDelete = (id) => {
    const updatedData = costingData.filter((item) => item.id !== id);
    setCostingData(updatedData);
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

  const handleAddSubhead = () => {
    if (subheadInput.trim() === '') return;

    const updatedData = costingData.map((item) => {
      if (item.id === currentRowId) {
        return {
          ...item,
          subheads: [...(item.subheads || []), subheadInput.trim()],
        };
      }
      return item;
    });
    setCostingData(updatedData);
    setSubheadInput('');
  };

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
                const isSubheadEnabled =
                  editId === item.id
                    ? editData.overheadComponent.trim() !== ''
                    : item.overheadComponent && item.overheadComponent.trim() !== '';

                return (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-left">{index + 1}</td>
                    <td className="p-3 text-left">
                      {editId === item.id ? (
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
                      {editId === item.id ? (
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
                              {subhead}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400">No subheads</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {editId === item.id ? (
                        <button
                          onClick={() => handleSave(item.id)}
                          className="text-green-500 hover:text-green-700 mr-4"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="text-blue-500 hover:text-blue-700 mr-4"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenSubheadModal(item.id)}
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
                        onClick={() => handleDelete(item.id)}
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
            {currentRowId && costingData.find((item) => item.id === currentRowId)?.subheads?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-medium">Existing Subheads:</h3>
                <ul className="list-disc pl-5">
                  {costingData
                    .find((item) => item.id === currentRowId)
                    .subheads.map((subhead, idx) => (
                      <li key={idx} className="text-gray-700">
                        {subhead}
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