const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const cors = require('cors');
const imageProcess = require('./routes/Generate'); 

const app = express();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash',
  temperature: 7
});

app.use('/api/generate-caption', imageProcess);

app.post('/api/', async (req, res) => {
  const { prompt } = req.body;

  try {
    const result = await model.generateContentStream(prompt);

    res.setHeader('Content-Type', 'text/plain');
    for await (const chunk of result.stream) {
      const chunkText = await chunk.text();
      res.write(chunkText);
    }
    res.end();
  } catch (err) {
    console.error('Error generating content:', err);
    res.status(500).send('Error generating content');
  }
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
