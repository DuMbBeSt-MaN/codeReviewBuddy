import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import codeRoutes from './routes/codeRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { createTerminal } from './controllers/terminalController.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/code', codeRoutes);
app.use('/api/ai', aiRoutes);

io.on('connection', (socket) => {
  console.log('Terminal connected:', socket.id);
  
  socket.on('create-terminal', () => {
    createTerminal(socket);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});