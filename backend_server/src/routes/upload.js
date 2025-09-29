// backend_server/src/routes/upload.js
import express from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import fs from "fs";
import path from "path";
import { supabase } from "../supabase.js"; // Adjust if supabase.js is elsewhere

const router = express.Router();

// Multer setup with absolute uploads folder
const uploadFolder = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

const upload = multer({ dest: uploadFolder });

// Helper: Detect framework from extracted text
function detectFramework(text) {
  const lower = text.toLowerCase();
  if (lower.includes("annex a") || lower.includes("iso/iec 27001")) return "ISO 27001";
  if (lower.includes("gdpr") || lower.includes("article")) return "GDPR";
  if (lower.includes("trust services criteria") || lower.includes("soc 2")) return "SOC 2";
  if (lower.includes("hipaa") || lower.includes("phi") || lower.includes("covered entity")) return "HIPAA";
  if (lower.includes("nist") || lower.includes("800-53") || lower.includes("csf")) return "NIST";
  return "Unknown";
}

// Upload route
router.post("/", upload.single("file"), async (req, res) => {
  const file = req.file;
  const { user_id } = req.body;

  if (!file) return res.status(400).json({ error: "No file uploaded" });

  console.log("✅ File received:", file.originalname, "size:", file.size, "bytes");

  try {
    // 1️⃣ Extract text from PDF or DOCX
    let extractedText = "";
    if (file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(path.resolve(file.path));
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ path: path.resolve(file.path) });
      extractedText = result.value;
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    console.log("✅ Text extraction done, length:", extractedText.length);

    // 2️⃣ Detect framework
    const framework = detectFramework(extractedText);
    console.log("✅ Detected framework:", framework);

    // 3️⃣ Upload to Supabase Storage
    const fileBuffer = fs.readFileSync(path.resolve(file.path));
    const supabaseFileName = `uploads/${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("policies")
      .upload(supabaseFileName, fileBuffer, { contentType: file.mimetype, upsert: true });

    if (uploadError) {
      console.error("❌ Supabase upload error:", uploadError);
      return res.status(500).json({ error: "Supabase bucket upload failed", details: uploadError.message });
    }

    console.log("✅ Supabase upload successful:", uploadData);

    // 4️⃣ Get public URL
    const { data: publicUrlData, error: publicUrlError } = supabase.storage
      .from("policies")
      .getPublicUrl(supabaseFileName);

    if (publicUrlError) {
      console.error("❌ Error getting public URL:", publicUrlError);
      return res.status(500).json({ error: "Failed to get public URL", details: publicUrlError.message });
    }

    const fileUrl = publicUrlData.publicUrl;
    console.log("✅ Public URL:", fileUrl);

    // 5️⃣ Insert metadata into Supabase DB
    const { error: dbError } = await supabase.from("uploaded_policies").insert([
      {
        file_name: file.originalname,
        file_url: fileUrl,
        mime_type: file.mimetype,
        file_size: file.size,
        extracted_text: extractedText,
        uploaded_by: user_id || null,
        framework: framework,
        title: file.originalname,
        content: extractedText,
      },
    ]);

    if (dbError) {
      console.error("❌ Database insert error:", dbError);
      return res.status(500).json({ error: "DB insert failed", details: dbError.message });
    }

    console.log("✅ Database insert successful");

    // 6️⃣ Respond to client
    return res.json({
      message: "File uploaded successfully",
      fileUrl,
      framework,
      extractedText: extractedText.substring(0, 500) + (extractedText.length > 500 ? "..." : ""),
    });
  } catch (err) {
    console.error("❌ Unexpected upload error:", err);
    return res.status(500).json({ error: "Unexpected server error", details: err.message });
  } finally {
    // 7️⃣ Remove temp file
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
        console.log("✅ Temp file deleted");
      }
    } catch (unlinkErr) {
      console.error("❌ Error deleting temp file:", unlinkErr);
    }
  }
});

export default router;
