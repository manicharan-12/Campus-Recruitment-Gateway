const { Student } = require("../../models/Student");
const University = require("../../models/University");
const Faculty = require("../../models/Faculty");

const getAcademicYearRange = (year) => {
  return {
    start: new Date(`${year}-06-01`),
    end: new Date(`${year + 1}-05-31`),
  };
};

exports.getFilters = async (req, res) => {
  try {
    const facultyId = req.faculty._id; // Get faculty ID from auth middleware

    // Get faculty's university
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    const university = await University.findById(faculty.university);
    if (!university) {
      return res.status(404).json({ error: "University not found" });
    }

    // Find all graduation years from students in this university
    const graduationYears = await Student.distinct("academic.graduationYear", {
      "academic.university": faculty.university,
    });

    // Sort graduation years in descending order (most recent first)
    graduationYears.sort((a, b) => b - a);

    const filters = {
      degreePrograms: university.degreePrograms.map((prog) => prog.programName),
      branches: university.degreePrograms.flatMap((prog) =>
        prog.branches.map((branch) => branch.name)
      ),
      sections: university.degreePrograms.flatMap((prog) =>
        prog.branches.flatMap((branch) => branch.sections)
      ),
      graduationYears: graduationYears,
    };

    return res.json(filters);
  } catch (error) {
    console.error("Filter Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const facultyId = req.faculty._id; // Assuming faculty ID is set in auth middleware
    const { degreeProgram, branch, section, graduationYear } = req.query;

    // Get faculty's university
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    // Base query using faculty's university
    let query = {
      "academic.university": faculty.university,
    };

    // Add filters if provided
    if (degreeProgram) query["academic.degreeProgram"] = degreeProgram;
    if (branch) query["academic.branch"] = branch;
    if (section) query["academic.section"] = section;
    if (graduationYear)
      query["academic.graduationYear"] = parseInt(graduationYear);

    // Get all students matching the filters
    const students = await Student.find(query);

    // Get all graduation years for filtered students
    const graduationYears = [
      ...new Set(students.map((s) => s.academic.graduationYear)),
    ].sort();

    // Placement statistics by year
    const placementStats = {};

    // Initialize stats for each year
    graduationYears.forEach((year) => {
      const yearlyStudents = students.filter(
        (s) => s.academic.graduationYear === year
      );

      const placedStudents = yearlyStudents.filter((s) => s.placement.isPlaced);

      // Calculate package statistics
      const packages = placedStudents
        .flatMap((s) => s.placement.offers)
        .map((o) => o.ctc);

      placementStats[year] = {
        totalStudents: yearlyStudents.length,
        placedStudents: placedStudents.length,
        highestPackage: packages.length ? Math.max(...packages) : 0,
        lowestPackage: packages.length ? Math.min(...packages) : 0,
        medianPackage: packages.length
          ? packages.sort((a, b) => a - b)[Math.floor(packages.length / 2)]
          : 0,
        averagePackage: packages.length
          ? packages.reduce((a, b) => a + b, 0) / packages.length
          : 0,
        offerCount: packages.length,
      };
    });

    // Rest of the analytics code remains the same
    // CGPA Range Analysis
    const cgpaRanges = {
      "< 6.0": students.filter((s) => s.academic.cgpa < 6).length,
      "6.0-6.5": students.filter(
        (s) => s.academic.cgpa >= 6 && s.academic.cgpa < 6.5
      ).length,
      "6.5-7.0": students.filter(
        (s) => s.academic.cgpa >= 6.5 && s.academic.cgpa < 7
      ).length,
      "7.0-7.5": students.filter(
        (s) => s.academic.cgpa >= 7 && s.academic.cgpa < 7.5
      ).length,
      "7.5-8.0": students.filter(
        (s) => s.academic.cgpa >= 7.5 && s.academic.cgpa < 8
      ).length,
      "8.0-8.5": students.filter(
        (s) => s.academic.cgpa >= 8 && s.academic.cgpa < 8.5
      ).length,
      "8.5-9.0": students.filter(
        (s) => s.academic.cgpa >= 8.5 && s.academic.cgpa < 9
      ).length,
      "9.0-9.5": students.filter(
        (s) => s.academic.cgpa >= 9 && s.academic.cgpa < 9.5
      ).length,
      "9.5-10.0": students.filter(
        (s) => s.academic.cgpa >= 9.5 && s.academic.cgpa <= 10
      ).length,
    };

    // Company-wise placement with more detailed statistics
    const companyStats = {};
    const industryStats = {};
    const roleStats = {};

    students.forEach((student) => {
      if (student.placement.offers && student.placement.offers.length > 0) {
        student.placement.offers.forEach((offer) => {
          // Company stats
          companyStats[offer.company] = (companyStats[offer.company] || 0) + 1;

          // Industry stats
          if (offer.industry) {
            industryStats[offer.industry] =
              (industryStats[offer.industry] || 0) + 1;
          }

          // Role stats
          if (offer.role) {
            roleStats[offer.role] = (roleStats[offer.role] || 0) + 1;
          }
        });
      }
    });

    // Backlog statistics with more details
    const backlogCounts = students.map((s) => s.academic.backlogs || 0);
    const backlogStats = {
      withBacklogs: students.filter((s) => s.academic.backlogs > 0).length,
      noBacklogs: students.filter((s) => s.academic.backlogs === 0).length,
      averageBacklogs: backlogCounts.length
        ? backlogCounts.reduce((a, b) => a + b, 0) / backlogCounts.length
        : 0,
      maxBacklogs: backlogCounts.length ? Math.max(...backlogCounts) : 0,
      backlogDistribution: {
        0: students.filter((s) => s.academic.backlogs === 0).length,
        "1-2": students.filter(
          (s) => s.academic.backlogs >= 1 && s.academic.backlogs <= 2
        ).length,
        "3-5": students.filter(
          (s) => s.academic.backlogs >= 3 && s.academic.backlogs <= 5
        ).length,
        "6+": students.filter((s) => s.academic.backlogs >= 6).length,
      },
    };

    // Internship conversion statistics
    const internshipStats = {
      totalInternships: students.filter(
        (s) => s.internships && s.internships.length > 0
      ).length,
      convertedToJob: students.filter(
        (s) => s.internships && s.internships.some((i) => i.convertedToJob)
      ).length,
      conversionRate:
        students.filter((s) => s.internships && s.internships.length > 0)
          .length > 0
          ? (students.filter(
              (s) =>
                s.internships && s.internships.some((i) => i.convertedToJob)
            ).length /
              students.filter((s) => s.internships && s.internships.length > 0)
                .length) *
            100
          : 0,
    };

    return res.json({
      placementStats,
      cgpaRanges,
      companyStats,
      industryStats,
      roleStats,
      backlogStats,
      internshipStats,
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
