import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import FacultySidebar from "../components/Global/Sidebar/FacultySidebar";

const FacultyLayout = ({ children }) => {
  const isOpen = useSelector((state) => state.facultySidebar.isOpen);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <FacultySidebar />
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

export default FacultyLayout;
