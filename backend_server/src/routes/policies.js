import express from "express";
import { supabase } from "../supabase.js"; // your Supabase client

const router = express.Router();

// 1️⃣ Get all policies
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("uploaded_policies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching policies:", err);
    res.status(500).json({ error: "Failed to fetch policies", details: err.message });
  }
});

// 2️⃣ Get single policy by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from("uploaded_policies")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("❌ Error fetching policy:", err);
    res.status(500).json({ error: "Failed to fetch policy", details: err.message });
  }
});

// 3️⃣ Update policy metadata
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body; // e.g., { title: "...", framework: "...", content: "..." }

  try {
    const { data, error } = await supabase
      .from("uploaded_policies")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;
    res.json({ message: "Policy updated successfully", policy: data[0] });
  } catch (err) {
    console.error("❌ Error updating policy:", err);
    res.status(500).json({ error: "Failed to update policy", details: err.message });
  }
});

// 4️⃣ Delete a policy
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // 1️⃣ Get file info from DB
    const { data: policyData, error: fetchError } = await supabase
      .from("uploaded_policies")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // 2️⃣ Delete file from Supabase Storage
    const filePath = policyData.file_url.split("/storage/v1/object/public/policies/")[1];
    if (filePath) {
      const { error: storageError } = await supabase
        .storage
        .from("policies")
        .remove([filePath]);

      if (storageError) console.warn("⚠️ File deletion warning:", storageError.message);
    }

    // 3️⃣ Delete from DB
    const { error: dbError } = await supabase
      .from("uploaded_policies")
      .delete()
      .eq("id", id);

    if (dbError) throw dbError;

    res.json({ message: "Policy deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting policy:", err);
    res.status(500).json({ error: "Failed to delete policy", details: err.message });
  }
});

export default router;
