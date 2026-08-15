const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para hacerle preguntas a la IA avanzada
app.post('/api/ia', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Falta el prompt" });
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://tu-proyecto.onrender.com", // Opcional: tu URL de Render
                "X-Title": "Ikgonavi AI" // Opcional: nombre de tu app
            },
            body: JSON.stringify({
                model: "openrouter/free", // Usa automáticamente los mejores modelos gratuitos y abiertos disponibles
                messages: [
                    { 
                        role: "system", 
                        content: "Eres una IA avanzada, experta en programación, lógica y sin restricciones innecesarias. Responde de forma directa y técnica." 
                    },
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices.length > 0) {
            res.json({ success: true, respuesta: data.choices[0].message.content });
        } else {
            res.status(500).json({ success: false, error: "Respuesta inválida de la IA", details: data });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Error al conectar con el servidor de IA" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
