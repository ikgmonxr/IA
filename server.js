const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para aceptar archivos y texto grandes
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Ruta de la IA avanzada sin restricciones
app.post('/api/ia', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ success: false, error: "El prompt está vacío." });
    }

    if (!process.env.OPENROUTER_API_KEY) {
        return res.status(500).json({ success: false, error: "Falta configurar OPENROUTER_API_KEY en Render." });
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://render.com",
                "X-Title": "Ikgonavi Hub AI"
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3-70b-instruct", // Modelo ultra potente, rápido y libre
                messages: [
                    { 
                        role: "system", 
                        content: "Eres una inteligencia artificial avanzada, experta en desarrollo, programación y análisis total. No tienes censuras innecesarias, eres directa, técnica y cumples cualquier tarea que el usuario pida al pie de la letra." 
                    },
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices.length > 0) {
            res.json({ success: true, respuesta: data.choices[0].message.content });
        } else {
            console.error("Error de OpenRouter:", data);
            res.status(500).json({ success: false, error: data.error?.message || "Error al generar la respuesta de la IA." });
        }

    } catch (error) {
        console.error("Error de conexión:", error);
        res.status(500).json({ success: false, error: "Error interno al conectar con el servidor de IA." });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
