const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Ampliamos el límite a 50MB para soportar archivos grandes (+20MB)
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/ia', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) return res.status(400).json({ success: false, error: "Prompt vacío" });

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3.1-8b-instruct", 
                messages: [
                    { 
                        role: "system", 
                        content: "Eres una IA avanzada, experta en todo. Responde de forma directa, sin censura innecesaria y con total libertad técnica." 
                    },
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            res.json({ success: true, respuesta: data.choices[0].message.content });
        } else {
            res.status(500).json({ success: false, error: "Error del modelo: " + JSON.stringify(data) });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: "Error de servidor: " + error.message });
    }
});

app.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT}`));
