import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  console.log("Protect middleware called");

  let token;

  // Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token
      token = req.headers.authorization.split(" ")[1];
      console.log("Token:", token);

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user (without password)
      req.user = await User.findById(decoded.id).select("-password");

      return next();
    } catch (error) {
      console.error(error);

      return res.status(401).json({
        message: "Not authorized, token failed",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      message: "Not authorized, no token",
    });
  }
};

export default protect;
