const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  pincode: String,
});

const documentSchema = new mongoose.Schema({
  fileUrl: String,
  fileName: String,
  uploadedAt: { type: Date, default: Date.now },
});

const entranceExamSchema = new mongoose.Schema({
  examName: { type: String },
  rank: { type: Number },
});

const placementSchema = new mongoose.Schema({
  company: { type: String },
  role: { type: String },
  ctc: { type: Number },
});

const studentSchema = new mongoose.Schema(
  {
    personal: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      whatsappNumber: { type: String, required: true, trim: true },
      collegeEmail: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
      },
      personalEmail: { type: String, lowercase: true },
      religion: { type: String },
      gender: { type: String, enum: ["Male", "Female", "Other"] },
      caste: {
        type: String,
        enum: [
          "OC",
          "BC-A",
          "BC-B",
          "BC-C",
          "BC-D",
          "BC-E",
          "SC",
          "ST",
          "Other",
        ],
      },
      dateOfBirth: Date,
      address: {
        permanent: addressSchema,
        current: addressSchema,
      },
      photograph: String,
    },

    academic: {
      university: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "University",
        required: true,
      },
      rollNumber: {
        type: String,
        lowercase: true,
        unique: true,
      },
      collegeName: String,
      degreeProgram: String,
      branch: String,
      section: { type: String },
      cgpa: Number,
      backlogs: { type: Number, default: 0 },
      graduationYear: { type: Number },
      tenth: {
        percentage: Number,
        boardName: String,
        passingYear: Number,
      },
      twelfth: {
        percentage: Number,
        boardName: String,
        passingYear: Number,
      },
      entranceExams: [entranceExamSchema],
    },

    professional: {
      experience: [
        {
          company: String,
          role: String,
          duration: String,
        },
      ],
      skills: [String],
      certifications: [
        {
          name: String,
          authority: String,
          link: String,
        },
      ],
    },

    documents: {
      aadhar: {
        number: String,
        document: documentSchema,
      },
      pan: {
        number: { type: String, uppercase: true },
        document: documentSchema,
      },
    },

    family: {
      father: {
        name: String,
        occupation: String,
        contact: String,
      },
      mother: {
        name: String,
        occupation: String,
        contact: String,
      },
      annualIncome: Number,
    },
    placement: {
      isPlaced: { type: Boolean, default: false },
      offers: [placementSchema],
    },

    social: {
      linkedin: String,
      github: String,
      resume: String,
      extracurricular: [String],
    },

    auth: {
      password: { type: String, required: true },
      isProfileComplete: { type: Boolean, default: false },
      status: {
        type: String,
        enum: ["active", "inactive", "suspended"],
        default: "active",
      },
      role: {
        type: String,
        enum: ["Student"],
        default: "Student",
      },
      lastLogin: Date,
      loginHistory: [Date],
      registeredAt: { type: Date, default: Date.now },
      lastPasswordChange: Date,
      isDeactivated: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
studentSchema.index({ "personal.collegeEmail": 1 });
studentSchema.index(
  { "academic.university": 1, "academic.rollNumber": 1 },
  { unique: true }
);

// Password hashing middleware
studentSchema.pre("save", async function (next) {
  if (!this.isModified("auth.password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.auth.password = await bcrypt.hash(this.auth.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Login timestamp method
studentSchema.methods.recordLogin = async function () {
  this.auth.lastLogin = new Date();
  this.auth.loginHistory = (this.auth.loginHistory || []).concat([
    this.auth.lastLogin,
  ]);
  await this.save();
};

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
