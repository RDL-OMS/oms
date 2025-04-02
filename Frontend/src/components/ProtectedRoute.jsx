// // src/components/ProtectedRoute.jsx
// import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import Navbar from "./Navbar"; // Import your existing Navbar

// const ProtectedRoute = ({ allowedRoles }) => {
//   const { user } = useAuth();

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return (
//     <div className="min-h-screen">
//       <Navbar /> {/* Your existing Navbar */}
//       <main className="pt-16 px-4"> {/* Adjust padding to match your Navbar height */}
//         <Outlet />
//       </main>
//     </div>
//   );
// };

// export default ProtectedRoute;
// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;