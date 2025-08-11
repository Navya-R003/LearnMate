const express = require("express"); 

const cors = require("cors"); 

const multer = require("multer"); 

const path = require("path"); 

const fs = require("fs"); 

const { GoogleGenerativeAI } = require("@google/generative-ai"); 

const app = express(); 

const PORT = 3000; 

// ✅ Replace with your real Gemini API Key 

const GEMINI_API_KEY = "AIzaSyD_ut8-DNN-tr444gfiINZfD9ZnQL9m-3s"; 

// ✅ Initialize Gemini SDK 

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY); 

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 

// ✅ Middleware 

app.use(cors()); 

app.use(express.json()); 

app.use(express.static(path.join(__dirname, "public"))); // Serves index.html 

// ✅ Create uploads folder if not exists 

const uploadDir = path.join(__dirname, "uploads"); 

if (!fs.existsSync(uploadDir)) { 

fs.mkdirSync(uploadDir); 

} 

// ✅ Multer setup for image uploads 

const storage = multer.diskStorage({ 

destination: (req, file, cb) => cb(null, "uploads/"), 

filename: (req, file, cb) => 

cb(null, Date.now() + path.extname(file.originalname)), 

}); 

const upload = multer({ storage }); 

// ✅ Route: AI chat via Gemini 

app.post("/chat", async (req, res) => { 

const { question } = req.body; 

console.log(" Received question:", question); 

if (!question || typeof question !== "string") { 

console.warn("Invalid question format."); 

return res.status(400).json({ answer: "Invalid input" }); 

} 

try { 

const result = await model.generateContent(question); 

const response = await result.response; 

const text = response.text(); 

console.log("Gemini Answer:", text); 

res.json({ answer: text }); 

} catch (err) { 

console.error("Gemini API Error:", err); 

res.status(500).json({ answer: "Error from Gemini AI" }); 

} 

}); 

// ✅ Route: Image Upload 

app.post("/upload-image", upload.single("image"), (req, res) => { 

const file = req.file; 

if (!file) { 

console.warn("No file received."); 

return res.status(400).json({ answer: "No image uploaded." }); 

} 

console.log("Image received:", file.originalname); 

res.json({ answer: `Image received: ${file.originalname}` }); 

}); 

// ✅ Start Server 

app.listen(PORT, () => { 

console.log(` Server running at http://localhost:${PORT}`); 

});