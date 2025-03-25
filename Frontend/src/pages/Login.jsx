

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom"; // Import useNavigate
// import "./pages.css";
// import log from "../assets/log.jpg";
// import bgImage from "../assets/logbg.jpg";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate(); // Initialize navigate function

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     try {
//       const response = await fetch("http://localhost:5000/api/auth/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert("Login successful!");
//         // Store token if required: 
//         console.log("token",data.token);////debugg
//         localStorage.setItem("token", data.token);
//         navigate("/dashboard"); // Redirect to Dashboard
//       } else {
//         setError(data.message || "Invalid credentials");
//       }
//     } catch (err) {
//       setError("Server error. Please try again later.");
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-900 to-black relative">
//       <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40" style={{ backgroundImage: `url(${bgImage})` }}></div>
//       <div className="relative flex flex-col md:flex-row items-center bg-white shadow-2xl rounded-lg p-8 md:p-12">
//         <div className="hidden md:block w-80">
//           <img src={log} alt="Login Illustration" className="rounded-lg w-150 h-150 object-cover" />
//         </div>
//         <div className="w-full md:w-96 px-6">
//           <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Login</h2>
//           {error && <p className="text-red-500 text-center">{error}</p>}
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <input
//               type="email"
//               placeholder="Username"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//             <div className="flex justify-between text-sm text-gray-600">
//               <label>
//                 <input type="checkbox" className="mr-2" /> Remember me
//               </label>
//               <a href="#" className="text-blue-500 hover:underline">Forgot Password?</a>
//             </div>
//             <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-900 text-white py-2 rounded-md hover:from-blue-600 hover:to-blue-800">
//               LOGIN
//             </button>
//             <p className="text-center text-gray-600">
//               New Here? <a href="#" className="text-blue-500 hover:underline">Sign Up</a>
//             </p>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./pages.css";
import log from "../assets/log.jpg";
import bgImage from "../assets/logbg.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Login successful! Redirecting...");
        localStorage.setItem("token", data.token);
        setTimeout(() => {
          setMessage("");
          navigate("/dashboard");
        }, 2000);
      } else {
        setError("❌ Invalid credentials. Please try again.");
        setTimeout(() => setError(""), 2000);
      }
    } catch (err) {
      setError("⚠️ Server error. Please try again later.");
      setTimeout(() => setError(""), 2000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-900 to-black relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>
      <div className="relative flex flex-col md:flex-row items-center bg-white shadow-2xl rounded-lg p-8 md:p-12">
        <div className="hidden md:block w-80">
          <img
            src={log}
            alt="Login Illustration"
            className="rounded-lg w-150 h-150 object-cover"
          />
        </div>
        <div className="w-full md:w-96 px-6">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Login</h2>
          {message && <div className="text-green-600 text-center font-semibold bg-green-200 p-2 rounded-md mb-2">{message}</div>}
          {error && <div className="text-red-500 text-center font-semibold bg-red-200 p-2 rounded-md mb-2">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <label>
                <input type="checkbox" className="mr-2" /> Remember me
              </label>
              <a href="#" className="text-blue-500 hover:underline">Forgot Password?</a>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-900 text-white py-2 rounded-md hover:from-blue-600 hover:to-blue-800"
            >
              LOGIN
            </button>
            <p className="text-center text-gray-600">
              New Here? <a href="#" className="text-blue-500 hover:underline">Sign Up</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;