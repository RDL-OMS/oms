// // import React from "react";
// // import { Menu, Home, Folder, LogOut } from "lucide-react";
// // import { useNavigate } from "react-router-dom";
// // import "./navbar.css";

// // const Navbar = ({ onSidebarToggle }) => {
// //   const navigate = useNavigate();

// //   const handleLogout = () => {
// //     localStorage.removeItem("token");
// //     navigate("/", { replace: true });
// //     window.location.reload();
// //   };

// //   return (
// //     <nav className="flex justify-between items-center bg-teal-700 text-white shadow-md px-6 py-4 fixed top-0 left-0 right-0 w-full z-50 h-16">
// //       {/* Sidebar Toggle Button (Visible on Small Screens) */}
// //       <button
// //         onClick={onSidebarToggle}
// //         className="md:hidden p-2 rounded focus:outline-none"
// //       >
// //         <Menu size={24} />
// //       </button>

// //       {/* Title */}
// //       <span
// //         className="text-xl font-bold flex-1 text-center md:text-left ml-4 cursor-pointer"
// //         onClick={() => navigate("/dashboard")}
// //       >
// //         Overhead Management System
// //       </span>

// //       {/* Navigation Buttons */}
// //       <div className="flex gap-4">
// //         <button
// //           onClick={() => navigate("/dashboard")}
// //           className="flex items-center gap-2 bg-teal-600 hover:bg-teal-800 px-4 py-2 rounded"
// //         >
// //           <Home size={18} />
// //           <span>Home</span>
// //         </button>

// //         <button
// //           onClick={() => navigate("/ProjectList")}
// //           className="flex items-center gap-2 bg-teal-600 hover:bg-teal-800 px-4 py-2 rounded"
// //         >
// //           <Folder size={18} />
// //           <span>Projects</span>
// //         </button>

// //         <button
// //           onClick={handleLogout}
// //           className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
// //         >
// //           <LogOut size={18} />
// //           <span>Logout</span>
// //         </button>
// //       </div>
// //     </nav>
// //   );
// // };

// // export default Navbar;

// import React, { useState, useEffect } from "react";
// import { Menu, Home, Folder, LogOut, User } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import "./navbar.css";

// const Navbar = ({ onSidebarToggle }) => {
//   const navigate = useNavigate();
//   const [userDetails, setUserDetails] = useState(null);
//   const [showProfilePopup, setShowProfilePopup] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       try {
//         const decoded = jwtDecode(token);
//         const rawname = decoded.name;
//         const capitalizedName = rawname.toUpperCase();
//         const rawrole = decoded.role;
//         const caprole = rawrole.charAt(0).toUpperCase() + rawrole.slice(1)

//         setUserDetails({
//           name: capitalizedName || "User",
//           email: decoded.email || "",
//           role: caprole || "",
//           employeeId: decoded.employeeId || ""
//         });
//         console.log("navbar decode data", decoded);

//       } catch (error) {
//         console.error("Error decoding token:", error);
//       }
//     }
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/", { replace: true });
//     window.location.reload();
//   };

//   const toggleProfilePopup = () => {
//     setShowProfilePopup(!showProfilePopup);
//   };

//   return (
//     <nav className="flex justify-between items-center bg-teal-700 text-white shadow-md px-6 py-4 fixed top-0 left-0 right-0 w-full z-50 h-16">
//       {/* Left Side - Profile and Sidebar Toggle */}
//       <div className="flex items-center gap-4">
//         {/* Sidebar Toggle Button (Visible on Small Screens) */}
//         <button
//           onClick={onSidebarToggle}
//           className="md:hidden p-2 rounded focus:outline-none"
//         >
//           <Menu size={24} />
//         </button>

//         {/* Profile Icon */}
//         <div className="relative">
//           <button
//             onClick={toggleProfilePopup}
//             className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center hover:bg-teal-800 transition-colors"
//           >
//             <User size={20} />
//           </button>

//           {/* Profile Popup */}
//           {showProfilePopup && userDetails && (
//             <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl z-50 p-5 text-gray-800 border border-gray-200 animate-fade-in">
//               <div className="flex flex-col items-center mb-4">
//                 <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center text-xl font-bold shadow-inner">
//                   <User size={36} />
//                 </div>
//                 <h3 className="mt-2 text-lg font-semibold capitalize">{userDetails.name}</h3>
//                 <p className="text-sm text-gray-500">{userDetails.role}</p>
//               </div>

