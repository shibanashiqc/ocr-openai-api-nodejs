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
    const { url, enc_key } = req.body;

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

        
        var command = 'please key in the invoice details below: must key json like format output object with all details like company_name, invoice_number, invoice_date, trn_number, gross_amount, vat_amount, total_amount etc.. I need extract Invoice Number	Invoice Date	TRN Number	Company Name	Gross Amount	VAT Amount	Total Amount and i need an  json format output object use like ex: company_name etc. - ';
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
