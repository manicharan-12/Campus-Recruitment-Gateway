import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { getUserRole } from "../../../utils/auth";

const DegreePrograms = ({ universityId, programs, onUpdatePrograms }) => {
  const [isAddingProgram, setIsAddingProgram] = useState(false);
  const [isEditingProgram, setIsEditingProgram] = useState(null);
  const [expandedProgram, setExpandedProgram] = useState(null);
  const jwtToken = Cookies.get("userCookie");
  const userRole = getUserRole();

  const queryClient = useQueryClient();

  const programForm = useForm({
    defaultValues: {
      name: "",
      branches: [],
    },
  });

  // Reset form when adding or editing changes
  useEffect(() => {
    if (isAddingProgram) {
      programForm.reset({
        name: "",
        branches: [],
      });
    }
  }, [isAddingProgram, programForm.reset]);

  // Create Program Mutation
  const createProgramMutation = useMutation({
    mutationFn: async (programData) => {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_API_URL}/university/${universityId}/programs`,
        programData,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      return response.data;
    },
    onSuccess: (newProgram) => {
      // Directly update the local state with the server response
      onUpdatePrograms((prev) => [
        ...prev,
        {
          _id: newProgram.id,
          programName: newProgram.name,
          branches: newProgram.branches || [],
        },
      ]);

      // Invalidate and refetch university data to ensure consistency
      queryClient.invalidateQueries(["university", universityId]);

      setIsAddingProgram(false);
      programForm.reset();
      toast.success("Program added successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add program");
    },
  });

  // Update Program Mutation
  const updateProgramMutation = useMutation({
    mutationFn: async ({ programId, programData }) => {
      const response = await axios.put(
        `${process.env.REACT_APP_SERVER_API_URL}/university/${universityId}/programs/${programId}`,
        programData,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      return response.data;
    },
    onSuccess: (updatedProgram) => {
      // Directly update the local state with the server response
      onUpdatePrograms((prev) =>
        prev.map((p) =>
          p._id === updatedProgram._id
            ? {
                ...p,
                programName: updatedProgram.name,
                branches: updatedProgram.branches || [],
              }
            : p
        )
      );

      // Invalidate and refetch university data to ensure consistency
      queryClient.invalidateQueries(["university", universityId]);

      setIsEditingProgram(null);
      programForm.reset();
      toast.success("Program updated successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update program");
    },
  });

  // Delete Program Mutation
  const deleteProgramMutation = useMutation({
    mutationFn: async (programId) => {
      await axios.delete(
        `${process.env.REACT_APP_SERVER_API_URL}/university/${universityId}/programs/${programId}`,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      return programId;
    },
    onSuccess: (programId) => {
      // Directly update the local state
      onUpdatePrograms((prev) => prev.filter((p) => p._id !== programId));

      // Invalidate and refetch university data to ensure consistency
      queryClient.invalidateQueries(["university", universityId]);

      toast.success("Program deleted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete program");
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: programForm.control,
    name: "branches",
  });

  const handleCreateProgram = (data) => {
    createProgramMutation.mutate({
      name: data.name,
      branches: data.branches.map((b) => b.value).filter(Boolean),
    });
  };

  const handleUpdateProgram = (data) => {
    updateProgramMutation.mutate({
      programId: isEditingProgram._id,
      programData: {
        name: data.name,
        branches: data.branches.map((b) => b.value).filter(Boolean),
      },
    });
  };

  const startEditProgram = (program) => {
    setIsEditingProgram(program);
    programForm.reset({
      name: program.programName,
      branches: (program.branches || []).map((b) => ({ value: b })),
    });
  };

  const closeModal = () => {
    setIsAddingProgram(false);
    setIsEditingProgram(null);
    programForm.reset();
  };

  const renderProgramForm = (isEditing = false) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {isEditing ? "Edit Program" : "Add New Program"}
          </h3>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={programForm.handleSubmit(
            isEditing ? handleUpdateProgram : handleCreateProgram
          )}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program Name
            </label>
            <input
              {...programForm.register("name", {
                required: "Program name is required",
              })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter program name"
            />
            {programForm.formState.errors.name && (
              <p className="text-red-500 text-sm mt-1">
                {programForm.formState.errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add Branches (Optional)
            </label>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    {...programForm.register(`branches.${index}.value`)}
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                    placeholder="Enter branch name"
                  />
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => append({ value: "" })}
              className="mt-2 flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
            >
              <Plus className="h-4 w-4" /> Add Branch
            </button>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isEditing
                  ? updateProgramMutation.isPending
                  : createProgramMutation.isPending
              }
              className={`px-4 py-2 rounded-md text-white flex items-center gap-2 ${
                isEditing
                  ? updateProgramMutation.isPending
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                  : createProgramMutation.isPending
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {isEditing ? (
                updateProgramMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Program"
                )
              ) : createProgramMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Program"
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="container mx-auto px-4 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Degree Programs</h2>
        {userRole !== "Student" && (
          <button
            onClick={() => setIsAddingProgram(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
          >
            <Plus className="h-3 w-3" />
            Add Program
          </button>
        )}
      </div>

      <AnimatePresence>
        {programs.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-500 text-center"
          >
            No programs added yet
          </motion.p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {programs.map((program, index) => (
              <motion.div
                key={program._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gray-50 rounded-lg p-3 shadow-sm w-full"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3 truncate">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {program.programName}
                    </h3>
                    {program.branches && program.branches.length > 0 && (
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded flex-shrink-0">
                        {program.branches.length} branches
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-2">
                    {userRole !== "Student" && (
                      <>
                        <button
                          onClick={() => startEditProgram(program)}
                          className="text-gray-500 hover:text-indigo-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            deleteProgramMutation.mutate(program._id)
                          }
                          className="text-gray-500 hover:text-red-600"
                          disabled={deleteProgramMutation.isPending}
                        >
                          {deleteProgramMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </>
                    )}

                    {program.branches && program.branches.length > 0 && (
                      <button
                        onClick={() =>
                          setExpandedProgram(
                            expandedProgram === index ? null : index
                          )
                        }
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {expandedProgram === index ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedProgram === index &&
                    program.branches &&
                    program.branches.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2"
                      >
                        <ul className="flex flex-wrap gap-2">
                          {program.branches.map((branch, branchIndex) => (
                            <li
                              key={branchIndex}
                              className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md text-xs"
                            >
                              {branch}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(isAddingProgram || isEditingProgram) &&
          renderProgramForm(!!isEditingProgram)}
      </AnimatePresence>
    </div>
  );
};

export default DegreePrograms;
