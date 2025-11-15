// SERVIDOR PROXY PARA WEBHOOK DE META WHATSAPP
const express = require('express');
const app = express();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dvvfvqwpjsyxewqurwhp.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2dmZ2cXdwanN5eGV3cXVyd2hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NDg0MjIsImV4cCI6MjA3ODIyNDQyMn0.5mFXpcv9BephHd2f6uFGEU-5XHLvzaSRqIyyaSwf-Dw';
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Coffee Corner CRM - Webhook Proxy Server',
    timestamp: new Date().toISOString()
  });
});

// GET - Verificación del webhook de Meta
app.get('/webhook', async (req, res) => {
  console.log('📥 GET /webhook - Verificación de Meta');
  console.log('Query params:', req.query);

  try {
    const url = `${SUPABASE_URL}/functions/v1/make-server-d2a6d771/webhook?${new URLSearchParams(req.query)}`;
    console.log('🔄 Reenviando a:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.text();
    console.log('✅ Respuesta de Supabase:', response.status, data);

    res.status(response.status).send(data);
  } catch (error) {
    console.error('❌ Error en verificación:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST - Recibir mensajes entrantes de Meta
app.post('/webhook', async (req, res) => {
  console.log('📥 POST /webhook - Mensaje entrante de Meta');
  console.log('Body:', JSON.stringify(req.body, null, 2));

  try {
    res.status(200).send('EVENT_RECEIVED');

    const url = `${SUPABASE_URL}/functions/v1/make-server-d2a6d771/webhook`;
    console.log('🔄 Reenviando a:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    console.log('✅ Respuesta de Supabase:', response.status, data);
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Webhook Proxy Server corriendo en puerto ${PORT}`);
  console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
  console.log(`🔑 Anon Key configurado: ${SUPABASE_ANON_KEY ? 'Sí' : 'No'}`);
});