import React from "react";
import { Menu, Home, Folder, Plus, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./navbar.css";

const Navbar = ({ onSidebarToggle }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token
    navigate("/", { replace: true }); // Redirect to login & prevent back navigation
    window.location.reload(); // Ensure all states are reset
  };

  return (
    <nav className="flex justify-between items-center bg-teal-700 text-white shadow-md px-6 py-4 fixed top-0 left-0 right-0 w-full z-50 h-16">
      {/* Sidebar Toggle Button (Visible on Small Screens) */}
      <button
        onClick={onSidebarToggle}
        className="md:hidden p-2 rounded focus:outline-none"
      >
        <Menu size={24} />
      </button>

      {/* Title */}
      <span className="text-xl font-bold flex-1 text-center md:text-left ml-4">
        Overhead Management System
      </span>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button 
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-800 px-4 py-2 rounded text-white"
        >
          <Home size={18} />
          <span>Home</span>
        </button>
        
        <button 
          onClick={() => navigate("/ProjectList")}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-800 px-4 py-2 rounded text-white"
        >
          <Folder size={18} />
          <span>Projects</span>
        </button>
        
        <button 
          onClick={() => navigate("/add-project")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
        >
          <Plus size={18} />
          <span>Add Project</span>
        </button>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;