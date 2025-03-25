import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from './components/Navbar';
import Dashboard from "./pages/Dashboard";
import Login from "./pages/login";
import AddProject from "./pages/AddProject";
import ProjectList from "./pages/ProjectList";
import ProjectDetails from "./pages/ProjectDetails";
import CostingHead from "./pages/costinghead";
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <div className="min-h-screen">
              <Navbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
              <main className="pt-16 px-4"> {/* pt-16 accounts for navbar height */}
                <Dashboard />
              </main>
            </div>
          }
        />
        {/* Other protected routes */}
        <Route
          path="/add-project"
          element={
            <div className="min-h-screen">
              <Navbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
              <main className="pt-16 px-4"> {/* pt-16 accounts for navbar height */}
                <AddProject />
              </main>
            </div>
          }
        />
        <Route
          path="/ProjectList"
          element={
            <div className="min-h-screen">
              <Navbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
              <main className="pt-16 px-4"> {/* pt-16 accounts for navbar height */}
                <ProjectList />
              </main>
            </div>
          }
        />
        <Route
          path="/Costinghead"
          element={
            <div className="min-h-screen">
              <Navbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
              <main className="pt-16 px-4"> {/* pt-16 accounts for navbar height */}
                <CostingHead />
              </main>
            </div>
          }
        />


        <Route
          path="/Projectdetails"
          element={
            <div className="min-h-screen">
              <Navbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
              <main className="pt-16 px-4"> {/* pt-16 accounts for navbar height */}
                <ProjectDetails />
              </main>
            </div>
          }
        />

        <Route
          path="*"
          element={
            <div className="min-h-screen">
              <Navbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
              <main className="pt-16 px-4"> {/* Consistent padding */}
                {/* Page content goes here */}
                <div className="max-w-7xl mx-auto py-6"> {/* Container with max width */}
                  <h1>Page Not Found</h1>
                </div>
              </main>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;