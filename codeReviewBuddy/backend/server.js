import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import codeRoutes from './routes/codeRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import { createTerminal } from './controllers/terminalController.js';
import FileSystemWatcher from './controllers/fileWatcher.js';

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
app.use('/api/files', fileRoutes);

const fileWatcher = new FileSystemWatcher(io);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('create-terminal', async () => {
    await createTerminal(socket);
    // Start watching for file changes after terminal is created
    setTimeout(() => {
      fileWatcher.startWatching(socket.id, socket);
    }, 3000);
  });
  
  socket.on('start-file-watching', () => {
    fileWatcher.startWatching(socket.id, socket);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    fileWatcher.stopWatching(socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});