import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { getDecodedToken, getUserId } from "../../utils/auth";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ErrorOverlay from "../Global/ErrorOverlay";
import LoadingOverlay from "../Global/LoadingOverlay";
import Cookies from "js-cookie";

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const jwtToken = Cookies.get("userCookie");

  // Sample insights data for faculty
  const insights = {
    totalStudents: 150,
    activeAssignments: 8,
    averageScore: 85,
    submissionRate: 92,
    upcomingDeadlines: 3,
    courseAttendance: 88,
  };

  // Sample data for student performance trend
  const performanceData = [
    { month: "Jan", averageScore: 82, submissionRate: 88 },
    { month: "Feb", averageScore: 85, submissionRate: 90 },
    { month: "Mar", averageScore: 83, submissionRate: 87 },
    { month: "Apr", averageScore: 88, submissionRate: 92 },
    { month: "May", averageScore: 86, submissionRate: 89 },
    { month: "Jun", averageScore: 89, submissionRate: 93 },
  ];

  const fetchDashboardData = async () => {
    const response = await axios.get(
      `${process.env.REACT_APP_SERVER_API_URL}/faculty/dashboard`,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
    return response.data;
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["faculty", "dashboard"],
    queryFn: fetchDashboardData,
    staleTime: 5 * 60 * 1000,
    enabled: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: false,
    refetchInterval: 5000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const handleUniversityProfile = () => {
    navigate(`/university/${university._id}`);
  };

  if (isLoading) return <LoadingOverlay />;

  if (!data) {
    return <ErrorOverlay statusCode={404} message="No data available" />;
  }

  if (isError) {
    console.error(error);
    if (error?.response?.status === 401)
      return <ErrorOverlay statusCode={401} />;
  }

  const { university, faculty } = data;

  if (!university || !faculty) {
    return <ErrorOverlay statusCode={404} message="Missing required data" />;
  }

  return (
    <div className="p-8 space-y-8 pt-4 bg-gray-50">
      {/* Greeting Header */}
      <div className="bg-indigo-600 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center">
          {getGreeting()}, {faculty.name}
        </h1>
      </div>

      {/* University Profile Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center">
              <img
                src={university.logo}
                alt={university.name}
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {university.name}
              </h2>
              <a
                href={university.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-700 text-sm"
              >
                {university.website}
              </a>
            </div>
          </div>
          <button
            onClick={handleUniversityProfile}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold 
                     hover:bg-indigo-700 transition-colors duration-200 shadow-md
                     flex items-center space-x-2"
          >
            <span>View University Profile</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(insights).map(([key, value]) => (
          <div
            key={key}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-medium text-gray-500 capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {value}
              {key.includes("Rate") || key.includes("Attendance") ? "%" : ""}
            </p>
          </div>
        ))}
      </div>

      {/* Performance Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Student Performance Trends
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="averageScore"
                stroke="#4f46e5"
                name="Average Score"
              />
              <Line
                type="monotone"
                dataKey="submissionRate"
                stroke="#06b6d4"
                name="Submission Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Upcoming Deadlines
        </h2>
        <div className="space-y-4">
          <div className="border-l-4 border-indigo-600 pl-4 py-2">
            <p className="font-semibold">Research Project Submission</p>
            <p className="text-gray-600">Due in 2 days</p>
          </div>
          <div className="border-l-4 border-indigo-600 pl-4 py-2">
            <p className="font-semibold">Mid-term Exam</p>
            <p className="text-gray-600">Due in 5 days</p>
          </div>
          <div className="border-l-4 border-indigo-600 pl-4 py-2">
            <p className="font-semibold">Lab Report Submission</p>
            <p className="text-gray-600">Due in 1 week</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
