const mongoose = require("mongoose");
const Faculty = require("../../models/Faculty");
const University = require("../../models/University");
const { generateRandomPassword } = require("../../services/randomPassword");
const {
  sendFacultyAccountCreationMail,
} = require("../../services/emailService");

exports.addFacultyData = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { name, email, role, phoneNumber, universityId } = req.body;

    // Check if faculty exists
    const faculty = await Faculty.findOne({ email });
    if (faculty) {
      return res.status(400).json({ message: "Faculty already exists" });
    }

    const defaultPassword = generateRandomPassword();

    // Create new faculty
    const newFaculty = new Faculty({
      name,
      email,
      role,
      phoneNumber,
      password: defaultPassword,
      university: universityId,
    });
    await newFaculty.save({ session });

    const university = await University.findById(universityId).session(session);
    if (!university) {
      throw new Error(`University not found`);
    }

    // Check if `faculties` array exists and is valid
    if (!Array.isArray(university.faculties)) {
      throw new Error(
        `Faculties array is not initialized for University ID: ${universityId}`
      );
    }

    // Add the faculty to the array
    university.faculties.push(newFaculty._id);
    await university.save({ session });

    // Send email
    await sendFacultyAccountCreationMail(email, defaultPassword, name);

    // Commit transaction
    await session.commitTransaction();

    res
      .status(201)
      .json({ success: true, message: "Faculty added successfully" });
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message, // Include error details for debugging
    });
  } finally {
    session.endSession();
  }
};
