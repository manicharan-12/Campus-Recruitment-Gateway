// FacultyCard.jsx
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import {
  Mail,
  Phone,
  Users,
  History,
  Key,
  Power,
  Edit,
  Trash2,
  Clock,
} from "lucide-react";
import Modal from "../../Global/Modal";

const FacultyCard = ({ faculty, universityId }) => {
  const [isLoginHistoryModalOpen, setIsLoginHistoryModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newConfirmPassword, setNewConfirmPassword] = useState("");
  
  const jwtToken = Cookies.get("userCookie");
  const queryClient = useQueryClient();

  const passwordMutation = useMutation({
    mutationFn: async (password) => {
      await axios.put(
        `${process.env.REACT_APP_SERVER_API_URL}/admin/faculty/${faculty._id}/password`,
        { password },
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
    },
    onSuccess: () => {
      setIsPasswordModalOpen(false);
      setNewPassword("");
      setNewConfirmPassword("");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async () => {
      await axios.put(
        `${process.env.REACT_APP_SERVER_API_URL}/admin/faculty/${faculty._id}/deactivate`,
        {},
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["university", universityId]);
      setIsDeactivateModalOpen(false);
    },
  });

  const editMutation = useMutation({
    mutationFn: async (updatedData) => {
      await axios.put(
        `${process.env.REACT_APP_SERVER_API_URL}/admin/faculty/${faculty._id}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["university", universityId]);
      setIsEditModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await axios.delete(
        `${process.env.REACT_APP_SERVER_API_URL}/admin/faculty/${faculty._id}`,
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["university", universityId]);
      setIsDeleteModalOpen(false);
    },
  });

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <div className="bg-indigo-100 rounded-full p-3">
            <Users className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-medium text-gray-900">{faculty.name}</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{faculty.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{faculty.phoneNumber}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsLoginHistoryModalOpen(true)}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
          >
            <History className="h-4 w-4" />
            Login History
          </button>
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
          >
            <Key className="h-4 w-4" />
            Change Password
          </button>
          <button
            onClick={() => setIsDeactivateModalOpen(true)}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
          >
            <Power className="h-4 w-4" />
            {faculty.isAccountDeactivated ? "Activate" : "Deactivate"}
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
          >
            <Edit className="h-4 w-4" />
            Edit Details
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {isLoginHistoryModalOpen && (
        <Modal
          title="Login History"
          onClose={() => setIsLoginHistoryModalOpen(false)}
        >
          <div className="space-y-4">
           {faculty?.loginTimestamps?.length > 0 ? (
             faculty.loginTimestamps.map((timestamp, index) => (
               <div
                 key={index}
                 className="flex items-center gap-2 text-sm text-gray-600"
               >
                 <Clock className="h-4 w-4" />
                 <span>{formatTimestamp(timestamp)}</span>
               </div>
             ))
           ) : (
             <p className="text-gray-500">No login history available</p>
           )}
          </div>
        </Modal>
      )}

      {isPasswordModalOpen && (
        <Modal
          title="Change Password"
          onClose={() => setIsPasswordModalOpen(false)}
        >
          <div className="space-y-4">
           <div>
             <label
               htmlFor="newPassword"
               className="block text-sm font-medium text-gray-700"
             >
               New Password
             </label>
             <input
               type="password"
               id="newPassword"
               value={newPassword}
               onChange={(e) => setNewPassword(e.target.value)}
               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
             />
           </div>
           <div>
             <label
               htmlFor="confirmPassword"
               className="block text-sm font-medium text-gray-700"
             >
               Confirm New Password
             </label>
             <input
               type="password"
               id="confirmPassword"
               value={newConfirmPassword}
               onChange={(e) => setNewConfirmPassword(e.target.value)}
               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
             />
           </div>
           <div className="flex justify-end gap-4">
             <button
               onClick={() => setIsPasswordModalOpen(false)}
               className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
             >
               Cancel
             </button>
             <button
               onClick={() => {
                 if (newPassword && newPassword === newConfirmPassword) {
                   passwordMutation.mutate();
                 }
               }}
               disabled={!newPassword || newPassword !== newConfirmPassword || passwordMutation.isLoading}
               className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
             >
               Change Password
             </button>
           </div>
          </div>
        </Modal>
      )}

      {isEditModalOpen && (
        <Modal
          title="Edit Faculty Details"
          onClose={() => setIsEditModalOpen(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              editMutation.mutate({
                name: e.target.name.value,
                email: e.target.email.value,
                phoneNumber: e.target.phoneNumber.value,
              });
            }}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="facultyName"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="facultyName"
                name="name"
                defaultValue={faculty.name}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="facultyEmail"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="facultyEmail"
                name="email"
                defaultValue={faculty.email}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label
                htmlFor="facultyPhone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="facultyPhone"
                name="phoneNumber"
                defaultValue={faculty.phoneNumber}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={editMutation.isLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {isDeactivateModalOpen && (
        <Modal
          title={`${faculty.isAccountDeactivated ? "Activate" : "Deactivate"} Account`}
          onClose={() => setIsDeactivateModalOpen(false)}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to {faculty.isAccountDeactivated ? "activate" : "deactivate"} the account for{" "}
              <span className="font-medium">{faculty.name}</span>?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeactivateModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deactivateMutation.mutate()}
                disabled={deactivateMutation.isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                {faculty.isAccountDeactivated ? "Activate" : "Deactivate"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {isDeleteModalOpen && (
        <Modal
          title="Delete Faculty"
          onClose={() => setIsDeleteModalOpen(false)}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Are you sure you want to delete {faculty.name}? This action
              cannot be undone.
            </p>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Type <span className="font-semibold">{faculty.name}</span> to
                confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Type faculty name to confirm"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirmText === faculty.name) {
                    deleteMutation.mutate();
                  }
                }}
                disabled={deleteConfirmText !== faculty.name}
                className={`px-4 py-2 rounded-md text-white ${
                  deleteConfirmText === faculty.name
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-400 cursor-not-allowed"
                }`}
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FacultyCard;