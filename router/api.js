import express from "express";
import Tesseract from "tesseract.js";
import OpenAI from "openai";

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "Welcome to the router API!",
        data: {},
    });
});

router.post('/ocr', async (req, res) => {
    const { url, enc_key, command } = req.body;

    if (!url || !enc_key) {
        return res.status(400).json({
            status: "error",
            message: "Please provide a valid URL and encryption key!",
            data: {},
            errors: {
                url: "Please provide a valid URL!",
                enc_key: "Please provide a valid encryption key!",
            }
        });
    }

    const client = new OpenAI({ apiKey: enc_key });

    try {
        const { data: { text } } = await Tesseract.recognize(
            url,
            'eng',
            { logger: m => console.log(m) }
        );

        
        var prompt = command + '\n\n' + text;

        try {
            const chatCompletion = await client.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'gpt-3.5-turbo',
            });

            res.json({
                status: "success",
                message: "Text extracted successfully!",
                data: JSON.parse(chatCompletion.choices[0].message.content),
            });

        } catch (openAIError) {
            console.error("OpenAI Error:", openAIError);
            res.status(500).json({
                status: "error",
                message: "Error communicating with OpenAI!",
                data: {},
            });
        }

    } catch (ocrError) {
        console.error("Tesseract Error:", ocrError);
        res.status(500).json({
            status: "error",
            message: "Error processing image!",
            data: {},
        });
    }
});

export default router;
