// import { Routes, Route, Navigate } from "react-router-dom";
// import { useState } from "react";
// import Navbar from './components/Navbar';
// import Login from "./pages/login";
// import ProtectedRoute from "./components/ProtectedRoute";
// import OwnerDashboard from "./pages/owner/Dashboard.jsx"
// import TeamLeadDashboard from "./pages/teamlead/Dashboard.jsx";
// import MemberDashboard from "./pages/member/Dashboard";
// import UserManagement from "./pages/admin/UserManagement";
// import AddProject from "./pages/AddProject";
// import ProjectList from "./pages/ProjectList";
// import ProjectDetails from "./pages/ProjectDetails";
// import CostingHead from "./pages/costinghead";
// import { jwtDecode } from "jwt-decode";

// function App() {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   // Wrapper component for protected routes with navbar
//   const ProtectedLayout = ({ children }) => (
//     <div className="min-h-screen">
//       <Navbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
//       <main className="pt-16 px-4">
//         {children}
//       </main>
//     </div>
//   );

//   return (
//     <Routes>
//       {/* Public Routes */}
//       <Route path="/login" element={<Login />} />
//       <Route path="/" element={<Navigate to="/login" replace />} />

//       {/* Owner Routes */}
//       <Route path="/admin/dashboard" element={
//         <ProtectedRoute allowedRoles={['owner']}>
//           <ProtectedLayout>
//             <OwnerDashboard />
//           </ProtectedLayout>
//         </ProtectedRoute>
//       } />
//       <Route path="/admin/users" element={
//         <ProtectedRoute allowedRoles={['owner']}>
//           <ProtectedLayout>
//             <UserManagement />
//           </ProtectedLayout>
//         </ProtectedRoute>
//       } />

//       {/* Team Lead Routes */}
//       <Route path="/teamlead/dashboard" element={
//         <ProtectedRoute allowedRoles={['teamlead']}>
//           <ProtectedLayout>
//             <TeamLeadDashboard />
//           </ProtectedLayout>
//         </ProtectedRoute>
//       } />

//       {/* Member Routes */}
//       <Route path="/member/dashboard" element={
//         <ProtectedRoute allowedRoles={['member']}>
//           <ProtectedLayout>
//             <MemberDashboard />
//           </ProtectedLayout>
//         </ProtectedRoute>
//       } />

//       {/* Common Protected Routes */}
//       <Route path="/add-project" element={
//         <ProtectedRoute>
//           <ProtectedLayout>
//             <AddProject />
//           </ProtectedLayout>
//         </ProtectedRoute>
//       } />
//       <Route path="/project-list" element={
//         <ProtectedRoute>
//           <ProtectedLayout>
//             <ProjectList />
//           </ProtectedLayout>
//         </ProtectedRoute>
//       } />
//       <Route path="/costinghead" element={
//         <ProtectedRoute>
//           <ProtectedLayout>
//             <CostingHead />
//           </ProtectedLayout>
//         </ProtectedRoute>
//       } />
//       <Route path="/project-details/:id" element={
//         <ProtectedRoute>
//           <ProtectedLayout>
//             <ProjectDetails />
//           </ProtectedLayout>
//         </ProtectedRoute>
//       } />

//       {/* Role-based default redirect after login */}
//       <Route path="/dashboard" element={
//         <ProtectedRoute>
//           <ProtectedLayout>
//             {(() => {
//               const token = localStorage.getItem("token");
//               if (!token) return <Navigate to="/login" replace />;

//               try {
//                 const decoded = jwtDecode(token);
//                 const role = decoded.role;
//                 console.log("role", role);

//                 if (role === 'owner') return <Navigate to="/admin/dashboard" replace />;
//                 if (role === 'teamlead') return <Navigate to="/teamlead/dashboard" replace />;
//                 return <Navigate to="/member/dashboard" replace />;
//               } catch (error) {
//                 console.error("Token decoding error:", error);
//                 return <Navigate to="/login" replace />;
//               }
//             })()}
//           </ProtectedLayout>
//         </ProtectedRoute>
//       } />

//       {/* 404 Not Found */}
//       <Route path="*" element={
//         <ProtectedRoute>
//           <ProtectedLayout>
//             <div className="max-w-7xl mx-auto py-6">
//               <h1 className="text-2xl font-bold">Page Not Found</h1>
//             </div>
//           </ProtectedLayout>
//         </ProtectedRoute>
//       } />
//     </Routes>
//   );
// }

// export default App;
// src/App.jsx
// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import OwnerDashboard from "./pages/owner/Dashboard";
import TeamLeadDashboard from "./pages/teamlead/Dashboard";
import MemberDashboard from "./pages/member/Dashboard";
import Navbar from "./components/Navbar"
import ProjectList from "./pages/ProjectList"
import UserManagement from "./pages/owner/Usermanagement";
import CostingHead from "./pages/Costinghead";
import ProjectDetails from "./pages/ProjectDetails";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <Navbar />
              <OwnerDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <Navbar />
              <UserManagement />
            </ProtectedRoute>
          } />


          <Route path="/ProjectList" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <Navbar />
              <ProjectList />
            </ProtectedRoute>
          } />


          <Route path="/projectdetails" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <Navbar />
              <ProjectDetails />
            </ProtectedRoute>
          } />



          <Route path="/costinghead" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <Navbar />
              <CostingHead />
            </ProtectedRoute>
          } />


          <Route path="/teamlead/dashboard" element={
            <ProtectedRoute allowedRoles={['teamlead']}>
              <TeamLeadDashboard />
            </ProtectedRoute>
          } />

          <Route path="/member/dashboard" element={
            <ProtectedRoute allowedRoles={['member']}>
              <MemberDashboard />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={<RoleBasedRedirect />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

// Role-based redirect component with null check
function RoleBasedRedirect() {
  const { user } = useAuth();

  // Handle null/undefined user
  if (!user) {

    return <Navigate to="/login" replace />;
  }

  // Handle missing role
  if (!user.role) {
    console.error("User role is missing");
    return <Navigate to="/login" replace />;
  }

  // Role-based routing
  switch (user.role.toLowerCase()) {
    case 'owner':
      return <Navigate to="/admin/dashboard" replace />;
    case 'teamlead':
      return <Navigate to="/teamlead/dashboard" replace />;
    case 'member':
      return <Navigate to="/member/dashboard" replace />;
    default:
      console.error("Unknown user role:", user.role);
      return <Navigate to="/login" replace />;
  }
}

export default App;