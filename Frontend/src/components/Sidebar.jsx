import React from "react";
import { FaProjectDiagram, FaMoneyBillWave } from "react-icons/fa"; // ✅ Correct Import
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Overhead Management</h2>
      <ul className="sidebar-menu">
        <li className="sidebar-item">
          <FaProjectDiagram className="sidebar-icon" />
          Projects
        </li>
        <li className="sidebar-item">
          <FaMoneyBillWave className="sidebar-icon" />
          Overhead Cost
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
