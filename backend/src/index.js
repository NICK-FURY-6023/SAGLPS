require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');

const authRoutes = require('./routes/auth');
const templateRoutes = require('./routes/templates');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // Broadcast to all OTHER connected clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === client.OPEN) {
        client.send(message);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Ganpati Label Print System backend running on port ${PORT}`);
});

// Graceful shutdown
function shutdown() {
  console.log('Shutting down gracefully...');
  wss.close(() => {
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
