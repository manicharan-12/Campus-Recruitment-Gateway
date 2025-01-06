import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "../../../redux/studentSidebarSlice";

const StudentSidebar = () => {
  const isOpen = useSelector((state) => state.studentSidebar.isOpen);
  const dispatch = useDispatch();

  const menuItems = [
    { icon: "📚", label: "Courses", count: 5 },
    { icon: "📝", label: "Assignments", count: 3 },
    { icon: "🏆", label: "Grades" },
    { icon: "💬", label: "Messages", count: 2 },
    { icon: "⚙️", label: "Settings" },
  ];

  return (
    <motion.div
      className="fixed left-0 top-0 h-screen bg-white text-gray-800 p-4 flex flex-col shadow-lg"
      initial={{ width: "60px" }}
      animate={{ width: isOpen ? "240px" : "60px" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <motion.button
        className="self-end mb-8 text-2xl"
        onClick={() => dispatch(toggleSidebar())}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? "✖" : "☰"}
      </motion.button>
      {menuItems.map((item, index) => (
        <motion.div
          key={index}
          className="flex items-center mb-6 cursor-pointer group"
          whileHover={{ scale: 1.05, color: "#3B82F6" }}
        >
          <span className="text-2xl mr-4">{item.icon}</span>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex justify-between items-center w-full"
              >
                <span className="text-lg">{item.label}</span>
                {item.count !== undefined && (
                  <motion.span
                    className="bg-blue-500 text-white rounded-full px-2 py-1 text-xs"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {item.count}
                  </motion.span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
      <motion.div
        className="mt-auto bg-gray-100 rounded-lg p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-sm font-semibold">Study Streak</div>
        <div className="flex mt-2">
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              className="w-4 h-4 bg-blue-500 rounded-full mr-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7 + i * 0.1 }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StudentSidebar;
