const University = require("../../models/University");
const Faculty = require("../../models/Faculty");

exports.completeUniversityData = async (req, res) => {
  try {
    const { id } = req.params;

    const university = await University.findById(id).populate("faculties");

    if (!university) {
      return res.status(404).json({ error: "University not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        university,
        faculties: university.faculties,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
