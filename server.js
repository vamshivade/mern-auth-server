import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: "https://mern-auth-client-lyart.vercel.app", // Later replace with Vercel URL
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Auth Server Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
