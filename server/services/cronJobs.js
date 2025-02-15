// services/cronJobs/profileUpdateReminder.js
const cron = require("node-cron");
const { Student } = require("../models/Student");
const { sendProfileUpdateReminderMail } = require("./emailService");

// Schedule the cron job to run every 15 days
// Runs at 10:00 AM on every 1st and 15th day of the month
exports.scheduleProfileUpdateReminders = () => {
  cron.schedule("0 10 1,15 * *", async () => {
    try {
      console.log("Running profile update reminder cron job...");

      // Find all active students
      const studentsToRemind = await Student.find({
        "auth.status": "active",
        "auth.isDeactivated": false,
      });

      // Send reminders to each student
      for (const student of studentsToRemind) {
        await sendProfileUpdateReminderMail(
          student.personal.collegeEmail,
          student.personal.firstName
        );
        await sendProfileUpdateReminder(
          student.personal.whatsappNumber,
          student.personal.firstName
        );
      }
    } catch (error) {
      console.error("Error in profile update reminder cron job:", error);
    }
  });
};
