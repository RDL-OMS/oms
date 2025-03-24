import React from 'react';
import "./Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <span className="navbar-title">Overhead Management System</span>
      <div className="navbar-buttons">
        <button className="btn btn-primary" onClick={() => alert('Add Project Clicked')}>Add Project</button>
        <button className="btn btn-danger" onClick={() => alert('Logout Clicked')}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;