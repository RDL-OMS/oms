import React from "react";
import './navbar.css'
import { FaProjectDiagram, FaMoneyBillWave } from "react-icons/fa"; // ✅ Correct Import

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-blue-500 text-white flex flex-col p-4">
      <h2 className="text-xl font-semibold mb-6 text-center">Overhead Management</h2>
      <ul className="space-y-4">
        <li className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded cursor-pointer transition">
          <FaProjectDiagram className="text-lg" />
          <span>Projects</span>
        </li>
        <li className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded cursor-pointer transition">
          <FaMoneyBillWave className="text-lg" />
          <span>Overhead Cost</span>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
