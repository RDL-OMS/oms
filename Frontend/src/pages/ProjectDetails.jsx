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
  const[teamDetails, setTeamDetails] = useState(null);

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
    setShowConfirm(true);
  };

  const executeAction = () => {
    if (confirmAction) {
      confirmAction(actionIndex);
    }
    setShowConfirm(false);
  };

  const cancelAction = () => {
    setShowConfirm(false);
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
        setProject(projectData);


        const projectId = projectData.projectId;
        const headers = {
          'Authorization': `Bearer ${token}`
        };

        const tl = projectData.teamLead._id


        // Fetch all required data in parallel
        const [overheadsResponse, costEntriesResponse, teamLeadResponse, membersResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/overheads/get/${projectId}`, { headers }),
          fetch(`http://localhost:5000/api/projects/cost-entries/${projectId}`, { headers }),
          // Fetch team lead details
          projectData.teamLead ?
            fetch(`http://localhost:5000/api/users/${tl}`, { headers }) :
            Promise.resolve({ ok: false }),
          // Fetch all members details
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
            : [{
              id: `${projectId}-new-${Date.now()}`,
              overhead: "",
              subhead: "",
              description: "",
              expectedCost: "",
              actualCost: "",
              variance: "",
              isExisting: false,
              isEditing: true
            }];

          setRows(formattedRows);
          setTotalExpectedCost(totalExpected);
          setTotalActualCost(totalActual);
        } else {
          setRows([{
            id: `${projectId}-new-${Date.now()}`,
            overhead: "",
            subhead: "",
            description: "",
            expectedCost: "",
            actualCost: "",
            variance: "",
            isExisting: false,
            isEditing: true
          }]);
        }

        // Process team lead and members data

        if (teamLeadResponse.ok) {
          const teamLeadData = await teamLeadResponse.json();
          // Make sure the data has the expected structure;
          
          setTeamDetails(teamLeadData)
        }

        if (membersResponse.ok) {
          const membersData = await membersResponse.json();
          teamDetails.members = membersData;
        }


        // Update project with team details
        setProject(prev => ({
          ...prev,
          ...teamDetails
        }));

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

  const addRow = () => {
    setRows([
      ...rows,
      {
        id: `${project?.projectId}-new-${Date.now()}`,
        overhead: "",
        subhead: "",
        description: "",
        expectedCost: "",
        actualCost: "",
        variance: "",
        isExisting: false,
        isEditing: true
      },
    ]);
  };

  const removeRow = (index) => {
    if (rows.length <= 1) return;
    const updatedRows = [...rows];
    updatedRows.splice(index, 1);
    setRows(updatedRows);
  };

  const startEditing = (index) => {
    if (editingId) {
      setError('Please finish editing the current row first');
      return;
    }

    const updatedRows = [...rows];
    updatedRows[index].isEditing = true;
    setRows(updatedRows);
    setEditingId(updatedRows[index].id);
  };

  const cancelEditing = (index) => {
    const updatedRows = [...rows];
    if (updatedRows[index].isExisting) {
      updatedRows[index].isEditing = false;
    } else {
      // If it's a new row that hasn't been saved yet, remove it
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

      // Prepare data for saving
      const entriesToSave = rows
        .filter(row => row.isEditing)
        .map(row => ({
          id: row.isExisting ? row.id : undefined,
          overheadComponent: row.overhead,
          subhead: row.subhead,
          description: row.description,
          expectedCost: parseFloat(row.expectedCost) || 0,
          actualCost: parseFloat(row.actualCost) || 0,
          variance: parseFloat(row.variance) || 0
        }));

      const response = await fetch(`http://localhost:5000/api/projects/${project?.projectId}/cost-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          entries: entriesToSave
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save cost entries');
      }

      const responseData = await response.json();

      // Handle different response formats
      let savedEntries = [];
      if (Array.isArray(responseData)) {
        savedEntries = responseData;
      } else if (responseData.data) {
        savedEntries = Array.isArray(responseData.data) ? responseData.data : [responseData.data];
      } else {
        savedEntries = [responseData];
      }

      // Update the existing rows in place
      const updatedRows = rows.map(row => {
        if (!row.isEditing) return row;

        // Try to find matching saved entry
        let savedEntry;

        // First try to match by ID for existing entries
        if (row.isExisting) {
          savedEntry = savedEntries.find(entry => entry._id === row.id);
        }

        // If no match by ID, try to match by content (for new entries)
        if (!savedEntry) {
          savedEntry = savedEntries.find(entry =>
            entry.overheadComponent === row.overhead &&
            entry.subhead === row.subhead
          );
        }

        if (!savedEntry) {
          console.warn('No matching saved entry found for:', row);
          return {
            ...row,
            isEditing: false,
            isExisting: true // Assume it was saved even if we can't match
          };
        }

        return {
          ...row,
          id: savedEntry._id || row.id,
          isEditing: false,
          isExisting: true,
          expectedCost: savedEntry.expectedCost?.toString() || row.expectedCost,
          actualCost: savedEntry.actualCost?.toString() || row.actualCost,
          variance: savedEntry.variance?.toString() || row.variance
        };
      });

      // Recalculate totals
      const { totalExpected, totalActual } = updatedRows.reduce(
        (acc, row) => {
          if (row.isExisting) {
            acc.totalExpected += parseFloat(row.expectedCost) || 0;
            acc.totalActual += parseFloat(row.actualCost) || 0;
          }
          return acc;
        },
        { totalExpected: 0, totalActual: 0 }
      );

      setRows(updatedRows);
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

  const deleteCostEntry = async (id, index) => {
    handleConfirm(
      "Are you sure you want to delete this cost entry?",
      async (idx) => {
        try {
          const token = getToken();
          if (!token) {
            throw new Error("No token provided");
          }

          const response = await fetch(`http://localhost:5000/api/projects/cost-entries/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to delete cost entry');
          }

          // Remove the row from local state
          const updatedRows = [...rows];
          updatedRows.splice(idx, 1);

          // If we deleted the last row, add a new empty row
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

          // Recalculate totals
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
      },
      index
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
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

  return (
    <div className="p-6 max-w-5xl mx-auto pt-20">
      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">{confirmMessage}</h3>
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
          <div className={`border p-4 rounded-lg ${(project.budget - totalActualCost) >= 0 ? 'bg-green-50' : 'bg-red-50'
            }`}>
            <h3 className="font-medium text-gray-700 mb-2">Profit/Loss</h3>
            <p className={`text-2xl font-bold ${(project.budget - totalActualCost) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="font-medium text-gray-700">Description</h3>
            <p className="text-gray-600">{project.description}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Created At</h3>
            <p className="text-gray-600">{formatDate(project.createdAt)}</p>
          </div>
        </div>

        {/* Team Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-gray-700">Team Lead</h3>
            {teamDetails.data  ? (
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
            {project.members && Array.isArray(project.members) && project.members.length > 0 ? (
              <div className="mt-2 space-y-2">
                {project.members.map((member, index) => (
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
            Showing {rows.length} cost entries
          </div>
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 border text-left">Sl.no</th>
                <th className="p-3 border text-left">Overhead</th>
                <th className="p-3 border text-left">Subhead</th>
                <th className="p-3 border text-left">Description</th>
                <th className="p-3 border text-left">Expected Cost</th>
                <th className="p-3 border text-left">Actual Cost</th>
                <th className="p-3 border text-left">Variance</th>
                <th className="p-3 border text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id} className="hover:bg-gray-50 even:bg-gray-50">
                  <td className="p-3 border">{index + 1}</td>
                  <td className="p-3 border">
                    {row.isEditing ? (
                      <select
                        value={row.overhead}
                        onChange={(e) => handleInputChange(index, "overhead", e.target.value)}
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
                    ) : (
                      <div className="p-2">{row.overhead}</div>
                    )}
                  </td>
                  <td className="p-3 border">
                    {row.isEditing ? (
                      <select
                        value={row.subhead}
                        onChange={(e) => handleInputChange(index, "subhead", e.target.value)}
                        className="p-2 w-full border rounded-md"
                        disabled={!row.overhead}
                        required
                      >
                        <option value="">Select Subhead</option>
                        {row.overhead &&
                          overheadOptions[row.overhead]?.map((sub, i) => (
                            <option key={`${row.id}-sub-${i}`} value={sub}>
                              {sub}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <div className="p-2">{row.subhead}</div>
                    )}
                  </td>
                  <td className="p-3 border">
                    {row.isEditing ? (
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) => handleInputChange(index, "description", e.target.value)}
                        className="p-2 w-full border rounded-md"
                        placeholder="Enter description"
                      />
                    ) : (
                      <div className="p-2">{row.description}</div>
                    )}
                  </td>
                  <td className="p-3 border">
                    {row.isEditing ? (
                      <input
                        type="number"
                        value={row.expectedCost}
                        onChange={(e) => handleInputChange(index, "expectedCost", e.target.value)}
                        className="p-2 w-full border rounded-md"
                        placeholder="0.00"
                        required
                      />
                    ) : (
                      <div className="p-2">{formatCurrency(parseFloat(row.expectedCost))}</div>
                    )}
                  </td>
                  <td className="p-3 border">
                    {row.isEditing ? (
                      <input
                        type="number"
                        value={row.actualCost}
                        onChange={(e) => handleInputChange(index, "actualCost", e.target.value)}
                        className="p-2 w-full border rounded-md"
                        placeholder="0.00"
                        required
                      />
                    ) : (
                      <div className="p-2">{formatCurrency(parseFloat(row.actualCost))}</div>
                    )}
                  </td>
                  <td className={`p-3 border ${row.variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {row.variance !== "" ? `${parseFloat(row.variance).toFixed(2)}%` : "--"}
                  </td>
                  <td className="p-3 border text-center">
                    {row.isEditing ? (
                      <div className="flex space-x-2 justify-center">
                        <button
                          onClick={() => cancelEditing(index)}
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
                    ) : (
                      <div className="flex space-x-2 justify-center">
                        <button
                          onClick={() => startEditing(index)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Edit"
                          disabled={!!editingId}
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => row.isExisting ?
                            deleteCostEntry(row.id, index) :
                            removeRow(index)
                          }
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
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={addRow}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            disabled={!!editingId}
          >
            Add Row
          </button>
          {editingId && (
            <button
              onClick={saveCostEntries}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;