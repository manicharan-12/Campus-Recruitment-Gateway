import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Search, Plus, Mail, Phone, Building } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import LoadingOverlay from "../../Global/LoadingOverlay";
import ErrorOverlay from "../../Global/ErrorOverlay";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Modal from "../../Global/Modal";
import { getUserId } from "../../../utils/auth";

const Team = () => {
  const [filter, setFilter] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const queryClient = useQueryClient();

  const jwtToken = Cookies.get("userCookie");

  const currentUserId = getUserId();

  const filterOptions = ["All", "Super Admin", "Admin"];

  const {
    data: employees = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin", "team"],
    queryFn: async () => {
      const response = await axios.get(
        process.env.REACT_APP_SERVER_API_URL + "/admin/team",
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      return response.data;
    },
  });

  const filteredEmployees = employees
    .filter((employee) => filter === "All" || employee.role === filter)
    .filter(
      (employee) =>
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.role.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (a._id === currentUserId) return -1;
      if (b._id === currentUserId) return 1;
      return 0;
    });

  const handleViewProfile = (employee) => {
    setSelectedEmployee(employee);
    setIsProfileModalOpen(true);
  };

  const addEmployee = async (newEmployeeData) => {
    try {
      const response = await axios.post(
        process.env.REACT_APP_SERVER_API_URL + "/admin/add/team",
        newEmployeeData,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to add employee");
    }
  };

  const { mutate } = useMutation({
    mutationFn: addEmployee,
    onMutate: async (newEmployee) => {
      await queryClient.cancelQueries(["admin", "team"]);

      const previousEmployees = queryClient.getQueryData(["admin", "team"]);

      queryClient.setQueryData(["admin", "team"], (old) => [
        ...(old || []),
        { ...newEmployee, _id: String((old || []).length + 1) },
      ]);

      return { previousEmployees };
    },
    onSuccess: (data) => {
      toast.success(data.message, {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    },
    onError: (error, _newEmployee, context) => {
      queryClient.setQueryData(["admin", "team"], context.previousEmployees);
      toast.error(error.response?.data?.message, {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["admin", "team"]);
    },
  });

  const handleAddEmployee = async (data) => {
    try {
      mutate(data);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <LoadingOverlay />;

  if (isError) {
    if (error?.response?.status === 401)
      return <ErrorOverlay statusCode={401} />;
    console.error(error);
  }

  return (
    <div className="p-8 space-y-8 pt-4 bg-gray-50 min-h-screen">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold text-indigo-600">
            Team Members
          </h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 flex items-center shadow-sm"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Employee
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="search"
              placeholder="Search by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>

          <div className="relative w-48">
            <select
              className="w-full appearance-none bg-white border border-gray-200 rounded-lg py-2 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {filterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 text-gray-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <EmployeeCard
            key={employee._id}
            employee={employee}
            onViewProfile={() => handleViewProfile(employee)}
            isCurrentUser={employee._id === currentUserId}
          />
        ))}
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <AddEmployeeModal
            onClose={() => setIsAddModalOpen(false)}
            onAddEmployee={handleAddEmployee}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProfileModalOpen && selectedEmployee && (
          <ProfileModal
            onClose={() => setIsProfileModalOpen(false)}
            employee={selectedEmployee}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const EmployeeCard = ({ employee, onViewProfile, isCurrentUser }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
    >
      <div className="h-48 overflow-hidden bg-indigo-50">
        <img
          src={employee.image}
          alt={employee.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {employee.name}
            </h2>
            <p className="text-indigo-600 font-medium">{employee.role}</p>
          </div>
        </div>

        <div className="mt-4">
          {isCurrentUser ? (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              You
            </div>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={onViewProfile}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
              >
                View Profile
              </button>
              <button className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition duration-300">
                Message
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const AddEmployeeModal = ({ onClose, onAddEmployee }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      onAddEmployee(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Modal onClose={onClose} title="Add New Employee">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            {...register("name", { required: true })}
            className={`mt-1 w-full rounded-lg border border-gray-200 p-2 focus:ring-2 focus:ring-indigo-500 ${
              errors.name ? "border-red-500" : ""
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">Name is required</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            {...register("email", { required: true })}
            className={`mt-1 w-full rounded-lg border border-gray-200 p-2 focus:ring-2 focus:ring-indigo-500 ${
              errors.email ? "border-red-500" : ""
            }`}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">Email is required</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            {...register("role", { required: true })}
            className={`mt-1 w-full rounded-lg border border-gray-200 p-2 focus:ring-2 focus:ring-indigo-500 ${
              errors.role ? "border-red-500" : ""
            }`}
          >
            <option value="">Select a role</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Admin">Admin</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-500">Role is required</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
        >
          Add Employee
        </button>
      </form>
    </Modal>
  );
};

const ProfileModal = ({ onClose, employee }) => {
  return (
    <Modal onClose={onClose} title="Employee Profile">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <img
            src={employee.image}
            alt={employee.name}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              {employee.name}
            </h3>
            <p className="text-indigo-600">{employee.role}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-gray-600">
            <Mail className="h-5 w-5" />
            <span>{employee.email}</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-600">
            <Phone className="h-5 w-5" />
            <span>{employee.phone}</span>
          </div>
          <div className="flex items-center space-x-3 text-gray-600">
            <Building className="h-5 w-5" />
            <span>{employee.department}</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300">
            Edit Profile
          </button>
          <button className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition duration-300">
            Send Message
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default Team;
