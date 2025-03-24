import React from "react";
import { Menu } from "lucide-react"; // Icon for sidebar toggle
import "./navbar.css";

const Navbar = ({ onSidebarToggle }) => {
  return (
    <nav className="flex justify-between items-center bg-teal-700 text-white shadow-md px-6 py-4 fixed top-0 left-0 right-0 w-full z-50">
      {/* Sidebar Toggle Button (Visible on Small Screens) */}
      <button
        onClick={onSidebarToggle}
        className="md:hidden p-2 rounded focus:outline-none"
      >
        <Menu size={24} />
      </button>

      {/* Title */}
      <span className="text-xl font-bold flex-1 text-center md:text-left">
        Overhead Management System
      </span>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white">
          Add Project
        </button>
        <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
