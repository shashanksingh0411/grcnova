// server.js (ESM version)
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import mammoth from "mammoth";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@supabase/supabase-js";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import path from "path";
import { supabase } from './supabase.js';

const pdfjsLib = pdfjs;
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.static("public"));

// Configure multer with limits and file filter
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "text/plain",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only text, PDF, and Word documents are allowed."), false);
    }
  }
});

// ✅ Helper: extract text from files
async function extractTextFromFile(filePath, mimeType) {
  try {
    if (mimeType === "text/plain") {
      return fs.readFileSync(filePath, "utf8");
    } else if (mimeType === "application/pdf") {
      const data = new Uint8Array(fs.readFileSync(filePath));
      const pdfDoc = await pdfjsLib.getDocument({ data }).promise;
      let textContent = "";
      
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(" ");
        textContent += pageText + "\n";
      }
      
      return textContent;
    } else if (
      mimeType === "application/msword" ||
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error("Text extraction error:", error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
}

// ✅ Helper: Detect framework from text content
function detectFramework(textContent) {
  const content = textContent.toLowerCase();
  
  if (content.includes("gdpr")) return "GDPR";
  if (content.includes("iso") && content.includes("27001")) return "ISO27001";
  if (content.includes("hipaa")) return "HIPAA";
  if (content.includes("soc") && content.includes("2")) return "SOC2";
  if (content.includes("nist")) return "NIST";
  
  return "General";
}

// ✅ Upload and process document
app.post("/api/upload", upload.single("file"), async (req, res) => {
  let fileDeleted = false;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { originalname, mimetype, path: filePath, size } = req.file;

    // Validate file size (additional check)
    if (size > 10 * 1024 * 1024) {
      throw new Error("File size exceeds 10MB limit");
    }

    // 1. Upload file to Supabase storage
    const supabasePath = `${Date.now()}-${originalname.replace(/\s+/g, '_')}`;
    const fileStream = fs.createReadStream(filePath);
    
    const { error: uploadError } = await supabase.storage
      .from("policies")
      .upload(supabasePath, fileStream, {
        cacheControl: "3600",
        upsert: false,
        contentType: mimetype,
      });

    if (uploadError) throw uploadError;

    // 2. Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("policies")
      .getPublicUrl(supabasePath);

    const fileUrl = publicUrlData.publicUrl;

    // 3. Extract text for framework detection
    const textContent = await extractTextFromFile(filePath, mimetype);
    
    // 4. Clean up local file
    fs.unlinkSync(filePath);
    fileDeleted = true;

    // 5. Detect framework
    const framework = detectFramework(textContent);

    // 6. Insert metadata into evidence_files table
    const { data: dbData, error: dbError } = await supabase
      .from("policies")
      .insert([
        {
          id: uuidv4(),
          file_name: originalname,
          file_url: fileUrl,
          framework,
          file_size: size,
          uploaded_by: "system", // later replace with real user auth
        },
      ])
      .select();

    if (dbError) throw dbError;

    // 7. Respond with metadata + extracted text
    res.json({
      message: "File uploaded successfully",
      file: dbData[0],
      extractedContent: textContent.substring(0, 500) + (textContent.length > 500 ? "..." : ""), // Limit response size
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    
    // Clean up file if not already deleted
    if (req.file && !fileDeleted) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting temporary file:", unlinkError);
      }
    }
    
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get all policies
app.get("/api/policies", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("policies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching policies:", error);
    res.status(500).json({ error: "Failed to fetch policies" });
  }
});

// ✅ Get a single policy by ID
app.get("/api/policies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from("policies")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ error: "Policy not found" });
    }

    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching policy:", error);
    res.status(500).json({ error: "Failed to fetch policy" });
  }
});

// ✅ Update a policy
app.put("/api/policies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from("policies")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({ message: "Policy updated successfully", policy: data });
  } catch (error) {
    console.error("❌ Error updating policy:", error);
    res.status(500).json({ error: "Failed to update policy" });
  }
});

// ✅ Delete a policy
app.delete("/api/policies/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // First get the policy to get the file path
    const { data: policy, error: fetchError } = await supabase
      .from("policies")
      .select("file_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Extract the file path from the URL
    const url = new URL(policy.file_url);
    const filePath = url.pathname.split("/").pop();

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("policies")
      .remove([filePath]);

    if (storageError) {
      console.error("Error deleting file from storage:", storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("policies")
      .delete()
      .eq("id", id);

    if (dbError) {
      throw dbError;
    }

    res.json({ message: "Policy deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting policy:", error);
    res.status(500).json({ error: "Failed to delete policy" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));