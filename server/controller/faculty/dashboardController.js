const Faculty = require("../../models/Faculty");
const University = require("../../models/University");

exports.dashboard = async (req, res) => {
  try {
    const facultyId = req.faculty._id;

    const faculty = await Faculty.findById(facultyId)
      .populate("university")
      .lean();

    

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    const university = await University.findById(faculty.university._id)
      .select("name email website address logo")
      .lean();

    return res.status(200).json({
      university,faculty
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({
      message: "Error fetching dashboard data",
      error: error.message,
    });
  }
};
