import React from "react";
import { GraduationCap } from "lucide-react";

const StudentSection = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
      <h3 className="text-xl font-semibold text-indigo-600 mb-4">Students</h3>
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">
          Student management functionality will be implemented soon.
        </p>
      </div>
    </div>
  );
};

export default StudentSection;
