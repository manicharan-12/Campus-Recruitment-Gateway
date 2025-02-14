import React, { useState } from "react";
import { Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const NotificationButton = ({ filteredEmails, jwtToken }) => {
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setStatus("");

    try {
      await axios.post(
        `${process.env.REACT_APP_SERVER_API_URL}/faculty/send-notification`,
        {
          emails: filteredEmails,
          subject,
          content,
        },
        {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }
      );
      setStatus("success");
      setTimeout(() => {
        setShowModal(false);
        setSubject("");
        setContent("");
        setStatus("");
      }, 2000);
    } catch (error) {
      setStatus("error");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowModal(true)}
        className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 transition-all duration-200 flex items-center gap-2"
      >
        <Send className="w-4 h-4" /> Send Notification
      </motion.button>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 mx-4"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
                  Send Notification
                </h2>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg h-32 resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={sending}
                    className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${
                      sending
                        ? "bg-gray-400"
                        : "bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg"
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    {sending ? "Sending..." : "Send"}
                  </motion.button>
                </div>

                {status === "success" && (
                  <p className="text-green-500 text-sm">
                    Notification sent successfully!
                  </p>
                )}
                {status === "error" && (
                  <p className="text-red-500 text-sm">
                    Failed to send notification. Please try again.
                  </p>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationButton;
