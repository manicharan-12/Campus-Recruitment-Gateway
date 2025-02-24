import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Download, Filter, RefreshCw, RotateCcw } from "lucide-react";
import CustomSelect from "../Global/CustomSelect";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const API_BASE_URL = `${process.env.REACT_APP_SERVER_API_URL}/faculty`;

const FacultyAnalytics = () => {
  const token = Cookies.get("userCookie");
  const [filters, setFilters] = useState({
    degreeProgram: "",
    branch: "",
    section: "",
    graduationYear: "",
  });
  const [isExporting, setIsExporting] = useState(false);

  // TanStack React Query for filters
  const {
    data: filterOptions = {
      degreePrograms: [],
      branches: [],
      sections: [],
      graduationYears: [],
    },
  } = useQuery({
    queryKey: ["analyticsFilters"],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/analytics/filters`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // TanStack React Query for analytics data
  const {
    data: analytics,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["analytics", filters],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({
      degreeProgram: "",
      branch: "",
      section: "",
      graduationYear: "",
    });
  };

  const exportAnalytics = async () => {
    try {
      setIsExporting(true);

      // Get the dashboard content
      const dashboardElement = document.getElementById("analytics-dashboard");

      // Create a new PDF document
      const pdf = new jsPDF("p", "mm", "a4");
      let pdfHeight = 0;

      // Add title with filter information
      pdf.setFontSize(18);
      pdf.setTextColor(60, 70, 182);
      pdf.text("Faculty Analytics Dashboard", 20, 20);

      // Add filter information
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      let filterText = "Filters: ";
      if (filters.degreeProgram)
        filterText += `Degree: ${filters.degreeProgram}, `;
      if (filters.branch) filterText += `Branch: ${filters.branch}, `;
      if (filters.section) filterText += `Section: ${filters.section}, `;
      if (filters.graduationYear)
        filterText += `Year: ${filters.graduationYear}, `;
      if (filterText === "Filters: ") filterText += "None (All Data)";
      else filterText = filterText.slice(0, -2); // Remove the last comma

      pdf.text(filterText, 20, 30);
      pdfHeight = 40; // Start after the header

      // Get all chart containers
      const chartContainers =
        dashboardElement.querySelectorAll(".chart-container");

      // Process each chart container
      for (let i = 0; i < chartContainers.length; i++) {
        const canvas = await html2canvas(chartContainers[i], {
          scale: 2, // Higher resolution
          logging: false,
          useCORS: true,
          allowTaint: true,
        });

        // Convert to image
        const imgData = canvas.toDataURL("image/png");

        // Check if we need a new page
        if (pdfHeight + 70 > 277) {
          // A4 height is about 297mm, leave some margin
          pdf.addPage();
          pdfHeight = 20;
        }

        // Add chart title
        const title =
          chartContainers[i].querySelector("h2")?.textContent ||
          `Chart ${i + 1}`;
        pdf.setFontSize(14);
        pdf.setTextColor(50, 50, 50);
        pdf.text(title, 20, pdfHeight);

        // Add the chart image (scaled to fit the page width)
        const imgWidth = 170; // A4 width is 210mm, leave margins
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 20, pdfHeight + 5, imgWidth, imgHeight);

        // Move position for next chart
        pdfHeight += imgHeight + 20;
      }

      // Add summary statistics
      if (analytics) {
        const totalStudents = Object.values(analytics.placementStats).reduce(
          (sum, stat) => sum + (stat.totalStudents || 0),
          0
        );

        const totalPlaced = Object.values(analytics.placementStats).reduce(
          (sum, stat) => sum + (stat.placedStudents || 0),
          0
        );

        const placementRate =
          totalStudents > 0
            ? ((totalPlaced / totalStudents) * 100).toFixed(1)
            : "0.0";

        const avgPackage =
          Object.values(analytics.placementStats).length > 0
            ? (
                Object.values(analytics.placementStats).reduce(
                  (sum, stat) => sum + (stat.medianPackage || 0),
                  0
                ) / Object.values(analytics.placementStats).length
              ).toFixed(1)
            : "0.0";

        pdf.setFontSize(14);
        pdf.setTextColor(50, 50, 50);
        pdf.text("Summary Statistics", 20, pdfHeight + 5);

        pdf.setFontSize(12);
        pdf.text(`Total Students: ${totalStudents}`, 20, pdfHeight + 15);
        pdf.text(`Placement Rate: ${placementRate}%`, 20, pdfHeight + 25);
        pdf.text(`Average Package: ₹${avgPackage} LPA`, 20, pdfHeight + 35);
      }

      // Save the PDF
      pdf.save(
        `faculty-analytics${
          filters.degreeProgram ? "-" + filters.degreeProgram : ""
        }${filters.graduationYear ? "-" + filters.graduationYear : ""}.pdf`
      );
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export analytics. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <motion.div
          className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>
    );
  }

  // Return early with a loading state if analytics data isn't ready
  if (!analytics) return null;

  // Ensure all required objects exist with default values
  const safeAnalytics = {
    placementStats: analytics.placementStats || {},
    cgpaRanges: analytics.cgpaRanges || {},
    companyStats: analytics.companyStats || {},
    roleStats: analytics.roleStats || {},
    backlogStats: analytics.backlogStats || { noBacklogs: 0, withBacklogs: 0 },
    backlogDistribution: analytics.backlogStats?.backlogDistribution || {},
    industryStats: analytics.industryStats || {},
    internshipStats: analytics.internshipStats || {},
  };

  // Format data for charts - with null checks
  const placementTrends = Object.entries(safeAnalytics.placementStats)
    .sort(([yearA], [yearB]) => Number(yearA) - Number(yearB))
    .map(([year, stats]) => ({
      year: year,
      placed: stats.placedStudents || 0,
      total: stats.totalStudents || 0,
      rate: stats.totalStudents
        ? ((stats.placedStudents / stats.totalStudents) * 100).toFixed(1)
        : "0.0",
    }));

  const cgpaData = Object.entries(safeAnalytics.cgpaRanges)
    .sort(([rangeA], [rangeB]) => {
      // Sort CGPA ranges numerically
      const numA = parseFloat(rangeA.split("-")[0]) || 0;
      const numB = parseFloat(rangeB.split("-")[0]) || 0;
      return numA - numB;
    })
    .map(([range, count]) => ({
      range: range,
      count: count || 0,
    }));

  const companyData = Object.entries(safeAnalytics.companyStats)
    .sort(([, a], [, b]) => b - a)
    .map(([company, count]) => ({ company, count: count || 0 }))
    .slice(0, 10);

  const roleData = Object.entries(safeAnalytics.roleStats)
    .sort(([, a], [, b]) => b - a)
    .map(([role, count]) => ({ role, count: count || 0 }))
    .slice(0, 8); // Limit to top 8 roles for better visualization

  const backlogData = [
    { name: "No Backlogs", value: safeAnalytics.backlogStats.noBacklogs || 0 },
    {
      name: "With Backlogs",
      value: safeAnalytics.backlogStats.withBacklogs || 0,
    },
  ];

  const backlogDistributionData = Object.entries(
    safeAnalytics.backlogDistribution || {}
  ).map(([backlogCount, studentCount]) => ({
    backlogCount: backlogCount,
    studentCount: studentCount || 0,
  }));

  // Calculate averages safely
  const placementStatsValues = Object.values(safeAnalytics.placementStats);
  const averagePackage =
    placementStatsValues.length > 0
      ? placementStatsValues.reduce(
          (sum, stat) => sum + (stat.medianPackage || 0),
          0
        ) / placementStatsValues.length
      : 0;

  const maxPackage =
    placementStatsValues.length > 0
      ? Math.max(
          ...placementStatsValues.map((stats) => stats.highestPackage || 0)
        )
      : 0;

  const COLORS = ["#10B981", "#EF4444", "#3B82F6", "#F59E0B", "#8B5CF6"];

  const degreeProgramOptions = [
    { value: "", label: "All Degree Programs" },
    ...filterOptions.degreePrograms.map((program) => ({
      value: program,
      label: program,
    })),
  ];

  const branchOptions = [
    { value: "", label: "All Branches" },
    ...filterOptions.branches.map((branch) => ({
      value: branch,
      label: branch,
    })),
  ];

  const sectionOptions = [
    { value: "", label: "All Sections" },
    ...filterOptions.sections.map((section) => ({
      value: section,
      label: section,
    })),
  ];

  const graduationYearOptions = [
    { value: "", label: "All Graduation Years" },
    ...filterOptions.graduationYears.map((year) => ({
      value: year.toString(),
      label: year.toString(),
    })),
  ];

  const selectedDegreeProgram = degreeProgramOptions.find(
    (option) => option.value === filters.degreeProgram
  );

  const selectedBranch = branchOptions.find(
    (option) => option.value === filters.branch
  );

  const selectedSection = sectionOptions.find(
    (option) => option.value === filters.section
  );

  const selectedGraduationYear = graduationYearOptions.find(
    (option) => option.value === filters.graduationYear
  );

  // Calculate total students safely
  const totalStudents = placementStatsValues.reduce(
    (sum, stat) => sum + (stat.totalStudents || 0),
    0
  );

  // Calculate placement rate safely
  const totalPlaced = placementStatsValues.reduce(
    (sum, stat) => sum + (stat.placedStudents || 0),
    0
  );

  const placementRate =
    totalStudents > 0
      ? ((totalPlaced / totalStudents) * 100).toFixed(1)
      : "0.0";

  return (
    <motion.div
      id="analytics-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-100 p-4 md:p-8"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8 flex flex-col md:flex-row justify-between items-center"
      >
        <h1 className="text-3xl font-bold text-indigo-800 mb-4 md:mb-0">
          Faculty Analytics Dashboard
        </h1>
        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refetch}
            className="flex items-center px-4 py-2 bg-white text-indigo-600 rounded-md border border-indigo-200 hover:bg-indigo-50 transition duration-300 ease-in-out"
            disabled={isExporting}
          >
            <RefreshCw size={18} className="mr-2" />
            Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportAnalytics}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 ease-in-out"
            disabled={isExporting}
          >
            <Download size={18} className="mr-2" />
            {isExporting ? "Exporting..." : "Export PDF"}
          </motion.button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow-md p-6 mb-8"
      >
        <div className="flex items-center mb-4">
          <Filter size={24} className="text-indigo-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">
            Analytics Filters
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CustomSelect
            options={degreeProgramOptions}
            value={selectedDegreeProgram}
            onChange={(option) =>
              handleFilterChange("degreeProgram", option.value)
            }
            placeholder="Select Degree Program"
          />
          <CustomSelect
            options={branchOptions}
            value={selectedBranch}
            onChange={(option) => handleFilterChange("branch", option.value)}
            placeholder="Select Branch"
          />
          <CustomSelect
            options={sectionOptions}
            value={selectedSection}
            onChange={(option) => handleFilterChange("section", option.value)}
            placeholder="Select Section"
          />
          <CustomSelect
            options={graduationYearOptions}
            value={selectedGraduationYear}
            onChange={(option) =>
              handleFilterChange("graduationYear", option.value)
            }
            placeholder="Select Graduation Year"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetFilters}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 ease-in-out"
            disabled={isExporting}
          >
            <RotateCcw size={18} className="mr-2" />
            Reset Filters
          </motion.button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Summary Cards - Keep these spanning full width */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <SummaryCard
            title="Total Students"
            value={totalStudents}
            description="Across all academic years"
          />
          <SummaryCard
            title="Placement Rate"
            value={`${placementRate}%`}
            description="Overall placement percentage"
          />
          <SummaryCard
            title="Average Package"
            value={`₹${averagePackage.toFixed(1)} LPA`}
            description="Median package across years"
          />
        </motion.div>

        {/* Placement Trends - Keep this spanning full width */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="col-span-1 md:col-span-2 bg-white rounded-lg shadow-md p-6 chart-container"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Placement Trends Over Years
          </h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={placementTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" padding={{ left: 20, right: 20 }} />
                <YAxis
                  yAxisId="left"
                  domain={[0, "auto"]}
                  allowDecimals={false}
                  label={{
                    value: "Students",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  label={{
                    value: "Placement Rate %",
                    angle: 90,
                    position: "insideRight",
                  }}
                />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "rate") return [`${value}%`, "Placement Rate"];
                    return [
                      value,
                      name === "placed" ? "Placed Students" : "Total Students",
                    ];
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="placed"
                  stroke="#4F46E5"
                  name="Placed Students"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="total"
                  stroke="#10B981"
                  name="Total Students"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="rate"
                  stroke="#F59E0B"
                  name="Placement Rate %"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* CGPA Distribution - Now each chart takes up 1 column in a 2-column grid */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1 }}
          className="bg-white rounded-lg shadow-md p-6 chart-container"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            CGPA Distribution
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={cgpaData}
                margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="range"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  interval={0}
                />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#4F46E5"
                  name="Number of Students"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Backlog Statistics */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="bg-white rounded-lg shadow-md p-6 chart-container"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Backlog Distribution
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={backlogData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(1)}%`
                  }
                >
                  {backlogData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Students"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Role Distribution */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Role-wise Placement Distribution
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleData.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="role"
                  width={150}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  name="Number of Offers"
                  fill="#4F46E5"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Recruiting Companies */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Top Recruiting Companies
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="company" width={120} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#4F46E5"
                  name="Number of Offers"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Performance Metrics Comparison */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="col-span-1 md:col-span-2 bg-white rounded-lg shadow-md p-6 chart-container"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Performance Metrics Comparison
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                outerRadius={90}
                data={[
                  {
                    metric: "Placement Rate",
                    value: Math.min(100, Number.parseInt(placementRate) || 0),
                  },
                  {
                    metric: "No Backlogs %",
                    value: Math.min(
                      100,
                      Number.parseInt(
                        (
                          (safeAnalytics.backlogStats.noBacklogs /
                            Math.max(
                              1,
                              safeAnalytics.backlogStats.noBacklogs +
                                safeAnalytics.backlogStats.withBacklogs
                            )) *
                          100
                        ).toFixed(0)
                      ) || 0
                    ),
                  },
                  {
                    metric: "High CGPA (>8.5)",
                    value: Math.min(
                      100,
                      (safeAnalytics.cgpaRanges["8.5-9.0"] || 0) +
                        (safeAnalytics.cgpaRanges["9.0-9.5"] || 0) +
                        (safeAnalytics.cgpaRanges["9.5-10.0"] || 0)
                    ),
                  },
                  {
                    metric: "Multiple Offers",
                    value: Math.min(
                      100,
                      Math.max(
                        0,
                        Object.values(safeAnalytics.companyStats).reduce(
                          (sum, value) => sum + (value || 0),
                          0
                        ) -
                          placementStatsValues.reduce(
                            (sum, stat) => sum + (stat.placedStudents || 0),
                            0
                          )
                      )
                    ),
                  },
                ]}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Package Statistics */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2 }}
        className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {Object.entries(safeAnalytics.placementStats).map(([year, stats]) => (
          <div key={year} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-indigo-700">
              {year} Package Statistics
            </h2>
            <div className="space-y-4">
              <PackageStatItem
                label="Highest Package"
                value={stats.highestPackage || 0}
                maxValue={maxPackage || 1}
                color="green"
              />
              <PackageStatItem
                label="Median Package"
                value={stats.medianPackage || 0}
                maxValue={maxPackage || 1}
                color="blue"
              />
              <PackageStatItem
                label="Lowest Package"
                value={stats.lowestPackage || 0}
                maxValue={maxPackage || 1}
                color="indigo"
              />
              <div className="mt-2 pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Placement Rate:</span>
                  <span className="font-semibold text-indigo-600">
                    {stats.totalStudents
                      ? (
                          ((stats.placedStudents || 0) / stats.totalStudents) *
                          100
                        ).toFixed(1)
                      : "0.0"}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
};

const SummaryCard = ({ title, value, description }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-white rounded-lg shadow-md p-6"
  >
    <div className="text-gray-500 mb-2">{title}</div>
    <div className="text-3xl font-bold text-indigo-600">{value}</div>
    <div className="mt-2 text-sm text-gray-500">{description}</div>
  </motion.div>
);

const PackageStatItem = ({ label, value, maxValue, color }) => (
  <div>
    <div className="text-sm text-gray-500 mb-1">{label}</div>
    <div className="flex justify-between items-center">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (value / maxValue) * 100)}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`bg-${color}-500 h-2.5 rounded-full`}
        ></motion.div>
      </div>
      <span className={`ml-4 font-semibold text-${color}-600`}>
        ₹{value.toLocaleString()} LPA
      </span>
    </div>
  </div>
);

export default FacultyAnalytics;