//               <div className="w-full text-sm border-t border-gray-200 pt-3 space-y-2">
//                 <div className="flex items-center gap-2">
//                   <span className="font-semibold text-gray-700">Email:</span>
//                   <span className="text-gray-600 break-all">{userDetails.email}</span>
//                 </div>
//                 {userDetails.employeeId && (
//                   <div className="flex items-center gap-2">
//                     <span className="font-semibold text-gray-700">Employee ID:</span>
//                     <span className="text-gray-600">{userDetails.employeeId}</span>
//                   </div>
//                 )}
//               </div>

//               <button
//                 onClick={handleLogout}
//                 className="mt-5 w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors text-sm shadow-sm"
//               >
//                 <LogOut size={16} />
//                 <span>Logout</span>
//               </button>
//             </div>
//           )}

//         </div>
//       </div>

//       {/* Title */}
//       <span
//         className="text-xl font-bold flex-1 text-center md:text-left ml-4 cursor-pointer"
//         onClick={() => navigate("/dashboard")}
//       >
//         Overhead Management System
//       </span>

//       {/* Navigation Buttons */}
//       <div className="flex gap-4">
//         <button
//           onClick={() => navigate("/dashboard")}
//           className="flex items-center gap-2 bg-teal-600 hover:bg-teal-800 px-4 py-2 rounded"
//         >
//           <Home size={18} />
//           <span>Home</span>
//         </button>

//         <button
//           onClick={() => navigate("/ProjectList")}
//           className="flex items-center gap-2 bg-teal-600 hover:bg-teal-800 px-4 py-2 rounded"
//         >
//           <Folder size={18} />
//           <span>Projects</span>
//         </button>
//         <button
//           onClick={handleLogout}
//           className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
//         >
//           <LogOut size={18} />
//           <span>Logout</span>
//         </button>

//       </div>
//     </nav>
//   );
// };

// export default Navbar;

import React, { useState, useEffect } from "react";
import { Menu, Home, Folder, LogOut, User, Settings, Key, Edit, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./navbar.css";

const Navbar = ({ onSidebarToggle }) => {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const rawname = decoded.name;
        const capitalizedName = rawname.toUpperCase();
        const rawrole = decoded.role;
        const caprole = rawrole.charAt(0).toUpperCase() + rawrole.slice(1)
        setUserDetails({
          name: capitalizedName || "User",
          email: decoded.email || "",
          role: caprole || "",
          employeeId: decoded.employeeId || "",
          lastLogin: decoded.iat ? new Date(decoded.iat * 1000).toLocaleString() : "Unknown"
        });
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
    window.location.reload();
  };

  const toggleProfilePopup = (e) => {
    e.stopPropagation();
    setShowProfilePopup(!showProfilePopup);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showProfilePopup) {
        setShowProfilePopup(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showProfilePopup]);

  return (
    <nav className="flex justify-between items-center bg-teal-700 text-white shadow-md px-6 py-4 fixed top-0 left-0 right-0 w-full z-50 h-16">
      {/* Left Side - Profile and Sidebar Toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={onSidebarToggle}
          className="md:hidden p-2 rounded focus:outline-none"
        >
          <Menu size={24} />
        </button>

        {/* Profile Icon */}
        <div className="relative">
          <button
            onClick={toggleProfilePopup}
            className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center hover:bg-teal-800 transition-colors relative"
          >
            <User size={20} />
            {showProfilePopup && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-teal-700"></div>
            )}
          </button>

          {/* Enhanced Profile Popup */}
          {showProfilePopup && userDetails && (
            <div
              className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-xl z-50 overflow-hidden border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Profile Header */}
              <div className="bg-teal-600 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{userDetails.name}</h3>
                    <p className="text-teal-100 text-sm">{userDetails.role}</p>
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="p-4 space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="w-24 font-medium">Employee ID:</span>
                  <span>{userDetails.employeeId || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-24 font-medium">Email:</span>
                  <span className="truncate">{userDetails.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-500" />
                  <span>Last login: {userDetails.lastLogin}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-200 p-2 grid grid-cols-2 gap-2">

                <button
                  onClick={handleLogout}
                  className="col-span-2 flex flex-col items-center justify-center text-sm p-2 rounded hover:bg-red-50 text-red-600 text-center"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <span
        className="text-xl font-bold flex-1 text-center md:text-left ml-4 cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        Overhead Management System
      </span>

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-800 px-4 py-2 rounded"
        >
          <Home size={18} />
          <span>Home</span>
        </button>

        <button
          onClick={() => navigate("/ProjectList")}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-800 px-4 py-2 rounded"
        >
          <Folder size={18} />
          <span>Projects</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;