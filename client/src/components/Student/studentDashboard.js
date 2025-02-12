import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ErrorOverlay from "../Global/ErrorOverlay";
import LoadingOverlay from "../Global/LoadingOverlay";
import Cookies from "js-cookie";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const jwtToken = Cookies.get("userCookie");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["student","get" ,"dashboard"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_API_URL}/student/get/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${jwtToken}`,
              "Content-Type": "application/json",
              Accept: "*/*",
            },
          }
        );
        console.log(response);
        return response.data;
      } catch (error) {
        console.error(error);
        if (error.response) {
          if (error.response.status === 300 && error.response.data.redirect) {
            navigate(error.response.data.redirect);
            return null;
          }
          if (error.response.status === 401) {
            throw new Error("Unauthorized access");
          }
          throw new Error(error.response.data.error || "An error occurred");
        }
        throw error;
      }
    },
    retry: false,
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (isLoading) return <LoadingOverlay />;

  if (isError) {
    if (error.message === "Unauthorized access") {
      return <ErrorOverlay statusCode={401} />;
    }
    return <ErrorOverlay message={error.message} />;
  }

  return (
    <div className="p-8 space-y-8 pt-4 bg-gray-50">
      <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center">
          {getGreeting()}, Jhon Doe
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
              <img src="" alt="" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Anurag</h2>
              <p className="text-gray-600">Student ID: '21eg112b31</p>
            </div>
          </div>
          <div className="bg-blue-100 px-4 py-2 rounded-full">
            <span className="text-blue-800 font-medium">Semester</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
