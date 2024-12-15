const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    temperature: 4
});


const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/', upload.single('image'), async (req, res) => {
    try {
        let imageBuffer;
        let prompt;
        if (req.file) {
            imageBuffer = req.file.buffer;
            prompt = req.body.prompt;
            console.log(prompt);
        } else {
            // Fallback to fetching image from URL
            const imageResp = await fetch(
                'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Palace_of_Westminster_from_the_dome_on_Methodist_Central_Hall.jpg/2560px-Palace_of_Westminster_from_the_dome_on_Methodist_Central_Hall.jpg'
            );
            imageBuffer = await imageResp.arrayBuffer();
        }

        const base64Image = Buffer.from(imageBuffer).toString('base64');

        // Generate content using the model
        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64Image,
                    mimeType: 'image/jpeg',
                },
            },
            prompt,
        ]);

        // Ensure result.response is correct
        const caption = result.response ? result.response.text() : 'No caption generated';
        console.log(caption);
        res.json({ caption });
    } catch (error) {
        console.error('Error generating caption:', error);
        res.status(500).json({ error: 'Failed to generate caption' });
    }
});

module.exports = app;
