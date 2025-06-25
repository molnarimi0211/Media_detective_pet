import dotenv from 'dotenv';
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import OpenAI from 'openai';



dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3001;
const openai = new OpenAI();



// Middleware
app.use(cors()); // Allows your frontend to make requests to this backend
app.use(express.json()); // Parses incoming JSON requests

// Routes
app.post('/api/generate', async (req, res) => {
  const { words } = req.body;
  if (!Array.isArray(words) || words.length === 0) {
    return res
      .status(400)
      .json({ message: 'Please provide an array of words in the body.' });
  }

  const prompt = `A wooden bowl with the following fruits: ${words.join(', ')}. Make it look realistic`;
  console.log('Full prompt:', prompt);


    if (!prompt) {
        return res.status(400).json({ message: 'Prompt is missing in request body.' });
    }

    try {
      
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt,
            n: 1,
            size: "1024x1024",
            response_format: "b64_json",
        });
      
        const image_base64 = response.data[0].b64_json;
      

        if (!image_base64) {
            throw new Error("Image generation did not return base64 data.");
        }

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