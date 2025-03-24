import React from "react";
import { FaProjectDiagram, FaMoneyBillWave } from "react-icons/fa";
import './navbar.css'

const Sidebar = () => {
  return (
    <div className="w-48 h-screen bg-teal-700 text-white flex flex-col p-4 ">
      <h2 className="text-lg font-semibold mb-6 text-center">Overhead Management</h2>
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
