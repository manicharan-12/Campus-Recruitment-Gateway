const jwt = require("jsonwebtoken");

const verifyTokenAndRole = () => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized User" });
    }
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { id, role } = decoded;
      if (role !== "Super Admin" && role !== "Admin") {
        console.log("Invalid role");
        return res.status(401).json({ message: "Unauthorized Access" });
      }
      req.user = { id };
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Invalid Access" });
    }
  };
};

module.exports = verifyTokenAndRole;
