import User from "../models/User.js";
import jwt from "jsonwebtoken";

/*
  @desc    Register new user
  @route   POST /api/auth/register
  @access  Public
*/
export const registerUser = async (req, res) => {
  console.log("-> registerUser hit");
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      console.log("-> Register failed: Missing fields");
      return res.status(400).json({
        message: "Please provide all fields",
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      console.log("-> Register failed: User already exists", email);
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    console.log("-> Register success:", user.email);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("-> Register Error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
  @desc    Login user
  @route   POST /api/auth/login
  @access  Public
*/
export const loginUser = async (req, res) => {
  console.log("-> loginUser hit");
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      console.log("-> Login failed: Missing fields");
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      console.log("-> Login failed: User not found", email);
      return res.status(400).json({
        message: "Invalid email",
      });
    }

    if (await user.matchPassword(password)) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      console.log("-> Login success:", user.email);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    } else {
      console.log("-> Login failed: Invalid password for", email);
      res.status(400).json({
        message: "Invalid password",
      });
    }
  } catch (error) {
    console.error("-> Login Error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
  @desc    Get user profile
  @route   GET /api/auth/profile
  @access  Private
*/
export const getUserProfile = async (req, res) => {
  console.log("-> getUserProfile hit");
  const user = await User.findById(req.user._id);

  if (user) {
    console.log("-> Profile fetched for:", user.email);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    console.log("-> Profile failed: User not found");
    res.status(404).json({
      message: "User not found",
    });
  }
};

/*
  @desc    Get all users
  @route   GET /api/auth/users
  @access  Private/Admin
*/
export const getUsers = async (req, res) => {
  console.log("-> getUsers hit (Admin)");
  const users = await User.find({});
  console.log(`-> Fetched ${users.length} users`);
  res.json(users);
};

/*
  @desc    Delete user
  @route   DELETE /api/auth/users/:id
  @access  Private/Admin
*/
export const deleteUser = async (req, res) => {
  console.log("-> deleteUser hit (Admin)");
  const userToDelete = await User.findById(req.params.id);

  if (userToDelete) {
    await userToDelete.deleteOne();
    console.log("-> User removed:", userToDelete.email);
    res.json({ message: "User removed" });
  } else {
    console.log("-> Delete failed: User not found");
    res.status(404).json({ message: "User not found" });
  }
};

/*
  @desc    Get user by ID
  @route   GET /api/auth/users/:id
  @access  Private/Admin
*/
export const getUserById = async (req, res) => {
  console.log("-> getUserById hit (Admin)");
  const user = await User.findById(req.params.id).select("-password");
  if (user) {
    console.log("-> User found:", user.email);
    res.json(user);
  } else {
    console.log("-> User not found");
    res.status(404).json({ message: "User not found" });
  }
};

/*
  @desc    Update user
  @route   PUT /api/auth/users/:id
  @access  Private/Admin
*/
export const updateUser = async (req, res) => {
  console.log("-> updateUser hit (Admin)");
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.role) {
      user.role = req.body.role;
    }

    const updatedUser = await user.save();
    console.log("-> User updated:", updatedUser.email);

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    console.log("-> Update failed: User not found");
    res.status(404).json({ message: "User not found" });
  }
};
