import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [costingData, setCostingData] = useState([]);
  const [rows, setRows] = useState([
    { id: 1, overhead: "", subhead: "", description: "", expectedCost: "", actualCost: "", variance: "" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        
        // Check if project data was passed via state
        if (location.state?.project) {
          setProject(location.state.project);
        } else {
          // Fetch project details if not passed via state
          const response = await fetch(`http://localhost:5000/api/projects/getproject/${projectId}`);
          if (!response.ok) throw new Error('Failed to fetch project');
          const data = await response.json();
          setProject(data);
        }

        // Fetch overhead data
        const overheadsResponse = await fetch(`http://localhost:5000/api/overheads/get/${projectId}`);
        if (!overheadsResponse.ok) throw new Error('Failed to fetch overheads');
        
        const result = await overheadsResponse.json();
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
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (projectId) fetchProjectData();
  }, [projectId, location.state]);

  // Transform costingData into overheadOptions format
  const overheadOptions = costingData.reduce((acc, item) => {
    acc[item.overheadComponent] = item.subheads;
    return acc;
  }, {});

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    if (field === "overhead") {
      updatedRows[index].subhead = "";
    }

    if (field === "expectedCost" || field === "actualCost") {
      const expected = parseFloat(updatedRows[index].expectedCost) || 0;
      const actual = parseFloat(updatedRows[index].actualCost) || 0;
      updatedRows[index].variance = ((actual - expected) / expected) * 100 || 0;
    }

    setRows(updatedRows);
  };

  const addRow = () => {
    setRows([
      ...rows,
      { id: rows.length + 1, overhead: "", subhead: "", description: "", expectedCost: "", actualCost: "", variance: "" },
    ]);
  };

  const saveCostEntries = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/cost-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entries: rows.map(row => ({
            overheadComponent: row.overhead,
            subhead: row.subhead,
            description: row.description,
            expectedCost: parseFloat(row.expectedCost) || 0,
            actualCost: parseFloat(row.actualCost) || 0,
            variance: row.variance
          }))
        })
      });

      if (!response.ok) throw new Error('Failed to save cost entries');
      const result = await response.json();
      alert('Cost entries saved successfully!');
    } catch (err) {
      console.error('Error saving cost entries:', err);
      alert('Failed to save cost entries');
    }
  };

  if (loading) return <div className="p-6 max-w-5xl mx-auto">Loading project details...</div>;
  if (error) return <div className="p-6 max-w-5xl mx-auto text-red-500">{error}</div>;
  if (!project) return <div className="p-6 max-w-5xl mx-auto">Project not found</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Project Title: {project.name}</h1>

      <div className="bg-white shadow-md rounded-lg p-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">S.No</th>
              <th className="p-2 border">Overhead</th>
              <th className="p-2 border">Subhead</th>
              <th className="p-2 border">Project Description</th>
              <th className="p-2 border">Expected Cost ($)</th>
              <th className="p-2 border">Actual Cost ($)</th>
              <th className="p-2 border">Variance (%)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="text-center">
                <td className="p-2 border">{row.id}</td>
                <td className="p-2 border">
                  <select
                    value={row.overhead}
                    onChange={(e) => handleInputChange(index, "overhead", e.target.value)}
                    className="p-2 border rounded-md"
                  >
                    <option value="">Select</option>
                    {Object.keys(overheadOptions).map((option, idx) => (
                      <option key={idx} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2 border">
                  <select
                    value={row.subhead}
                    onChange={(e) => handleInputChange(index, "subhead", e.target.value)}
                    className="p-2 border rounded-md"
                    disabled={!row.overhead}
                  >
                    <option value="">Select</option>
                    {row.overhead &&
                      overheadOptions[row.overhead]?.map((sub, idx) => (
                        <option key={idx} value={sub}>
                          {sub}
                        </option>
                      ))}
                  </select>
                </td>
                <td className="p-2 border">
                  <input
                    type="text"
                    value={row.description}
                    onChange={(e) => handleInputChange(index, "description", e.target.value)}
                    className="p-2 w-full border rounded-md"
                    placeholder="Enter description"
                  />
                </td>
                <td className="p-2 border">
                  <input
                    type="number"
                    value={row.expectedCost}
                    onChange={(e) => handleInputChange(index, "expectedCost", e.target.value)}
                    className="p-2 w-full border rounded-md"
                    placeholder="Enter expected cost"
                  />
                </td>
                <td className="p-2 border">
                  <input
                    type="number"
                    value={row.actualCost}
                    onChange={(e) => handleInputChange(index, "actualCost", e.target.value)}
                    className="p-2 w-full border rounded-md"
                    placeholder="Enter actual cost"
                  />
                </td>
                <td className={`p-2 border font-semibold ${row.variance >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {row.variance !== "" ? `${row.variance.toFixed(2)}%` : "--"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between mt-4">
          <button
            onClick={addRow}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Add Overhead
          </button>
          <button
            onClick={saveCostEntries}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Save Project Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;