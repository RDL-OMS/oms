

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./pages.css";
// import log from "../assets/log.jpg";
// import bgImage from "../assets/logbg.jpg";
// import { jwtDecode } from "jwt-decode"; 


// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setMessage("");

//     try {
//       const response = await fetch("http://localhost:5000/api/auth/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();
//       // console.log("token",data.token);
//       // if (data.token) {
//       //   const decoded = jwtDecode(data.token);
//       //   console.log("Role:", decoded.role);
//       // }
      

//       if (response.ok) {
//         setMessage("✅ Login successful! Redirecting...");
//         localStorage.setItem("token", data.token);
//         setTimeout(() => {
//           setMessage("");
//           navigate("/dashboard");
//         }, 2000);
//       } else {
//         setError("❌ Invalid credentials. Please try again.");
//         setTimeout(() => setError(""), 2000);
//       }
//     } catch (err) {
//       setError("⚠️ Server error. Please try again later.");
//       setTimeout(() => setError(""), 2000);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-900 to-black relative">
//       <div
//         className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
//         style={{ backgroundImage: `url(${bgImage})` }}
//       ></div>
//       <div className="relative flex flex-col md:flex-row items-center bg-white shadow-2xl rounded-lg p-8 md:p-12">
//         <div className="hidden md:block w-80">
//           <img
//             src={log}
//             alt="Login Illustration"
//             className="rounded-lg w-150 h-150 object-cover"
//           />
//         </div>
//         <div className="w-full md:w-96 px-6">
//           <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Login</h2>
//           {message && <div className="text-green-600 text-center font-semibold bg-green-200 p-2 rounded-md mb-2">{message}</div>}
//           {error && <div className="text-red-500 text-center font-semibold bg-red-200 p-2 rounded-md mb-2">{error}</div>}
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
//             <button
//               type="submit"
//               className="w-full bg-gradient-to-r from-blue-500 to-blue-900 text-white py-2 rounded-md hover:from-blue-600 hover:to-blue-800"
//             >
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
import { useAuth } from "../context/AuthContext";
import "./pages.css";
import log from "../assets/log.jpg";
import bgImage from "../assets/logbg.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      if (!data.token) {
        throw new Error("No authentication token received");
      }

      setMessage("✅ Login successful! Redirecting...");
      
      // Store token and update auth state
      localStorage.setItem("token", data.token);
      await login(data.token); // Ensure this updates the auth context
      
      // Immediate redirect without setTimeout
      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "⚠️ Server error. Please try again later.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-900 to-black relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>
      
      <div className="relative flex flex-col md:flex-row items-center bg-white shadow-2xl rounded-lg p-8 md:p-12 mx-4">
        <div className="hidden md:block w-80">
          <img
            src={log}
            alt="Login Illustration"
            className="rounded-lg w-full h-auto object-cover"
          />
        </div>
        
        <div className="w-full md:w-96 px-6">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Login</h2>
          
          {message && (
            <div className="text-green-600 text-center font-semibold bg-green-100 p-2 rounded-md mb-4">
              {message}
            </div>
          )}
          
          {error && (
            <div className="text-red-500 text-center font-semibold bg-red-100 p-2 rounded-md mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-gray-600">
                <input 
                  type="checkbox" 
                  className="mr-2 rounded text-blue-500 focus:ring-blue-500" 
                />
                Remember me
              </label>
              <a href="#" className="text-sm text-blue-500 hover:underline">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 rounded-md hover:from-blue-600 hover:to-blue-800 transition-colors ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : "LOGIN"}
            </button>

            <p className="text-center text-gray-600 text-sm">
              Don't have an account?{" "}
              <a href="#" className="text-blue-500 hover:underline font-medium">
                Sign up
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;