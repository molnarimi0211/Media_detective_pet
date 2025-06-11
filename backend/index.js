import dotenv from 'dotenv';
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());


app.get('/api/countries', async (req, res) => {
  try {
    const response = await fetch('https://www.apicountries.com/countries');
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
});

app.post('/api/form', (req, res) => {
  const formData = req.body;
  console.log("Recieved form data: ", formData);
  res.status(200).json({ message: 'Data recieved successfully' });
});

app.post('/api/generate', (req, res) => {
  const genWords = req.body;
  console.log("Words to generate from: ", genWords);
  res.status(200).json({ message: 'Data recieved successfully' });
})

app.listen(3000, () => {
  console.log('Proxy server running on http://localhost:3000');
});
