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

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // Get project data from location state
  const projectData = location.state?.project;

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

        // Set project from the passed data
        setProject(projectData);

        const projectId = projectData.projectId;

        // Fetch costing data with authorization
        const headers = {
          'Authorization': `Bearer ${token}`
        };

        const [overheadsResponse, costEntriesResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/overheads/get/${projectId}`, { headers }),
          fetch(`http://localhost:5000/api/projects/cost-entries/${projectId}`, { headers })
        ]);

        if (!overheadsResponse.ok) {
          const errorData = await overheadsResponse.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch overheads');
        }

        const overheadsData = await overheadsResponse.json();
        const validatedOverheads = (overheadsData.data || overheadsData).map(item => ({
          _id: item._id || Math.random().toString(36).substring(2, 9),
          overheadComponent: item.overheadComponent || 'Uncategorized',
          description: item.description || '',
          subheads: Array.isArray(item.subheads) ? item.subheads : []
        }));
        setCostingData(validatedOverheads);

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
                  id: `${projectId}-${index}`,
                  overhead: entry.overhead || "",
                  subhead: entry.subhead || "",
                  description: entry.description || "",
                  expectedCost: expected.toString(),
                  actualCost: actual.toString(),
                  variance: entry.variance || "0",
                  isExisting: true
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
                isExisting: false 
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
            isExisting: false 
          }]);
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
        isExisting: false
      },
    ]);
  };

  const removeRow = (index) => {
    if (rows.length <= 1) return;
    const updatedRows = [...rows];
    updatedRows.splice(index, 1);
    setRows(updatedRows);
  };

  const validateRows = () => {
    for (const row of rows) {
      if (!row.isExisting) {
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

      const rowsToSave = rows.filter(row => !row.isExisting);

      const response = await fetch(`http://localhost:5000/api/projects/${project?.projectId}/cost-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          entries: rowsToSave.map(row => ({
            overheadComponent: row.overhead,
            subhead: row.subhead,
            description: row.description,
            expectedCost: parseFloat(row.expectedCost) || 0,
            actualCost: parseFloat(row.actualCost) || 0,
            variance: parseFloat(row.variance) || 0
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save cost entries');
      }

      // Refresh the data with authorization
      const costEntriesResponse = await fetch(
        `http://localhost:5000/api/projects/cost-entries/${project?.projectId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const entriesData = await costEntriesResponse.json();
      
      let totalExpected = 0;
      let totalActual = 0;
      const formattedRows = entriesData.map((entry, index) => {
        const expected = parseFloat(entry.expectedCost) || 0;
        const actual = parseFloat(entry.actualCost) || 0;
        totalExpected += expected;
        totalActual += actual;
        
        return {
          id: `${project?.projectId}-${index}`,
          overhead: entry.overhead || "",
          subhead: entry.subhead || "",
          description: entry.description || "",
          expectedCost: expected.toString(),
          actualCost: actual.toString(),
          variance: entry.variance || "0",
          isExisting: true
        };
      });

      setRows(formattedRows);
      setTotalExpectedCost(totalExpected);
      setTotalActualCost(totalActual);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    {row.isExisting ? (
                      <div className="p-2">{row.overhead}</div>
                    ) : (
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
                    )}
                  </td>
                  <td className="p-3 border">
                    {row.isExisting ? (
                      <div className="p-2">{row.subhead}</div>
                    ) : (
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
                    )}
                  </td>
                  <td className="p-3 border">
                    {row.isExisting ? (
                      <div className="p-2">{row.description}</div>
                    ) : (
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) => handleInputChange(index, "description", e.target.value)}
                        className="p-2 w-full border rounded-md"
                        placeholder="Enter description"
                      />
                    )}
                  </td>
                  <td className="p-3 border">
                    {row.isExisting ? (
                      <div className="p-2">{formatCurrency(parseFloat(row.expectedCost))}</div>
                    ) : (
                      <input
                        type="number"
                        value={row.expectedCost}
                        onChange={(e) => handleInputChange(index, "expectedCost", e.target.value)}
                        className="p-2 w-full border rounded-md"
                        placeholder="0.00"
                        required
                      />
                    )}
                  </td>
                  <td className="p-3 border">
                    {row.isExisting ? (
                      <div className="p-2">{formatCurrency(parseFloat(row.actualCost))}</div>
                    ) : (
                      <input
                        type="number"
                        value={row.actualCost}
                        onChange={(e) => handleInputChange(index, "actualCost", e.target.value)}
                        className="p-2 w-full border rounded-md"
                        placeholder="0.00"
                        required
                      />
                    )}
                  </td>
                  <td className={`p-3 border ${row.variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {row.variance !== "" ? `${parseFloat(row.variance).toFixed(2)}%` : "--"}
                  </td>
                  <td className="p-3 border text-center">
                    {!row.isExisting && rows.length > 1 && (
                      <button
                        onClick={() => removeRow(index)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove row"
                      >
                        ×
                      </button>
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
          >
            Add Row
          </button>
          <button
            onClick={saveCostEntries}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;