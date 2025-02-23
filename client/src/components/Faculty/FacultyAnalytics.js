import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Trash2, Save, Play, Plus, X } from "lucide-react";
import { TbTable } from "react-icons/tb";
import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = `${process.env.REACT_APP_SERVER_API_URL}/faculty`;


// Field options for analysis
const FIELD_OPTIONS = [
  { value: "personal.gender", label: "Gender", group: "personal" },
  { value: "academic.cgpa", label: "CGPA", group: "academic" },
  { value: "academic.backlogs", label: "Backlogs", group: "academic" },
  {
    value: "placement.isPlaced",
    label: "Placement Status",
    group: "placement",
  },
  { value: "academic.branch", label: "Branch", group: "academic" },
  {
    value: "academic.degreeProgram",
    label: "Degree Program",
    group: "academic",
  },
];

const FacultyAnalytics = () => {
  const queryClient = useQueryClient();
  const [selectedFields, setSelectedFields] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  const { register, control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      filters: {
        degreeProgram: "",
        branch: "",
      },
    },
  });

  // Get auth token from localStorage
  const getAuthHeader = () => ({
    headers: {
      Authorization: `Bearer ${Cookies.get("userCookie")}`,
    },
  });

  // Fetch saved analyses
  const {
    data: savedAnalyses,
    isLoading: loadingSaved,
    error,
    isError,
  } = useQuery({
    queryKey: ["savedAnalyses"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${API_BASE_URL}/analysis`,
        getAuthHeader()
      );
      return data.analyses;
    },
  });
  if (isError) {
    console.error(error);
  }

  // Create new analysis mutation
  const createMutation = useMutation({
    mutationFn: async (analysisData) => {
      const { data } = await axios.post(
        `${API_BASE_URL}/analysis`,
        analysisData,
        getAuthHeader()
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["savedAnalyses"]);
      reset();
      setSelectedFields([]);
    },
  });

  // Run analysis mutation
  const runMutation = useMutation({
    mutationFn: async (analysisData) => {
      const { data } = await axios.post(
        `${API_BASE_URL}/analysis/run`,
        analysisData,
        getAuthHeader()
      );
      return data;
    },
  });

  // Delete analysis mutation
  const deleteMutation = useMutation({
    mutationFn: async (analysisId) => {
      await axios.delete(
        `${API_BASE_URL}/analysis/${analysisId}`,
        getAuthHeader()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["savedAnalyses"]);
    },
  });

  const onSubmit = (formData) => {
    if (selectedFields.length < 2) {
      alert("Please select at least 2 fields for analysis");
      return;
    }

    const analysisData = {
      ...formData,
      parameters: selectedFields.map((field) => ({
        field: field.label,
        path: field.value,
      })),
    };

    createMutation.mutate(analysisData);
  };

  const runAnalysis = (analysis = null) => {
    const analysisData = analysis || {
      parameters: selectedFields.map((field) => ({
        field: field.label,
        path: field.value,
      })),
      filters: {},
    };

    runMutation.mutate(analysisData, {
      onSuccess: (data) => {
        setCurrentAnalysis(data.results);
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6 mb-8"
      >
        <h2 className="text-2xl font-bold mb-6">Dynamic Analysis</h2>

        {/* Analysis Creation Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Analysis Name
              </label>
              <input
                {...register("name", { required: true })}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter analysis name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Select Fields
              </label>
              <Controller
                name="fields"
                control={control}
                render={({ field }) => (
                  <Select
                    isMulti
                    options={FIELD_OPTIONS}
                    value={selectedFields}
                    onChange={(selected) => {
                      setSelectedFields(selected);
                      field.onChange(selected);
                    }}
                    className="w-full"
                    placeholder="Select fields for analysis"
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Degree Program
              </label>
              <input
                {...register("filters.degreeProgram")}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter degree program"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Branch</label>
              <input
                {...register("filters.branch")}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter branch"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={createMutation.isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Analysis
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => runAnalysis()}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              disabled={runMutation.isLoading}
            >
              <Play className="w-4 h-4 mr-2" />
              Run Analysis
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Analysis Results */}
      <AnimatePresence>
        {currentAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-lg shadow-lg p-6 mb-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Analysis Results</h3>
              <button
                onClick={() => setCurrentAnalysis(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {selectedFields.map((field) => (
                      <th
                        key={field.value}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {field.label}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentAnalysis.map((result, idx) => (
                    <tr key={idx}>
                      {selectedFields.map((field) => (
                        <td
                          key={field.value}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          {result._id[field.field]}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {result.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Analyses */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <h3 className="text-xl font-bold mb-4">Saved Analyses</h3>

        {loadingSaved ? (
          <div className="text-center py-4">Loading saved analyses...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedAnalyses?.map((analysis) => (
              <motion.div
                key={analysis._id}
                whileHover={{ scale: 1.02 }}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{analysis.name}</h4>
                  <button
                    onClick={() => deleteMutation.mutate(analysis._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-sm text-gray-500 mb-2">
                  Fields: {analysis.parameters.map((p) => p.field).join(", ")}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => runAnalysis(analysis)}
                    className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Run
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default FacultyAnalytics;

// import React, { useState } from "react";
// import { useForm, Controller } from "react-hook-form";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   BarChart,
//   LineChart,
//   PieChart,
//   ResponsiveContainer,
//   Bar,
//   Line,
//   Pie,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   CartesianGrid,
// } from "recharts";
// import { Download, Save, Trash2, Edit2, Eye, X } from "lucide-react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import CustomSelect from "../Global/CustomSelect";
// import axios from "axios";
// import Cookies from "js-cookie";

// const api = axios.create({
//   baseURL: `${process.env.REACT_APP_SERVER_API_URL}/faculty`,
//   headers: { "Content-Type": "application/json" },
// });

// api.interceptors.request.use((config) => {
//   const token = Cookies.get("userCookie");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// const FacultyAnalytics = () => {
//   const queryClient = useQueryClient();
//   const [selectedAnalytic, setSelectedAnalytic] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const { control, handleSubmit, reset } = useForm();
//   const [dismissedError, setDismissedError] = useState(false);

//   const fieldOptions = [
//     { value: "academic.cgpa", label: "CGPA" },
//     { value: "academic.backlogs", label: "Backlogs" },
//     { value: "placement.isPlaced", label: "Placement Status" },
//     { value: "academic.branch", label: "Branch" },
//     { value: "personal.gender", label: "Gender" },
//     { value: "placement.offers.ctc", label: "CTC" },
//   ];

//   const chartTypes = [
//     { value: "bar", label: "Bar Chart" },
//     { value: "pie", label: "Pie Chart" },
//     { value: "line", label: "Line Chart" },
//     { value: "table", label: "Table" },
//   ];

//   const aggregationTypes = [
//     { value: "count", label: "Count" },
//     { value: "average", label: "Average" },
//     { value: "sum", label: "Sum" },
//     { value: "min", label: "Minimum" },
//     { value: "max", label: "Maximum" },
//   ];

//   // Queries
//   const { data: savedAnalytics = [], error: fetchError } = useQuery({
//     queryKey: ["analytics"],
//     queryFn: async () => {
//       const { data } = await api.get("/analytics/configurations");
//       return data;
//     },
//   });

//   const { data: analyticsData, error: dataError } = useQuery({
//     queryKey: ["analyticsData", selectedAnalytic?._id],
//     queryFn: async () => {
//       if (!selectedAnalytic) return null;
//       const { data } = await api.get(`/analytics/data/${selectedAnalytic._id}`);
//       return data;
//     },
//     enabled: !!selectedAnalytic,
//   });

//   // Mutations
//   const createUpdateMutation = useMutation({
//     mutationFn: async (data) => {
//       const url = isEditing
//         ? `/analytics/configurations/${selectedAnalytic._id}`
//         : "/analytics/configurations";
//       const method = isEditing ? "put" : "post";

//       const { data: responseData } = await api[method](url, {
//         name: data.name,
//         configuration: {
//           type: data.type,
//           dataSource: {
//             field: data.dataSource.field,
//             aggregation: data.dataSource.aggregation,
//           },
//           filters: data.filters || [],
//         },
//       });
//       return responseData;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["analytics"] });
//       reset();
//       setIsEditing(false);
//       setSelectedAnalytic(null);
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: async (id) => {
//       await api.delete(`/analytics/configurations/${id}`);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["analytics"] });
//     },
//   });

//   const renderChart = () => {
//     if (!analyticsData || !selectedAnalytic) return null;

//     const chartProps = {
//       data: analyticsData,
//       margin: { top: 20, right: 30, left: 20, bottom: 5 },
//     };

//     switch (selectedAnalytic.configuration.type) {
//       case "bar":
//         return (
//           <ResponsiveContainer width="100%" height={400}>
//             <BarChart {...chartProps}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="_id" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Bar dataKey="value" fill="#6366F1" />
//             </BarChart>
//           </ResponsiveContainer>
//         );
//       case "line":
//         return (
//           <ResponsiveContainer width="100%" height={400}>
//             <LineChart {...chartProps}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="_id" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Line type="monotone" dataKey="value" stroke="#6366F1" />
//             </LineChart>
//           </ResponsiveContainer>
//         );
//       case "pie":
//         return (
//           <ResponsiveContainer width="100%" height={400}>
//             <PieChart>
//               <Pie
//                 data={analyticsData}
//                 dataKey="value"
//                 nameKey="_id"
//                 cx="50%"
//                 cy="50%"
//                 fill="#6366F1"
//                 label
//               />
//               <Tooltip />
//               <Legend />
//             </PieChart>
//           </ResponsiveContainer>
//         );
//       case "table":
//         return (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Category
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Value
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {analyticsData.map((item, index) => (
//                   <tr key={index}>
//                     <td className="px-6 py-4 whitespace-nowrap">{item._id}</td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {item.value}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   const downloadAnalytics = () => {
//     const element = document.createElement("a");
//     const file = new Blob([JSON.stringify(savedAnalytics, null, 2)], {
//       type: "application/json",
//     });
//     element.href = URL.createObjectURL(file);
//     element.download = "analytics-configurations.json";
//     document.body.appendChild(element);
//     element.click();
//     document.body.removeChild(element);
//   };

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <AnimatePresence>
//         {(fetchError ||
//           dataError ||
//           createUpdateMutation.error ||
//           deleteMutation.error) &&
//           !dismissedError && (
//             <motion.div
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               className="bg-red-50 text-red-500 p-4 rounded-lg mb-4 flex justify-between items-center"
//             >
//               <span>
//                 {fetchError?.message ||
//                   dataError?.message ||
//                   createUpdateMutation.error?.message ||
//                   deleteMutation.error?.message}
//               </span>
//               <button onClick={() => setDismissedError(true)}>
//                 <X size={16} />
//               </button>
//             </motion.div>
//           )}
//       </AnimatePresence>

//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="bg-white rounded-lg shadow-lg p-6"
//       >
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold text-indigo-500">
//             {isEditing ? "Edit Analytics" : "Dynamic Analytics Dashboard"}
//           </h1>
//           <button
//             onClick={downloadAnalytics}
//             className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
//           >
//             <Download size={20} />
//             Download Analytics
//           </button>
//         </div>

//         <form
//           onSubmit={handleSubmit(createUpdateMutation.mutate)}
//           className="space-y-6"
//         >
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Analytics Name
//               </label>
//               <Controller
//                 name="name"
//                 control={control}
//                 rules={{ required: "Name is required" }}
//                 render={({ field, fieldState: { error } }) => (
//                   <div>
//                     <input
//                       {...field}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                       placeholder="Enter analytics name"
//                     />
//                     {error && (
//                       <span className="text-red-500 text-sm">
//                         {error.message}
//                       </span>
//                     )}
//                   </div>
//                 )}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Chart Type
//               </label>
//               <Controller
//                 name="type"
//                 control={control}
//                 rules={{ required: "Chart type is required" }}
//                 render={({ field, fieldState: { error } }) => (
//                   <div>
//                     <CustomSelect
//                       options={chartTypes}
//                       value={chartTypes.find(
//                         (option) => option.value === field.value
//                       )}
//                       onChange={(option) => field.onChange(option.value)}
//                       placeholder="Select chart type"
//                     />
//                     {error && (
//                       <span className="text-red-500 text-sm">
//                         {error.message}
//                       </span>
//                     )}
//                   </div>
//                 )}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Data Field
//               </label>
//               <Controller
//                 name="dataSource.field"
//                 control={control}
//                 rules={{ required: "Data field is required" }}
//                 render={({ field, fieldState: { error } }) => (
//                   <div>
//                     <CustomSelect
//                       options={fieldOptions}
//                       value={fieldOptions.find(
//                         (option) => option.value === field.value
//                       )}
//                       onChange={(option) => field.onChange(option.value)}
//                       placeholder="Select data field"
//                     />
//                     {error && (
//                       <span className="text-red-500 text-sm">
//                         {error.message}
//                       </span>
//                     )}
//                   </div>
//                 )}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Aggregation Type
//               </label>
//               <Controller
//                 name="dataSource.aggregation"
//                 control={control}
//                 rules={{ required: "Aggregation type is required" }}
//                 render={({ field, fieldState: { error } }) => (
//                   <div>
//                     <CustomSelect
//                       options={aggregationTypes}
//                       value={aggregationTypes.find(
//                         (option) => option.value === field.value
//                       )}
//                       onChange={(option) => field.onChange(option.value)}
//                       placeholder="Select aggregation type"
//                     />
//                     {error && (
//                       <span className="text-red-500 text-sm">
//                         {error.message}
//                       </span>
//                     )}
//                   </div>
//                 )}
//               />
//             </div>
//           </div>

//           <div className="flex justify-end gap-4">
//             <button
//               type="button"
//               onClick={() => {
//                 reset();
//                 setIsEditing(false);
//                 setSelectedAnalytic(null);
//               }}
//               className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
//             >
//               <Save size={20} />
//               {isEditing ? "Update Analytics" : "Save Analytics"}
//             </button>
//           </div>
//         </form>

//         {analyticsData && selectedAnalytic && (
//           <div className="mt-8">
//             <h2 className="text-xl font-semibold text-gray-800 mb-4">
//               {selectedAnalytic.name} - Visualization
//             </h2>
//             {renderChart()}
//           </div>
//         )}

//         <div className="mt-8">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">
//             Saved Analytics
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {savedAnalytics.map((analytic) => (
//               <motion.div
//                 key={analytic._id}
//                 whileHover={{ scale: 1.02 }}
//                 className="bg-gray-50 p-4 rounded-lg border border-gray-200"
//               >
//                 <div className="flex justify-between items-start mb-4">
//                   <h3 className="font-medium text-indigo-500">
//                     {analytic.name}
//                   </h3>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => setSelectedAnalytic(analytic)}
//                       className="text-gray-400 hover:text-indigo-500 transition-colors"
//                     >
//                       <Eye size={16} />
//                     </button>
//                     <button
//                       onClick={() => {
//                         setSelectedAnalytic(analytic);
//                         setIsEditing(true);
//                       }}
//                       className="text-gray-400 hover:text-indigo-500 transition-colors"
//                     >
//                       <Edit2 size={16} />
//                     </button>
//                     <button
//                       onClick={() => {
//                         if (
//                           window.confirm(
//                             "Are you sure you want to delete this analytics?"
//                           )
//                         ) {
//                           deleteMutation.mutate(analytic._id);
//                         }
//                       }}
//                       className="text-gray-400 hover:text-red-500 transition-colors"
//                     >
//                       <Trash2 size={16} />
//                     </button>
//                   </div>
//                 </div>
//                 <div className="text-sm text-gray-600 space-y-1">
//                   <p>Type: {analytic.configuration.type}</p>
//                   <p>
//                     Field:{" "}
//                     {fieldOptions.find(
//                       (opt) =>
//                         opt.value === analytic.configuration.dataSource.field
//                     )?.label || analytic.configuration.dataSource.field}
//                   </p>
//                   <p>
//                     Aggregation:{" "}
//                     {aggregationTypes.find(
//                       (opt) =>
//                         opt.value ===
//                         analytic.configuration.dataSource.aggregation
//                     )?.label || analytic.configuration.dataSource.aggregation}
//                   </p>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         </div>

//         {/* Loading Overlay */}
//         <AnimatePresence>
//           {(createUpdateMutation.isPending || deleteMutation.isPending) && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//             >
//               <div className="bg-white p-6 rounded-lg shadow-lg">
//                 <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
//                 <p className="text-gray-700 mt-2 text-center">Processing...</p>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </motion.div>
//     </div>
//   );
// };

// export default FacultyAnalytics;
