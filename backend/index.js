// backend/server.js (or whatever your backend entry file is)
import dotenv from 'dotenv';
import express from 'express';
import fetch from 'node-fetch'; // Make sure you have node-fetch installed: npm install node-fetch
import cors from 'cors';
import OpenAI from 'openai';
import fs from "fs";

dotenv.config(); // Load environment variables from .env file

const app = express();
// Ensure this port is different from your React app's development port (default 5173 for Vite)
const PORT = process.env.PORT || 3001;
const openai = new OpenAI();



//const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Middleware
app.use(cors()); // Allows your frontend to make requests to this backend
app.use(express.json()); // Parses incoming JSON requests

// Routes
app.post('/api/generate', async (req, res) => {
    const prompt = `A glass bowl with the following fruits: ${req.body.prompt}`;
    //const prompt = req.body.prompt;
    console.log('Received prompt:', prompt);

    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is missing in request body.' });
    }

    try {
        const response = await openai.images.generate({
            model: "dall-e-2", // DALL·E 2 támogatja a base64 kimenetet
            prompt,
            n: 1,
            size: "512x512",
            response_format: "b64_json", // FONTOS!
        });

        const image_base64 = response.data[0].b64_json;
        if (!image_base64) {
            throw new Error("Image generation did not return base64 data.");
        }

        // Visszaküldjük base64-ként
        res.json({ imageBase64: image_base64 });
        console.log("Generated and sent base64 image.");

    } catch (error) {
        console.error("Image generation error:", error.message);
        res.status(500).json({ error: 'Failed to generate image', details: error.message });
    }
});



// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).send('OK');
});

// Example: Countries API (if you decide to use it)
app.get('/api/countries', async (req, res) => {
    try {
        const response = await fetch('https://www.apicountries.com/countries');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("Error fetching countries:", err);
        res.status(500).json({ error: 'Failed to fetch countries', details: err.message });
    }
});

// Example: Form submission
app.post('/api/form', (req, res) => {
    const formData = req.body;
    console.log("Received form data: ", formData);
    res.status(200).json({ message: 'Data received successfully' });
});


// Start the server
app.listen(PORT, '0.0.0.0', () => { // 0.0.0.0 makes it accessible from network, localhost is also fine
    console.log(`Backend server running on http://localhost:${PORT}`);
});