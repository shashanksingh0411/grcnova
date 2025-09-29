// backend_server/index.js
import express from "express";
import multer from "multer";
import fs from "fs";
import pdfParse from "pdf-parse";

const app = express();
const PORT = 5000;

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

// Upload + Parse PDF route
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Read the uploaded file
    const dataBuffer = fs.readFileSync(req.file.path);

    // Parse PDF
    const pdfData = await pdfParse(dataBuffer);

    // Optionally cleanup uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      numPages: pdfData.numpages,
      info: pdfData.info,
      text: pdfData.text.substring(0, 500) + "...", // send preview
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to process PDF" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
