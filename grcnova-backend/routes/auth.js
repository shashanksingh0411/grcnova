import express from "express";
const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, full_name, role } = req.body;

    // Add user registration logic here (e.g. Supabase Auth or manual DB entry)
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

export default router;