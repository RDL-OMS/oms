import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from "./pages/Dashboard";
import Login from "./pages/login";
import AddProject from "./pages/AddProject";
function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex">
      {/* Sidebar - Hidden on small screens unless toggled */}
      <div className={`fixed inset-y-0 left-0 transform bg-white shadow-lg transition-all duration-300 md:relative md:translate-x-0 z-50 ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full md:w-64 md:block"}`}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Pass toggle function to Navbar */}
        <Navbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
          <Route path="/add-project" element={<AddProject />} />
          
      </Routes>
    </Router>
  );
}

export default App;
