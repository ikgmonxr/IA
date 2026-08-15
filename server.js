const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint principal para hacerle preguntas a la IA
app.post('/api/preguntar', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Falta el campo 'prompt'" });
    }

    try {
        // Aquí puedes conectar tu API usando fetch a un servicio como OpenRouter o Groq
        // Ejemplo utilizando fetch nativo de Node.js a un proveedor externo:
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.AI_API_KEY}`, // Lo configuras en las variables de entorno de Render
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "mistralai/mixtral-8x7b-instruct", // Un modelo sumamente potente y flexible
                messages: [{ role: "user", content: prompt }]
            })
        });

        const data = await response.json();
        const respuestaIA = data.choices[0].message.content;

        res.json({ success: true, respuesta: respuestaIA });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Error al procesar la solicitud con la IA" });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
