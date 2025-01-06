import React from "react";
import { AlertOctagon } from "lucide-react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const ErrorOverlay = ({ statusCode }) => {
  const navigate = useNavigate();

  const onClickLogin = () => {
    try {
      Cookies.remove("userCookie");
      navigate("/login/student");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-[100000]">
      <div className="text-center space-y-4">
        <AlertOctagon className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Authentication Error</h2>
        <p className="text-gray-300">Status Code: {statusCode}</p>
        <p className="text-gray-300">
          Your session has expired or you're not authorized to access this
          resource.
        </p>
        <button
          onClick={onClickLogin}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
};

export default ErrorOverlay;
