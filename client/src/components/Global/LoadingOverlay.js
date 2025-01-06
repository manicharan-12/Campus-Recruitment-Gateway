import React from "react";
import { Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";

const LoadingOverlay = () => {
  const location = useLocation();
  const isDashboard = location.pathname.includes("/dashboard");

  return (
    <div
      className={`flex items-center justify-center bg-white-900 z-[100000] w-full
      ${isDashboard ? "min-h-[calc(100vh-4rem)]" : "fixed inset-0"}`}
    >
      <div className="text-center space-y-4">
        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
        <p className="text-xl font-medium text-white">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
