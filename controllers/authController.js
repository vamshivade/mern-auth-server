import User from "../models/User.js";
import jwt from "jsonwebtoken";

/*
  @desc    Register new user
  @route   POST /api/auth/register
  @access  Public
*/
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide all fields",
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const loginUser = async (req, res) => {
  console.log("login hit");

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "all fields are required",
      });
    }

    const userExists = await User.findOne({ email });

    if (!userExists) {
      return res.status(400).json({
        message: "user not found",
      });
    }

    const isPasswordValid = await userExists.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "invalid credentials",
      });
    }

    const token = jwt.sign({ id: userExists._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      _id: userExists._id,
      name: userExists.name,
      email: userExists.email,
      token,
    });
  } catch (error) {
    console.log("error in login", error);
    res.status(500).json({
      message: "server error",
    });
  }
};

/*
  @desc    Get user profile
  @route   GET /api/auth/profile
  @access  Private
*/
export const getUserProfile = async (req, res) => {
  console.log("req.user:", req.user);
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    res.json(req.user);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
