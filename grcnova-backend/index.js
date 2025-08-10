import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js"; // ✅

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes); // ✅ Mounting /api/auth prefix

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});