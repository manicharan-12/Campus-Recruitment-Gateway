import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import StudentSidebar from "../components/Global/Sidebar/StudentSidebar";
const StudentLayout = ({ children }) => {
  const isOpen = useSelector((state) => state.studentSidebar.isOpen);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar />
      <motion.main
        className="flex-1 p-6"
        initial={false}
        animate={{
          marginLeft: isOpen ? "240px" : "60px",
          width: `calc(100% - ${isOpen ? "240px" : "60px"})`,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.main>
    </div>
  );
};

export default StudentLayout;
