import { createContainer, executeCommand, cleanupContainer } from './dockerManager.js';

const terminals = new Map();

export const createTerminal = async (socket) => {
  try {
    const sessionId = socket.id;
    
    socket.emit('terminal-output', `🐳 Initializing secure sandbox environment...\r\n`);
    
    // Create Docker container for this session
    const container = await createContainer(sessionId);
    
    terminals.set(sessionId, {
      container,
      currentDir: '/workspace'
    });
    
    socket.emit('terminal-output', `✅ Sandbox ready! You're in an isolated environment.\r\n`);
    socket.emit('terminal-output', `📁 Working directory: /workspace\r\n`);
    socket.emit('terminal-output', `🛡️ Safe to run any commands - they won't affect the host system.\r\n\r\n`);
    socket.emit('terminal-output', `$ `);
    
  } catch (error) {
    console.error('Error creating terminal:', error);
    socket.emit('terminal-output', `❌ Error creating sandbox: ${error.message}\r\n`);
    socket.emit('terminal-output', `$ `);
  }
  
  socket.on('terminal-input', async (data) => {
    const command = data.trim();
    const sessionId = socket.id;
    
    if (command === '\r' || command === '') {
      socket.emit('terminal-output', '\r\n$ ');
      return;
    }
    
    socket.emit('terminal-output', `\r\n`);
    
    try {
      const terminalInfo = terminals.get(sessionId);
      if (!terminalInfo) {
        socket.emit('terminal-output', `❌ Sandbox not available\r\n$ `);
        return;
      }
      
      // Handle cd command specially to track directory
      if (command.startsWith('cd ')) {
        const newDir = command.substring(3).trim() || '/workspace';
        const fullCommand = `cd ${newDir} && pwd`;
        
        const output = await executeCommand(sessionId, fullCommand);
        const lines = output.trim().split('\n');
        const newPath = lines[lines.length - 1];
        
        if (newPath.startsWith('/workspace')) {
          terminalInfo.currentDir = newPath;
          socket.emit('terminal-output', `📁 ${newPath}\r\n`);
        } else {
          socket.emit('terminal-output', `❌ Access denied: Can only navigate within /workspace\r\n`);
        }
      } else {
        // Execute command in container
        const fullCommand = `cd ${terminalInfo.currentDir} && ${command}`;
        const output = await executeCommand(sessionId, fullCommand);
        socket.emit('terminal-output', output);
      }
      
    } catch (error) {
      socket.emit('terminal-output', `❌ Error: ${error.message}\r\n`);
    }
    
    socket.emit('terminal-output', `$ `);
  });
  
  socket.on('disconnect', async () => {
    const sessionId = socket.id;
    console.log(`Cleaning up container for session: ${sessionId}`);
    
    await cleanupContainer(sessionId);
    terminals.delete(sessionId);
  });
};