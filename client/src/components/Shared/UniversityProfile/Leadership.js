import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import FacultyCard from "./FacultyCard";
import Modal from "../../Global/Modal";
import { useForm } from "react-hook-form";

const Leadership = ({ headFaculty, coordinators, universityId }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddFacultyModalOpen, setIsAddFacultyModalOpen] = useState(false);
  const [newFacultyRole, setNewFacultyRole] = useState("Coordinator");
  const itemsPerPage = 4;
  const jwtToken = Cookies.get("userCookie");
  const queryClient = useQueryClient();

  const addFacultyMutation = useMutation({
    mutationFn: async (newFacultyData) => {
      await axios.post(
        `${process.env.REACT_APP_SERVER_API_URL}/admin/faculty`,
        {
          ...newFacultyData,
          universityId,
        },
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["university", universityId]);
      setIsAddFacultyModalOpen(false);
    },
  });

  const { register, handleSubmit, reset } = useForm();

  const filteredCoordinators = coordinators.filter(
    (faculty) =>
      faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faculty.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCoordinators.length / itemsPerPage);
  const paginatedCoordinators = filteredCoordinators.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const onSubmit = (data) => {
    addFacultyMutation.mutate({
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      role: newFacultyRole,
    });
    reset(); // Reset the form after submission
  };
  console.log(headFaculty);
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Leadership</h2>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          onClick={() => setIsAddFacultyModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Faculty
        </button>
      </div>

      {/* Head Profile */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-indigo-600 mb-4">
          Head of Institution
        </h3>
        <div className="flex flex-wrap gap-6">
          {headFaculty.map((faculty) => (
            <FacultyCard key={faculty._id} faculty={faculty} />
          ))}
        </div>
      </div>

      {/* Coordinators */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-indigo-600">
            Coordinators
          </h3>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search faculty..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paginatedCoordinators.map((faculty) => (
            <FacultyCard key={faculty._id} faculty={faculty} />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6 gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 border rounded-md ${
                  currentPage === index + 1
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-gray-50"
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {isAddFacultyModalOpen && (
        <Modal
          title="Add New Faculty"
          onClose={() => setIsAddFacultyModalOpen(false)}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                {...register("name", { required: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                {...register("email", { required: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                phone Number
              </label>
              <input
                type="text"
                {...register("phoneNumber", { required: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                value={newFacultyRole}
                onChange={(e) => setNewFacultyRole(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="Head">Head</option>
                <option value="Coordinator">Coordinator</option>
              </select>
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsAddFacultyModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addFacultyMutation.isLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Add Faculty
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Leadership;
