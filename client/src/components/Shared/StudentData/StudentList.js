import React, { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Search,
  School,
  Users,
  SortAsc,
  SortDesc,
  UserCircle,
  Briefcase,
  X,
  Building,
  DollarSign,
  UserCheck,
  Plus,
} from "lucide-react";
import { getUserRole } from "../../../utils/auth.js";
import LoadingOverlay from "../../Global/LoadingOverlay";
import CustomSelect from "../../Global/CustomSelect.js";
import { useForm, Controller } from "react-hook-form";

const PlacementModal = ({
  isOpen,
  onClose,
  student,
  onSubmit,
  existingOffers = [],
}) => {
  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      offers:
        existingOffers.length > 0
          ? existingOffers.map((offer) => ({
              company: offer.company || "",
              role: offer.role || "",
              ctc: offer.ctc || "",
            }))
          : [{ company: "", role: "", ctc: "" }],
    },
  });

  const offers = watch("offers") || [];

  const addOffer = () => {
    setValue("offers", [...offers, { company: "", role: "", ctc: "" }]);
  };

  const removeOffer = (index) => {
    const newOffers = offers.filter((_, i) => i !== index);
    setValue("offers", newOffers);
  };

  const onFormSubmit = (data) => {
    // Validate and clean offers data before submission
    const validOffers = data.offers
      .filter((offer) => offer.company && offer.role && offer.ctc)
      .map((offer) => ({
        company: offer.company.trim(),
        role: offer.role.trim(),
        ctc: parseFloat(offer.ctc) || 0,
      }));

    onSubmit({
      studentId: student?.id,
      isPlaced: validOffers.length > 0,
      offers: validOffers,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="relative bg-white rounded-lg w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Add Placement Offer - {student?.name || "Student"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            {offers.map((_, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Offer {index + 1}</h3>
                  {offers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOffer(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <div className="relative">
                      <Building
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <Controller
                        name={`offers.${index}.company`}
                        control={control}
                        rules={{ required: true }}
                        render={({ field, fieldState: { error } }) => (
                          <div>
                            <input
                              {...field}
                              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 
                                ${
                                  error ? "border-red-500" : "border-gray-300"
                                }`}
                              placeholder="Enter company name"
                            />
                            {error && (
                              <span className="text-red-500 text-sm mt-1">
                                Company name is required
                              </span>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <div className="relative">
                      <UserCheck
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <Controller
                        name={`offers.${index}.role`}
                        control={control}
                        rules={{ required: true }}
                        render={({ field, fieldState: { error } }) => (
                          <div>
                            <input
                              {...field}
                              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500
                                ${
                                  error ? "border-red-500" : "border-gray-300"
                                }`}
                              placeholder="Enter role/position"
                            />
                            {error && (
                              <span className="text-red-500 text-sm mt-1">
                                Role is required
                              </span>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CTC (LPA)
                    </label>
                    <div className="relative">
                      <DollarSign
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <Controller
                        name={`offers.${index}.ctc`}
                        control={control}
                        rules={{
                          required: true,
                          min: 0,
                          validate: (value) =>
                            !isNaN(value) || "Must be a number",
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <div>
                            <input
                              {...field}
                              type="number"
                              step="0.1"
                              min="0"
                              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500
                                ${
                                  error ? "border-red-500" : "border-gray-300"
                                }`}
                              placeholder="Enter CTC in LPA"
                            />
                            {error && (
                              <span className="text-red-500 text-sm mt-1">
                                {error.type === "min"
                                  ? "CTC must be positive"
                                  : "Valid CTC is required"}
                              </span>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addOffer}
              className="w-full py-2 text-indigo-600 hover:text-indigo-700 font-medium border-2 border-dashed border-indigo-300 rounded-lg hover:border-indigo-400"
            >
              <Plus className="inline-block mr-1" size={16} />
              Add Another Offer
            </button>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save Offers
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const PlacementBubbles = ({ offers = [] }) => {
  // Generate consistent colors based on company names
  const getCompanyColor = (company = "") => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-teal-500",
    ];
    const index =
      company.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {offers.map((offer, index) => {
        const company = offer?.company || "Unknown Company";
        const role = offer?.role || "Unknown Role";
        const ctc = offer?.ctc || "N/A";

        return (
          <div
            key={offer?._id || index}
            className={`${getCompanyColor(
              company
            )} text-white text-sm px-3 py-1 rounded-full`}
            title={`${role} - ${ctc} LPA`}
          >
            {company}
          </div>
        );
      })}
    </div>
  );
};

const StudentList = () => {
  const navigate = useNavigate();
  const jwtToken = Cookies.get("userCookie");
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [selectedPlacementStatus, setSelectedPlacementStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [updatedPlacements, setUpdatedPlacements] = useState(new Map());

  const queryClient = useQueryClient();
  const { control, reset } = useForm();
  const role = getUserRole();
  const isAdminRole = role === "admin" || role === "super admin";
  const isPlacementRole = role === "head" || role === "coordinator";

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["students", "data"],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_API_URL}/students/data`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      return response.data;
    },
  });

  const updatePlacementMutation = useMutation({
    mutationFn: async ({ studentId, isPlaced, offers = [] }) => {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_API_URL}/students/update-placements`,
        {
          placements: [
            {
              studentId,
              isPlaced,
              offers,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["students", "data"]);
      setUpdatedPlacements(new Map());
    },
    onError: (error) => {
      console.error("Error updating placement:", error);
      // You might want to add toast notification here
    },
  });

  // Mutation to remove a placement offer
  const removePlacementOfferMutation = useMutation({
    mutationFn: async ({ studentId, offerId }) => {
      const response = await axios.delete(
        `${process.env.REACT_APP_SERVER_API_URL}/students/placement-offer/${studentId}/${offerId}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["students", "data"]);
    },
    onError: (error) => {
      console.error("Error removing placement offer:", error);
      // You might want to add toast notification here
    },
  });

  // Handler for updating placement status
  const handlePlacementStatusChange = (student, isPlaced) => {
    if (isPlaced) {
      setSelectedStudent(student);
      setModalOpen(true);
    } else {
      updatePlacementMutation.mutate({
        studentId: student.id,
        isPlaced: false,
      });
    }
  };

  // Handler for placement details submission from modal
  const handlePlacementDetailsSubmit = (details) => {
    updatePlacementMutation.mutate({
      studentId: details.studentId,
      isPlaced: true,
      offers: details.offers,
    });
  };

  // Handler for removing a placement offer
  const handleRemovePlacementOffer = (studentId, offerId) => {
    removePlacementOfferMutation.mutate({
      studentId,
      offerId,
    });
  };

  const handleSaveAllPlacements = () => {
    const placements = Array.from(updatedPlacements.entries()).map(
      ([studentId, details]) => ({
        studentId,
        ...details,
      })
    );
    updatePlacementMutation.mutate(placements);
  };

  const currentUniversity = useMemo(() => {
    if (!isAdminRole || !data?.data?.universities) return null;
    return selectedUniversity
      ? data.data.universities.find((uni) => uni.name === selectedUniversity)
      : null;
  }, [isAdminRole, data, selectedUniversity]);

  const filteredAndSortedStudents = useMemo(() => {
    if (!data?.data?.students) return [];

    let filtered = data.data.students;

    if (isAdminRole && selectedUniversity) {
      filtered = filtered.filter(
        (student) => student.university === selectedUniversity
      );
    }
    if (selectedDegree) {
      filtered = filtered.filter(
        (student) => student.degree === selectedDegree
      );
    }
    if (selectedBranch) {
      filtered = filtered.filter(
        (student) => student.branch === selectedBranch
      );
    }
    if (selectedSection) {
      filtered = filtered.filter(
        (student) => student.section === selectedSection
      );
    }
    if (selectedSection) {
      filtered = filtered.filter(
        (student) => student.section === selectedSection
      );
    }
    if (selectedYear) {
      filtered = filtered.filter(
        (student) => student?.graduationYear.toString() === selectedYear
      );
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query)
      );
    }
    if (selectedPlacementStatus) {
      filtered = filtered.filter((student) => {
        if (updatedPlacements.has(student.id)) {
          const updatedStatus = updatedPlacements.get(student.id).isPlaced;
          return selectedPlacementStatus === "placed"
            ? updatedStatus
            : !updatedStatus;
        }
        return selectedPlacementStatus === "placed"
          ? student.isPlaced
          : !student.isPlaced;
      });
    }

    return [...filtered].sort((a, b) => {
      if (sortConfig.key === "name") {
        const nameA = a.name.split(" ").pop().toLowerCase();
        const nameB = b.name.split(" ").pop().toLowerCase();
        return sortConfig.direction === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      }
      if (sortConfig.key === "rollNumber") {
        return sortConfig.direction === "asc"
          ? a.rollNumber.localeCompare(b.rollNumber)
          : b.rollNumber.localeCompare(a.rollNumber);
      }
      return 0;
    });
  }, [
    data,
    isAdminRole,
    selectedUniversity,
    selectedDegree,
    selectedBranch,
    selectedSection,
    selectedYear,
    searchQuery,
    sortConfig,
    selectedPlacementStatus,
    updatedPlacements,
  ]);

  const availablePrograms = useMemo(() => {
    if (isAdminRole) {
      return currentUniversity?.programs || [];
    } else {
      return data?.data?.university?.programs || [];
    }
  }, [isAdminRole, currentUniversity, data]);

  const universityOptions = useMemo(
    () =>
      data?.data?.universities?.map((uni) => ({
        value: uni.name,
        label: uni.name,
      })) || [],
    [data]
  );

  const degreeOptions = useMemo(
    () =>
      availablePrograms.map((prog) => ({
        value: prog.degree,
        label: prog.degree,
      })) || [],
    [availablePrograms]
  );

  const branchOptions = useMemo(() => {
    if (!selectedDegree || !availablePrograms) return [];

    const selectedProgram = availablePrograms.find(
      (prog) => prog.degree === selectedDegree
    );
    return (
      selectedProgram?.branches.map((branch) => ({
        value: branch.name,
        label: branch.name,
      })) || []
    );
  }, [selectedDegree, availablePrograms]);

  const sectionOptions = useMemo(() => {
    if (!selectedDegree || !selectedBranch || !availablePrograms) return [];

    const selectedProgram = availablePrograms.find(
      (prog) => prog.degree === selectedDegree
    );
    const selectedBranchData = selectedProgram?.branches.find(
      (b) => b.name === selectedBranch
    );

    return (
      selectedBranchData?.sections?.map((section) => ({
        value: section,
        label: section,
      })) || []
    );
  }, [selectedDegree, selectedBranch, availablePrograms]);

  const yearOptions = useMemo(
    () =>
      Array.from(
        new Set(
          data?.data?.students
            ?.filter((s) => s.graduationYear != null)
            .map((s) => s.graduationYear)
        )
      )
        .sort()
        .map((year) => ({
          value: year.toString(),
          label: year.toString(),
        })) || [],
    [data]
  );

  const hasActiveFilters = useMemo(() => {
    return (
      selectedUniversity !== "" ||
      selectedDegree !== "" ||
      selectedBranch !== "" ||
      selectedSection !== "" ||
      selectedYear !== "" ||
      searchQuery !== "" ||
      selectedPlacementStatus !== "" ||
      sortConfig.key !== "name" ||
      sortConfig.direction !== "asc"
    );
  }, [
    selectedUniversity,
    selectedDegree,
    selectedBranch,
    selectedSection,
    selectedYear,
    searchQuery,
    selectedPlacementStatus,
    sortConfig.key,
    sortConfig.direction,
  ]);

  const resetFilters = () => {
    setSelectedUniversity("");
    setSelectedDegree("");
    setSelectedBranch("");
    setSelectedSection("");
    setSelectedYear("");
    setSearchQuery("");
    setSelectedPlacementStatus("");
    setSortConfig({
      key: "name",
      direction: "asc",
    });

    reset({
      university: null,
      degree: null,
      branch: null,
      section: null,
      year: null,
      placementStatus: null,
    });
  };

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 p-4">Error: {error.message}</div>
    );
  }

  const universityName = isAdminRole
    ? selectedUniversity || "All Universities"
    : data?.data?.university?.name;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header with University name and total count */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center">
          <School className="inline-block mr-2" size={24} />
          <h1 className="text-xl font-semibold text-gray-800">
            {universityName}
          </h1>
        </div>
        <div className="bg-indigo-100 px-4 py-2 rounded-lg">
          <span className="text-indigo-700 font-medium">
            Total Students: {filteredAndSortedStudents.length}
          </span>
        </div>
      </div>

      {/* Pending Updates Banner */}
      {isPlacementRole && updatedPlacements.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-indigo-50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <span className="text-indigo-700 font-medium">
            {updatedPlacements.size} student placement status updates pending
          </span>
          <button
            onClick={handleSaveAllPlacements}
            disabled={updatePlacementMutation.isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updatePlacementMutation.isLoading
              ? "Saving..."
              : "Save All Updates"}
          </button>
        </motion.div>
      )}

      {/* Filters Section */}
      <div className="space-y-4 mb-6">
        {/* Main filters container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Placement Status Filter */}
          {isPlacementRole && (
            <div className="w-full">
              <Controller
                name="placementStatus"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    options={[
                      { value: "", label: "All Placement Status" },
                      { value: "placed", label: "Placed" },
                      { value: "not_placed", label: "Not Placed" },
                    ]}
                    value={field.value || null}
                    onChange={(option) => {
                      field.onChange(option);
                      setSelectedPlacementStatus(option?.value || "");
                    }}
                    placeholder="Select Status"
                    isClearable={true}
                  />
                )}
              />
            </div>
          )}

          {/* University Filter - Only for admin */}
          {isAdminRole && (
            <div className="w-full">
              <Controller
                name="university"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    options={universityOptions}
                    value={universityOptions.find(
                      (option) => option.value === selectedUniversity
                    )}
                    onChange={(option) => {
                      field.onChange(option);
                      setSelectedUniversity(option.value);
                      setSelectedDegree("");
                      setSelectedBranch("");
                    }}
                    placeholder="Select University"
                  />
                )}
              />
            </div>
          )}

          {/* Degree Filter */}
          <div className="w-full">
            <Controller
              name="degree"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  options={degreeOptions}
                  value={field.value || null}
                  onChange={(option) => {
                    field.onChange(option);
                    setSelectedDegree(option?.value || "");
                    setSelectedBranch("");
                  }}
                  placeholder="Select Degree"
                  isClearable={true}
                />
              )}
            />
          </div>

          {/* Branch Filter */}
          <div className="w-full">
            <Controller
              name="branch"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  options={branchOptions}
                  value={field.value || null}
                  onChange={(option) => {
                    field.onChange(option);
                    setSelectedBranch(option?.value || "");
                    setSelectedSection("");
                  }}
                  placeholder="Select Branch"
                  isDisabled={!selectedDegree}
                  isClearable={true}
                />
              )}
            />
          </div>

          {/* Section Filter */}
          <div className="w-full">
            <Controller
              name="section"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  options={sectionOptions}
                  value={field.value || null}
                  onChange={(option) => {
                    field.onChange(option);
                    setSelectedSection(option?.value || "");
                  }}
                  placeholder="Select Section"
                  isDisabled={!selectedBranch}
                  isClearable={true}
                />
              )}
            />
          </div>

          {/* Year Filter */}
          <div className="w-full">
            <Controller
              name="year"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  options={yearOptions}
                  value={field.value || null}
                  onChange={(option) => {
                    field.onChange(option);
                    setSelectedYear(option?.value || "");
                  }}
                  placeholder="Select Year"
                  isClearable={true}
                />
              )}
            />
          </div>
        </div>

        {/* Search and Sort Section */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={resetFilters}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <X size={16} />
              Reset Filters
            </motion.button>
          )}

          {/* Sort Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() =>
                setSortConfig({
                  key: "name",
                  direction: sortConfig.direction === "asc" ? "desc" : "asc",
                })
              }
              className={`px-4 py-2 rounded-lg border ${
                sortConfig.key === "name"
                  ? "bg-indigo-500 text-white"
                  : "border-gray-300 hover:border-indigo-500"
              }`}
            >
              Sort by Name{" "}
              {sortConfig.key === "name" &&
                (sortConfig.direction === "asc" ? (
                  <SortAsc className="inline" size={16} />
                ) : (
                  <SortDesc className="inline" size={16} />
                ))}
            </button>
            <button
              onClick={() =>
                setSortConfig({
                  key: "rollNumber",
                  direction: sortConfig.direction === "asc" ? "desc" : "asc",
                })
              }
              className={`px-4 py-2 rounded-lg border ${
                sortConfig.key === "rollNumber"
                  ? "bg-indigo-500 text-white"
                  : "border-gray-300 hover:border-indigo-500"
              }`}
            >
              Sort by Roll No.{" "}
              {sortConfig.key === "rollNumber" &&
                (sortConfig.direction === "asc" ? (
                  <SortAsc className="inline" size={16} />
                ) : (
                  <SortDesc className="inline" size={16} />
                ))}
            </button>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredAndSortedStudents.map((student, index) => (
          <motion.div
            key={student.rollNumber}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow"
          >
            {/* Student Card Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 break-words">
                  {student?.name || "Not Specified by the User"}
                </h3>
                <p className="text-gray-600">
                  {student?.rollNumber || "Not Specified by the User"}
                </p>
              </div>
              <GraduationCap
                className="text-indigo-500 flex-shrink-0 ml-2"
                size={24}
              />
            </div>

            {/* Student Details */}
            <div className="mt-4 space-y-2">
              <p className="text-gray-600 break-words">
                <span className="font-medium">Email:</span>{" "}
                {student?.email || "Not Specified by the User"}
              </p>
              {isAdminRole && (
                <p className="text-gray-600">
                  <span className="font-medium">University:</span>{" "}
                  {student?.university || "Not Specified by the User"}
                </p>
              )}
              <p className="text-gray-600">
                <span className="font-medium">Degree:</span>{" "}
                {student?.degree || "Not Specified by the User"}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Branch:</span>{" "}
                {student?.branch || "Not Specified by the User"}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Section:</span>{" "}
                {student.section || "N/A"}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Graduation Year:</span>{" "}
                {student?.graduationYear || "N/A"}
              </p>

              {/* Placement Status - Only for placement roles */}

              {isPlacementRole && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Placement Offers</h4>
                  <div className="space-y-2">
                    {isPlacementRole && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Briefcase className="text-gray-500" size={20} />
                            <select
                              value={
                                updatedPlacements.has(student.id)
                                  ? updatedPlacements.get(student.id).isPlaced
                                  : student.placement?.isPlaced || false
                              }
                              onChange={(e) =>
                                handlePlacementStatusChange(
                                  student,
                                  e.target.value === "true"
                                )
                              }
                              className="px-3 py-1 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="false">Not Placed</option>
                              <option value="true">Placed</option>
                            </select>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setModalOpen(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 flex items-center"
                          >
                            <Plus size={18} className="mr-1" />
                            Add Offer
                          </button>
                        </div>

                        {/* Display company bubbles */}
                        {student.placement?.isPlaced &&
                          student.placement?.offers && (
                            <PlacementBubbles
                              offers={student.placement.offers}
                            />
                          )}

                        {/* Safe access to offers array */}
                        {student.placement?.offers?.map((offer) => (
                          <div
                            key={offer._id}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                          >
                            <div>
                              <p className="font-medium">
                                {offer?.company || "Not Specified by the user"}
                              </p>
                              <p className="text-sm text-gray-600">
                                {offer.role}
                              </p>
                              <p className="text-sm text-gray-600">
                                {offer.ctc} LPA
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                handleRemovePlacementOffer(
                                  student.id,
                                  offer._id
                                )
                              }
                              disabled={removePlacementOfferMutation.isLoading}
                              className="text-red-500 hover:text-red-700 disabled:opacity-50"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* View Profile Button */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => navigate(`/student/${student.id}`)}
                  className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <UserCircle className="mr-2" size={20} />
                  <span>View Profile</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Placement Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <PlacementModal
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setSelectedStudent(null);
            }}
            student={selectedStudent}
            onSubmit={handlePlacementDetailsSubmit}
            existingOffers={selectedStudent?.placement?.offers || []}
          />
        )}
      </AnimatePresence>

      {/* Empty State */}
      {filteredAndSortedStudents.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <Users className="mx-auto mb-4" size={48} />
          <p>No students found matching the current filters.</p>
        </div>
      )}
    </div>
  );
};

export default StudentList;
