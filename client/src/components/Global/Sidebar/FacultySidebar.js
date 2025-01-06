import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "../../../redux/facultySidebarSlice";

const FacultySidebar = () => {
  const isOpen = useSelector((state) => state.facultySidebar.isOpen);
  const dispatch = useDispatch();

  const menuItems = [
    { icon: "👥", label: "Classes", count: 4 },
    { icon: "📊", label: "Gradebook" },
    { icon: "🕒", label: "Office Hours", count: 2 },
    { icon: "📑", label: "Curriculum" },
    { icon: "🔬", label: "Research", count: 3 },
  ];

  return (
    <motion.div
      className="fixed left-0 top-0 h-screen bg-white text-gray-800 p-4 flex flex-col shadow-lg"
      initial={{ width: "60px" }}
      animate={{ width: isOpen ? "240px" : "60px" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <motion.button
        className="self-end mb-8 bg-gray-200 rounded-full p-2"
        onClick={() => dispatch(toggleSidebar())}
        whileHover={{ scale: 1.1, rotate: 180 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? "←" : "→"}
      </motion.button>
      {menuItems.map((item, index) => (
        <motion.div
          key={index}
          className="flex items-center mb-6 cursor-pointer group"
          whileHover={{ x: 10, color: "#10B981" }}
        >
          <motion.span
            className="text-2xl mr-4 bg-gray-100 rounded-full p-2"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            {item.icon}
          </motion.span>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="flex justify-between items-center w-full"
              >
                <span className="text-lg">{item.label}</span>
                {item.count !== undefined && (
                  <motion.span
                    className="bg-green-500 text-white rounded-full px-2 py-1 text-xs"
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
        <div className="text-sm font-semibold">Today's Schedule</div>
        <motion.div
          className="mt-2 h-4 bg-gray-200 rounded"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.7, duration: 1 }}
        >
          <motion.div
            className="h-full bg-green-500 rounded"
            initial={{ width: 0 }}
            animate={{ width: "60%" }}
            transition={{ delay: 1, duration: 0.5 }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default FacultySidebar;
