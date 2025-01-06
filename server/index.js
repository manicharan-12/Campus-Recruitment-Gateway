require("events").EventEmitter.defaultMaxListeners = 15;
const express = require("express");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const cron = require("node-cron");
require("dotenv").config();

const adminRoutes = require("./routes/admin/adminRoute");
const sharedRoutes = require("./routes/shared/sharedRoute");

const { connectDB } = require("./config/db.js");

const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));
connectDB();

app.use("/admin", adminRoutes);
app.use("/", sharedRoutes);

PORT = 6969;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
