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

  // Get project ID and data from location state
  const projectId = location.state?.projectId;
  const projectData = location.state?.project;

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!projectId) {
          throw new Error("Project information is missing. Please navigate from the projects list.");
        }

        if (projectData) {
          setProject({
            ...projectData,
            projectId: projectData.projectId || projectId,
            name: projectData.projectName || projectData.name || "Unnamed Project"
          });
        } else {
          const response = await fetch(`http://localhost:5000/api/projects/getproject/${projectId}`);
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch project');
          }
          const data = await response.json();
          setProject(data);
        }

        const [overheadsResponse, costEntriesResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/overheads/get/${projectId}`),
          fetch(`http://localhost:5000/api/projects/cost-entries/${projectId}`)
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
        
        if (Array.isArray(entriesData)) {
          setRows(entriesData.length > 0 
            ? entriesData.map((entry, index) => ({
                id: `${projectId}-${index}`,
                overhead: entry.overhead || "",
                subhead: entry.subhead || "",
                description: entry.description || "",
                expectedCost: entry.expectedCost?.toString() || "0",
                actualCost: entry.actualCost?.toString() || "0",
                variance: entry.variance || "0",
                isExisting: true
              }))
            : [{ 
                id: `${projectId}-new-${Date.now()}`,
                overhead: "", 
                subhead: "", 
                description: "", 
                expectedCost: "", 
                actualCost: "", 
                variance: "",
                isExisting: false 
              }]
          );
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
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectData();
    } else {
      setError("Project information is missing");
      setLoading(false);
    }
  }, [projectId, projectData]);

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
      updatedRows[index].variance = variance;
    }

    setRows(updatedRows);
  };

  const addRow = () => {
    setRows([
      ...rows,
      { 
        id: `${projectId}-new-${Date.now()}`,
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

      const rowsToSave = rows.filter(row => !row.isExisting);

      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/cost-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

      navigate('/projectdetails', {
        state: { 
          projectId,
          project: project || projectData 
        },
        replace: true
      });
    } catch (err) {
      console.error('Error saving cost entries:', err);
      setError(err.message || 'Failed to save cost entries');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 max-w-5xl mx-auto">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => navigate('/projects')} 
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  if (!project) {
    return <div className="p-6 max-w-5xl mx-auto">Project not found</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Project: {project.name}</h1>
        <button onClick={() => navigate('/ProjectList')} className="text-gray-600 hover:text-gray-800">
          ← Back to Projects
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 border text-left">Sl.no</th>
                <th className="p-3 border text-left">Overhead</th>
                <th className="p-3 border text-left">Subhead</th>
                <th className="p-3 border text-left">Description</th>
                <th className="p-3 border text-left">Expected Cost ($)</th>
                <th className="p-3 border text-left">Actual Cost ($)</th>
                <th className="p-3 border text-left">Variance (%)</th>
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
                      <div className="p-2">{row.expectedCost}</div>
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
                      <div className="p-2">{row.actualCost}</div>
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
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;