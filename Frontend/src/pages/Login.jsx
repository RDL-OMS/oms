import React, { useState } from "react";
import './pages.css'
import log from "../assets/log.jpg";
import bgImage from "../assets/logbg.jpg";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Logged in with Email: ${email}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-900 to-black relative">
      {/* Background image and overlay */}
      <div
  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
  style={{ backgroundImage: `url(${bgImage})` }}
></div>
      <div className="relative flex flex-col md:flex-row items-center bg-white shadow-2xl rounded-lg p-8 md:p-12">
        {/* Left Side - Illustration */}
        <div className="hidden md:block w-80">
        <img src={log} alt="Login Illustration" className="rounded-lg w-120 h-80 object-cover" />

        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-96 px-6">
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Login</h2>
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

            <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-900 text-white py-2 rounded-md hover:from-blue-600 hover:to-blue-800">
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
