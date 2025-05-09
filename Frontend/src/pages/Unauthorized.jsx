// src/pages/Unauthorized.jsx
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">403 - Unauthorized</h1>
        <p className="text-gray-700 mb-6">
          You don't have permission to access this page.
        </p>
        <Link
          to="/login"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Return to Login
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;