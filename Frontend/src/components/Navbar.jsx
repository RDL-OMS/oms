import React from 'react';
import './navbar.css'

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center bg-blue-500 text-white shadow-md px-6 py-4 fixed top-0 left-0 right-0 w-full z-50">
      <span className="text-xl font-bold ">Overhead Management System</span>
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
