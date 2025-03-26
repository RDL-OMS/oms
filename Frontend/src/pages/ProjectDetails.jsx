import React, { useState } from "react";

const ProjectDetails = () => {
  const [rows, setRows] = useState([
    { id: 1, overhead: "", subhead: "", description: "", expectedCost: "", actualCost: "", variance: "" },
  ]);

  const overheadOptions = {
    Infrastructure: ["Buildings", "Utilities", "Maintenance"],
    Operations: ["Logistics", "Supply Chain", "Customer Service"],
    IT: ["Software", "Hardware", "Security"],
    HR: ["Recruitment", "Training", "Benefits"],
    Marketing: ["Advertising", "Public Relations", "Market Research"],
  };

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    if (field === "overhead") {
      updatedRows[index].subhead = ""; // Reset subhead when overhead changes
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

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Project Title: XYZ Project</h1>

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
                      overheadOptions[row.overhead].map((sub, idx) => (
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

        <button
          onClick={addRow}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Add Overhead
        </button>
      </div>
    </div>
  );
};

export default ProjectDetails;