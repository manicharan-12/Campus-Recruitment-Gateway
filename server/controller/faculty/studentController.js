const Faculty = require("../../models/Faculty");
const Student = require("../../models/Student");
const University = require("../../models/University");

exports.getFilteredData = async (req, res) => {
  try {
    const query = {
      "academic.university": req.faculty.university,
      "auth.isDeactivated": false,
    };

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    //sorting
    let sortOptions = {};
    if (req.query.sortBy && req.query.sortOrder) {
      const sortField =
        req.query.sortBy === "fullName"
          ? "personal.firstName"
          : req.query.sortBy;

      // Only apply sorting if a direction is specified
      if (req.query.sortOrder === "asc" || req.query.sortOrder === "desc") {
        sortOptions[sortField] = req.query.sortOrder === "asc" ? 1 : -1;
      }
    }

    // Filters
    if (req.query.ageMin || req.query.ageMax) {
      const today = new Date();
      query["personal.dateOfBirth"] = {};
      if (req.query.ageMin) {
        const maxDate = new Date(
          today.getFullYear() - parseInt(req.query.ageMin),
          today.getMonth(),
          today.getDate()
        );
        query["personal.dateOfBirth"].$lte = maxDate;
      }
      if (req.query.ageMax) {
        const minDate = new Date(
          today.getFullYear() - parseInt(req.query.ageMax),
          today.getMonth(),
          today.getDate()
        );
        query["personal.dateOfBirth"].$gte = minDate;
      }
    }

    if (req.query.degreeProgram) {
      const programs = Array.isArray(req.query.degreeProgram)
        ? req.query.degreeProgram
        : [req.query.degreeProgram];
      query["academic.degreeProgram"] = { $in: programs };
    }

    if (req.query.branch) {
      const branches = Array.isArray(req.query.branch)
        ? req.query.branch
        : [req.query.branch];
      query["academic.branch"] = { $in: branches };
    }

    if (req.query.cgpaMin || req.query.cgpaMax) {
      query["academic.cgpa"] = {};
      if (req.query.cgpaMin)
        query["academic.cgpa"].$gte = parseFloat(req.query.cgpaMin);
      if (req.query.cgpaMax)
        query["academic.cgpa"].$lte = parseFloat(req.query.cgpaMax);
    }

    if (req.query.backlogsMin || req.query.backlogsMax) {
      query["academic.backlogs"] = {};
      if (req.query.backlogsMin)
        query["academic.backlogs"].$gte = parseInt(req.query.backlogsMin);
      if (req.query.backlogsMax)
        query["academic.backlogs"].$lte = parseInt(req.query.backlogsMax);
    }

    if (req.query.graduationYear) {
      query["academic.graduationYear"] = parseInt(req.query.graduationYear);
    }

    if (req.query.tenthMin || req.query.tenthMax) {
      query["academic.tenth.percentage"] = {};
      if (req.query.tenthMin)
        query["academic.tenth.percentage"].$gte = parseFloat(
          req.query.tenthMin
        );
      if (req.query.tenthMax)
        query["academic.tenth.percentage"].$lte = parseFloat(
          req.query.tenthMax
        );
    }

    if (req.query.twelfthMin || req.query.twelfthMax) {
      query["academic.twelfth.percentage"] = {};
      if (req.query.twelfthMin)
        query["academic.twelfth.percentage"].$gte = parseFloat(
          req.query.twelfthMin
        );
      if (req.query.twelfthMax)
        query["academic.twelfth.percentage"].$lte = parseFloat(
          req.query.twelfthMax
        );
    }

    if (req.query.isPlaced !== undefined) {
      query["auth.isPlaced"] = req.query.isPlaced === "true";
    }

    // Select fields based on requested columns
    let selection = "";
    if (req.query.columns) {
      const columns = req.query.columns.split(",");
      selection = columns.join(" ");
    }

    // Execute query with pagination and get total count
    const [students, totalCount] = await Promise.all([
      Student.find(query)
        .select(selection || "-auth.password -auth.loginHistory")
        .sort(Object.keys(sortOptions).length > 0 ? sortOptions : { _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(query),
    ]);
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Send response
    res.status(200).json({
      status: "success",
      data: {
        students,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Error in getFilteredData:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.getDegreePrograms = async (req, res) => {
  try {
    const university = await University.findById(req.faculty.university)
      .select("degreePrograms")
      .lean();

    res.status(200).json({
      status: "success",
      data: university.degreePrograms,
    });
  } catch (error) {
    console.error("Error in getDegreePrograms:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
