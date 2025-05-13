import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ProjectDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State management
  const [project, setProject] = useState(null);
  const [costingData, setCostingData] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [totalExpectedCost, setTotalExpectedCost] = useState(0);
  const [totalActualCost, setTotalActualCost] = useState(0);
  const [budgetUtilization, setBudgetUtilization] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [actionIndex, setActionIndex] = useState(null);
  const [teamDetails, setTeamDetails] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [deleteReason, setDeleteReason] = useState("");

  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [editReason, setEditReason] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    overhead: "",
    subhead: "",
    description: "",
    expectedCost: "",
    actualCost: ""
  });

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // Get project data from location state
  const projectData = location.state?.project;

  // Confirmation dialog handler
  const handleConfirm = (message, action, index) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setActionIndex(index);
    setDeleteReason(""); // Reset delete reason when opening confirmation
    setShowConfirm(true);
  };

  const executeAction = () => {
    if (!deleteReason.trim()) {
      setError("Please provide a reason for deletion");
      return;
    }

    if (confirmAction) {
      confirmAction(actionIndex, deleteReason);
    }
    setShowConfirm(false);
    setDeleteReason("");
  };

  const cancelAction = () => {
    setShowConfirm(false);
    setDeleteReason("");
  };

  // Toggle expansion of cost head group
  const toggleGroupExpansion = (overhead) => {
    setExpandedGroups(prev => ({
      ...prev,
      [overhead]: !prev[overhead]
    }));
  };

  // Open modal for adding new cost entry
  const openAddModal = () => {
    setNewEntry({
      overhead: "",
      subhead: "",
      description: "",
      expectedCost: "",
      actualCost: ""
    });
    setShowAddModal(true);
    setError(null);
  };

  // Handle modal input changes
  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear subhead when overhead changes
    if (name === "overhead") {
      setNewEntry(prev => ({
        ...prev,
        subhead: ""
      }));
    }
  };

  // Save new entry from modal
  const saveNewEntry = () => {
    // Validate inputs
    if (!newEntry.overhead || !newEntry.subhead ||
      isNaN(parseFloat(newEntry.expectedCost)) ||
      isNaN(parseFloat(newEntry.actualCost))) {
      setError("Please fill all fields with valid values");
      return;
    }

    const expected = parseFloat(newEntry.expectedCost) || 0;
    const actual = parseFloat(newEntry.actualCost) || 0;
    const variance = expected !== 0 ? ((actual - expected) / expected) * 100 : 0;

    const entry = {
      id: `${project?.projectId}-new-${Date.now()}`,
      overhead: newEntry.overhead,
      subhead: newEntry.subhead,
      description: newEntry.description,
      expectedCost: expected.toString(),
      actualCost: actual.toString(),
      variance: variance.toFixed(2),
      isExisting: false,
      isEditing: true
    };

    setRows([...rows, entry]);
    setShowAddModal(false);
    setError(null);
  };

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = getToken();
        if (!token) {
          throw new Error("No token provided");
        }

        if (!projectData) {
          throw new Error("Project data is missing. Please navigate from the projects list.");
        }

        // Set initial project data
        console.log("project data", projectData);

        setProject(projectData);

        const projectId = projectData.projectId;
        const headers = {
          'Authorization': `Bearer ${token}`
        };

        const tl = projectData.teamLead?.['_id'] ?? null;

        // Fetch all required data in parallel
        const [overheadsResponse, costEntriesResponse, teamLeadResponse, membersResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/overheads/get/${projectId}`, { headers }),
          fetch(`http://localhost:5000/api/projects/cost-entries/${projectId}`, { headers }),
          projectData.teamLead ?
            fetch(`http://localhost:5000/api/users/${tl}`, { headers }) :
            Promise.resolve({ ok: false }),
          projectData.members?.length > 0 ?
            fetch(`http://localhost:5000/api/users/bulk`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ userIds: projectData.members })
            }) :
            Promise.resolve({ ok: false })
        ]);

        // Process overheads data
        if (!overheadsResponse.ok) {
          const errorData = await overheadsResponse.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch overheads');
        }
        const overheadsData = await overheadsResponse.json();
        const validatedOverheads = (overheadsData.data || overheadsData).map(item => ({
          _id: item._id || Math.random().toString(36).substring(2, 9),
          overheadComponent: item.overheadComponent || 'Uncategorized',
          description: item.description || '',
          subheads: Array.isArray(item.subheads)
            ? item.subheads.map(sub => typeof sub === 'string' ? sub : sub.name)
            : []
        }));
        setCostingData(validatedOverheads);

        // Process cost entries
        if (!costEntriesResponse.ok) {
          const errorData = await costEntriesResponse.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch cost entries');
        }
        const entriesData = await costEntriesResponse.json();
        let totalExpected = 0;
        let totalActual = 0;

        if (Array.isArray(entriesData)) {
          const formattedRows = entriesData.length > 0
            ? entriesData.map((entry, index) => {
              const expected = parseFloat(entry.expectedCost) || 0;
              const actual = parseFloat(entry.actualCost) || 0;
              totalExpected += expected;
              totalActual += actual;

              return {
                id: entry._id || `${projectId}-${index}`,
                overhead: entry.overhead || "",
                subhead: entry.subhead || "",
                description: entry.description || "",
                expectedCost: expected.toString(),
                actualCost: actual.toString(),
                variance: entry.variance || "0",
                isExisting: true,
                isEditing: false
              };
            })
            : [];

          setRows(formattedRows);
          setTotalExpectedCost(totalExpected);
          setTotalActualCost(totalActual);
        }

        // Process team lead and members data
        if (teamLeadResponse.ok) {
          const teamLeadData = await teamLeadResponse.json();
          setTeamDetails(teamLeadData)
        }

        if (membersResponse.ok) {
          const membersData = await membersResponse.json();
          setTeamDetails(prev => ({
            ...prev,
            members: membersData
          }));
        }

      } catch (err) {
        console.error("Error loading project data:", err);
        setError(err.message || 'An error occurred while loading project data');
        if (err.message === "No token provided") {
          navigate('/login', { state: { from: location, error: "Session expired. Please login again." } });
        }
      } finally {
        setLoading(false);
      }
    };

    if (projectData) {
      fetchProjectData();
    } else {
      setError("Project data is missing. Please navigate from the projects list.");
      setLoading(false);
    }
  }, [projectData, location, navigate]);

  useEffect(() => {
    // Calculate budget utilization whenever costs or project changes
    if (project && project.budget > 0) {
      const utilization = (totalActualCost / project.budget) * 100;
      setBudgetUtilization(utilization);
    }
  }, [totalActualCost, project]);

  const overheadOptions = costingData.reduce((acc, item) => {
    acc[item.overheadComponent] = item.subheads;
    return acc;
  }, {});

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };

    if (field === "overhead") {
      updatedRows[index].subhead = "";
    }

    if (field === "expectedCost" || field === "actualCost") {
      const expected = parseFloat(updatedRows[index].expectedCost) || 0;
      const actual = parseFloat(updatedRows[index].actualCost) || 0;
      const variance = expected !== 0 ? ((actual - expected) / expected) * 100 : 0;
      updatedRows[index].variance = variance.toFixed(2);
    }

    setRows(updatedRows);
  };

  const removeRow = (index) => {
    if (rows.length <= 1) return;
    const updatedRows = [...rows];
    updatedRows.splice(index, 1);
    setRows(updatedRows);
  };

  const startEditing = (index) => {
    // Allow editing if no row is being edited OR if clicking the same row that's already being edited
    if (editingId === null || editingId === rows[index].id) {
      const updatedRows = [...rows];
      updatedRows[index].isEditing = true;
      setRows(updatedRows);
      setEditingId(updatedRows[index].id);
      setEditIndex(index);
      setEditReason("");
      setShowEditConfirm(true);
      setError(null);
    } else {
      setError('Please finish editing the current row first');
    }
  };

  const cancelEditing = (index) => {
    const updatedRows = [...rows];
    if (updatedRows[index].isExisting) {
      updatedRows[index].isEditing = false;
    } else {
      updatedRows.splice(index, 1);
    }
    setRows(updatedRows);
    setEditingId(null);
  };

  const validateRows = () => {
    for (const row of rows) {
      if (row.isEditing) {
        if (!row.overhead) return "Please select an overhead for all rows";
        if (!row.subhead) return "Please select a subhead for all rows";
        if (isNaN(parseFloat(row.expectedCost))) return "Please enter valid expected costs";
        if (isNaN(parseFloat(row.actualCost))) return "Please enter valid actual costs";
      }
    }
    return null;
  };

  const saveCostEntries = async () => {
    const validationError = validateRows();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const token = getToken();
      if (!token) {
        throw new Error("No token provided");
      }

      // Separate new entries from edited entries
      const newEntries = rows
        .filter(row => row.isEditing && !row.isExisting)
        .map(row => ({
          overheadComponent: row.overhead,
          subhead: row.subhead,
          description: row.description,
          expectedCost: parseFloat(row.expectedCost) || 0,
          actualCost: parseFloat(row.actualCost) || 0,
        }));

      const updatedEntries = rows
        .filter(row => row.isEditing && row.isExisting)
        .map(row => ({
          id: row.id,
          overheadComponent: row.overhead,
          subhead: row.subhead,
          description: row.description,
          expectedCost: parseFloat(row.expectedCost) || 0,
          actualCost: parseFloat(row.actualCost) || 0,
        }));

      // Make separate API calls for new and updated entries
      const responses = await Promise.all([
        newEntries.length > 0 && fetch(`http://localhost:5000/api/projects/${project?.projectId}/cost-entries`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            entries: newEntries
          })
        }),
        updatedEntries.length > 0 && fetch(`http://localhost:5000/api/projects/${project?.projectId}/cost-entries/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            entries: updatedEntries,
            reason:editReason
          })
        })
      ].filter(Boolean));

      // Check for errors in responses
      for (const response of responses) {
        console.log("response",response);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to save cost entries');
        }
      }

      // Refresh the data after saving
      const [costEntriesResponse] = await Promise.all([
        fetch(`http://localhost:5000/api/projects/cost-entries/${project?.projectId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!costEntriesResponse.ok) {
        throw new Error('Failed to fetch updated cost entries');
      }

      const entriesData = await costEntriesResponse.json();
      let totalExpected = 0;
      let totalActual = 0;

      const formattedRows = Array.isArray(entriesData) && entriesData.length > 0
        ? entriesData.map((entry, index) => {
          const expected = parseFloat(entry.expectedCost) || 0;
          const actual = parseFloat(entry.actualCost) || 0;
          totalExpected += expected;
          totalActual += actual;

          return {
            id: entry._id || `${project?.projectId}-${index}`,
            overhead: entry.overhead || "",
            subhead: entry.subhead || "",
            description: entry.description || "",
            expectedCost: expected.toString(),
            actualCost: actual.toString(),
            variance: entry.variance || "0",
            isExisting: true,
            isEditing: false
          };
        })
        : [];

      setRows(formattedRows);
      setTotalExpectedCost(totalExpected);
      setTotalActualCost(totalActual);
      setEditingId(null);

    } catch (err) {
      console.error('Error saving cost entries:', err);
      setError(err.message || 'Failed to save cost entries');
      if (err.message === "No token provided") {
        navigate('/login', { state: { from: location, error: "Session expired. Please login again." } });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCostEntry = async (id, index, reason) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("No token provided");
      }

      const response = await fetch(`http://localhost:5000/api/projects/cost-entries/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete cost entry');
      }

      const updatedRows = [...rows];
      updatedRows.splice(index, 1);

      if (updatedRows.length === 0) {
        updatedRows.push({
          id: `${project?.projectId}-new-${Date.now()}`,
          overhead: "",
          subhead: "",
          description: "",
          expectedCost: "",
          actualCost: "",
          variance: "",
          isExisting: false,
          isEditing: true
        });
      }

      setRows(updatedRows);

      let totalExpected = 0;
      let totalActual = 0;
      updatedRows.forEach(row => {
        if (row.isExisting) {
          totalExpected += parseFloat(row.expectedCost) || 0;
          totalActual += parseFloat(row.actualCost) || 0;
        }
      });
      setTotalExpectedCost(totalExpected);
      setTotalActualCost(totalActual);

    } catch (err) {
      console.error('Error deleting cost entry:', err);
      setError(err.message || 'Failed to delete cost entry');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    console.log("date function", dateString);

    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="p-6 max-w-5xl mx-auto pt-20">Loading project details...</div>;
  }

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto pt-20">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => navigate('/ProjectList')}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  if (!project) {
    return <div className="p-6 max-w-5xl mx-auto pt-20">Project not found</div>;
  }

  // Group rows by overhead for hierarchical display
  const groupedRows = rows.reduce((acc, row) => {
    if (!row.overhead || !row.isExisting) return acc;

    if (!acc[row.overhead]) {
      acc[row.overhead] = {
        overhead: row.overhead,
        description: row.description,
        expectedCost: 0,
        actualCost: 0,
        variance: 0,
        subheads: [],
        isExpanded: expandedGroups[row.overhead] || false
      };
    }

    acc[row.overhead].subheads.push(row);
    acc[row.overhead].expectedCost += parseFloat(row.expectedCost) || 0;
    acc[row.overhead].actualCost += parseFloat(row.actualCost) || 0;

    return acc;
  }, {});

  // Calculate variance for each group
  Object.values(groupedRows).forEach(group => {
    group.variance = group.expectedCost !== 0
      ? ((group.actualCost - group.expectedCost) / group.expectedCost) * 100
      : 0;
  });

  return (
    <div className="p-6 max-w-5xl mx-auto pt-20">
      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">{confirmMessage}</h3>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Reason for deletion:</label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter reason for deleting this cost entry"
                rows="3"
                required
              />
              {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelAction}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Edit</h3>
            <p className="mb-4">Please provide a reason for editing this cost entry:</p>

            <div className="mb-4">
              <textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter reason for editing..."
                rows="3"
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowEditConfirm(false);
                  setEditReason("");
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!editReason.trim()) {
                    setError("Please provide a reason for editing");
                    return;
                  }
                  const updatedRows = [...rows];
                  updatedRows[editIndex].isEditing = true;
                  setRows(updatedRows);
                  setEditingId(updatedRows[editIndex].id);
                  setShowEditConfirm(false);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Confirm Edit
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Add Cost Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Add New Cost Entry</h3>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Cost Head</label>
                <select
                  name="overhead"
                  value={newEntry.overhead}
                  onChange={handleModalInputChange}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select Cost Head</option>
                  {Object.keys(overheadOptions).map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Subhead</label>
                <select
                  name="subhead"
                  value={newEntry.subhead}
                  onChange={handleModalInputChange}
                  className="w-full p-2 border rounded-md"
                  disabled={!newEntry.overhead}
                  required
                >
                  <option value="">Select Subhead</option>
                  {newEntry.overhead &&
                    overheadOptions[newEntry.overhead]?.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))
                  }
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  name="description"
                  value={newEntry.description}
                  onChange={handleModalInputChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter description"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Expected Cost (₹)</label>
                <input
                  type="number"
                  name="expectedCost"
                  value={newEntry.expectedCost}
                  onChange={handleModalInputChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Actual Cost (₹)</label>
                <input
                  type="number"
                  name="actualCost"
                  value={newEntry.actualCost}
                  onChange={handleModalInputChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setError(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={saveNewEntry}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add Entry
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Project: {project.name} [{project.projectId}]</h1>
        <button
          onClick={() => navigate('/ProjectList')}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back to Projects
        </button>
      </div>

      {/* Budget Summary Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Budget Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Total Budget</h3>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(project.budget)}</p>
          </div>
          <div className="border p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Total Expected Cost</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalExpectedCost)}</p>
          </div>
          <div className="border p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Total Actual Cost</h3>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalActualCost)}</p>
          </div>
          <div className={`border p-4 rounded-lg ${(project.budget - totalActualCost) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <h3 className="font-medium text-gray-700 mb-2">Profit/Loss</h3>
            <p className={`text-2xl font-bold ${(project.budget - totalActualCost) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(project.budget - totalActualCost)}
            </p>
            <p className="text-sm mt-1">
              {((project.budget - totalActualCost) / project.budget * 100).toFixed(2)}% margin
            </p>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="font-medium text-gray-700 mb-2">Budget Utilization</h3>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full"
              style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
            ></div>
          </div>
          <p className="text-right mt-1 text-sm text-gray-600">
            {budgetUtilization.toFixed(2)}% utilized
          </p>
        </div>
      </div>

      {/* Project Information Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Project Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <h3 className="font-medium text-gray-700">Description</h3>
            <p className="text-gray-600">{project.description}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Created At</h3>
            <p className="text-gray-600">{formatDate(project.createdAt)}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Updated At</h3>
            <p className="text-gray-600">{formatDate(project.updatedAt)}</p>
          </div>
        </div>

        {/* Team Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-medium text-gray-700">Team Lead</h3>
            {teamDetails?.data ? (
              <div className="flex items-center mt-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  {teamDetails.data.name?.charAt(0) || 'T'}
                </div>
                <div className="ml-3">
                  <p className="text-gray-800 font-medium">{teamDetails.data.name || 'Team Lead'}</p>
                  <p className="text-gray-500 text-sm">{teamDetails.data.email || ''}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No team lead assigned</p>
            )}
          </div>

          <div>
            <h3 className="font-medium text-gray-700">Team Members</h3>
            {teamDetails?.members && Array.isArray(teamDetails.members) && teamDetails.members.length > 0 ? (
              <div className="mt-2 space-y-2">
                {teamDetails.members.map((member, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-medium">
                      {member.name?.charAt(0) || 'M'}
                    </div>
                    <div className="ml-3">
                      <p className="text-gray-800 font-medium">{member.name || 'Member'}</p>
                      <p className="text-gray-500 text-sm">{member.email || ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No team members assigned</p>
            )}
          </div>
        </div>
      </div>

      {/* Costing Section */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Cost Breakdown</h2>
          <div className="text-gray-600">
            Showing {rows.filter(row => row.isExisting).length} cost entries
          </div>
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 border text-left">Sl.no</th>
                <th className="p-3 border text-left">Overhead</th>
                <th className="p-3 border text-left">Description</th>
                <th className="p-3 border text-left">Expected Cost</th>
                <th className="p-3 border text-left">Actual Cost</th>
                <th className="p-3 border text-left">Variance</th>
                <th className="p-3 border text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(groupedRows).map((group, index) => (
                <React.Fragment key={group.overhead}>
                  {/* Main Cost Head Row */}
                  <tr
                    className={`hover:bg-gray-50 cursor-pointer ${group.variance < 0 ? 'bg-red-50' : 'bg-green-50'}`}
                    onClick={() => toggleGroupExpansion(group.overhead)}
                  >
                    <td className="p-3 border">{index + 1}</td>
                    <td className="p-3 border font-medium">
                      <div className="flex items-center">
                        {expandedGroups[group.overhead] ? '▼' : '▶'} {group.overhead}
                      </div>
                    </td>
                    <td className="p-3 border">{group.description}</td>
                    <td className="p-3 border">{formatCurrency(group.expectedCost)}</td>
                    <td className="p-3 border">{formatCurrency(group.actualCost)}</td>
                    <td className={`p-3 border font-medium ${group.variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {group.variance.toFixed(2)}%
                    </td>
                    <td className="p-3 border text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddModal();
                        }}
                        className="text-blue-500 hover:text-blue-700"
                        title="Add Subhead"
                        disabled={!!editingId}
                      >
                        +
                      </button>
                    </td>
                  </tr>

                  {/* Subhead Rows (visible when expanded) */}
                  {expandedGroups[group.overhead] && group.subheads.map((subhead, subIndex) => {
                    const rowIndex = rows.findIndex(r => r.id === subhead.id);
                    return (
                      <tr key={`${group.overhead}-${subIndex}`} className="hover:bg-gray-50 bg-gray-100">
                        <td className="p-3 border pl-8">{index + 1}.{subIndex + 1}</td>

                        {/* Overhead (non-editable, shown as italic subhead) */}
                        <td className="p-3 border pl-8 italic">{subhead.subhead}</td>

                        {/* Description */}
                        <td className="p-3 border">
                          {subhead.isEditing ? (
                            <input
                              type="text"
                              value={subhead.description}
                              onChange={(e) => handleInputChange(rowIndex, "description", e.target.value)}
                              className="p-2 w-full border rounded-md"
                            />
                          ) : subhead.description}
                        </td>

                        {/* Expected Cost */}
                        <td className="p-3 border">
                          {subhead.isEditing ? (
                            <input
                              type="number"
                              value={subhead.expectedCost}
                              onChange={(e) => handleInputChange(rowIndex, "expectedCost", e.target.value)}
                              className="p-2 w-full border rounded-md"
                            />
                          ) : formatCurrency(parseFloat(subhead.expectedCost))}
                        </td>

                        {/* Actual Cost */}
                        <td className="p-3 border">
                          {subhead.isEditing ? (
                            <input
                              type="number"
                              value={subhead.actualCost}
                              onChange={(e) => handleInputChange(rowIndex, "actualCost", e.target.value)}
                              className="p-2 w-full border rounded-md"
                            />
                          ) : formatCurrency(parseFloat(subhead.actualCost))}
                        </td>

                        {/* Variance */}
                        <td className={`p-3 border ${subhead.variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {parseFloat(subhead.variance).toFixed(2)}%
                        </td>

                        {/* Actions */}
                        <td className="p-3 border text-center">
                          {subhead.isEditing ? (
                            <div className="flex space-x-2 justify-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelEditing(rowIndex);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                                title="Cancel"
                              >
                                ✕
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveCostEntries();
                                }}
                                className="text-green-500 hover:text-green-700"
                                title="Save"
                              >
                                ✓
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2 justify-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditing(rowIndex);
                                }}
                                className="text-blue-500 hover:text-blue-700"
                                title="Edit"
                                disabled={!!editingId && editingId !== subhead.id}
                              >
                                ✎
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  subhead.isExisting
                                    ? handleConfirm(
                                      "Are you sure you want to delete this cost entry?",
                                      (idx, reason) => deleteCostEntry(subhead.id, idx, reason),
                                      rowIndex
                                    )
                                    : removeRow(rowIndex);
                                }}
                                className="text-red-500 hover:text-red-700"
                                title="Delete"
                                disabled={!!editingId}
                              >
                                ×
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                </React.Fragment>
              ))}

              {/* New Row (when in editing mode) */}
              {rows.some(row => !row.isExisting && row.isEditing) && (
                <tr className="bg-yellow-50">
                  <td className="p-3 border">New</td>
                  <td className="p-3 border">
                    <select
                      value={rows.find(row => !row.isExisting)?.overhead || ""}
                      onChange={(e) => handleInputChange(
                        rows.findIndex(row => !row.isExisting),
                        "overhead",
                        e.target.value
                      )}
                      className="p-2 w-full border rounded-md"
                      required
                    >
                      <option value="">Select Overhead</option>
                      {Object.keys(overheadOptions).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 border">
                    <input
                      type="text"
                      value={rows.find(row => !row.isExisting)?.description || ""}
                      onChange={(e) => handleInputChange(
                        rows.findIndex(row => !row.isExisting),
                        "description",
                        e.target.value
                      )}
                      className="p-2 w-full border rounded-md"
                      placeholder="Enter description"
                    />
                  </td>
                  <td className="p-3 border">
                    <input
                      type="number"
                      value={rows.find(row => !row.isExisting)?.expectedCost || ""}
                      onChange={(e) => handleInputChange(
                        rows.findIndex(row => !row.isExisting),
                        "expectedCost",
                        e.target.value
                      )}
                      className="p-2 w-full border rounded-md"
                      placeholder="0.00"
                      required
                    />
                  </td>
                  <td className="p-3 border">
                    <input
                      type="number"
                      value={rows.find(row => !row.isExisting)?.actualCost || ""}
                      onChange={(e) => handleInputChange(
                        rows.findIndex(row => !row.isExisting),
                        "actualCost",
                        e.target.value
                      )}
                      className="p-2 w-full border rounded-md"
                      placeholder="0.00"
                      required
                    />
                  </td>
                  <td className="p-3 border">
                    {rows.find(row => !row.isExisting)?.variance || "--"}
                  </td>
                  <td className="p-3 border text-center">
                    <div className="flex space-x-2 justify-center">
                      <button
                        onClick={() => removeRow(rows.findIndex(row => !row.isExisting))}
                        className="text-gray-500 hover:text-gray-700"
                        title="Cancel"
                      >
                        ✕
                      </button>
                      <button
                        onClick={saveCostEntries}
                        className="text-green-500 hover:text-green-700"
                        title="Save"
                      >
                        ✓
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={openAddModal}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            disabled={!!editingId}
          >
            Add New Cost Entry
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;