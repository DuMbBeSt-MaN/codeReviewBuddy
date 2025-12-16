import { createContainer, executeCommand, cleanupContainer, getContainer } from './dockerManager.js';

const terminals = new Map();
const sharedContainers = new Map(); // workspace -> container mapping

// File-modifying commands that should trigger file explorer refresh
const FILE_COMMANDS = ['touch', 'echo', 'cat', 'cp', 'mv', 'rm', 'mkdir', 'rmdir', 'nano', 'vim', 'vi'];

const shouldRefreshFiles = (command) => {
  return FILE_COMMANDS.some(cmd => command.trim().startsWith(cmd)) || 
         command.includes('>') || command.includes('>>');
};

// Get or create shared container for workspace
const getSharedContainer = async (workspaceId) => {
  if (!sharedContainers.has(workspaceId)) {
    const container = await createContainer(workspaceId);
    sharedContainers.set(workspaceId, container);
  }
  return sharedContainers.get(workspaceId);
};

export const createTerminal = async (socket) => {
  try {
    const sessionId = socket.id;
    const workspaceId = 'shared-workspace'; // Single shared workspace
    
    socket.emit('terminal-output', `🐳 Connecting to workspace...\r\n`);
    
    // Get or create shared container for workspace
    const container = await getSharedContainer(workspaceId);
    
    terminals.set(sessionId, {
      container,
      workspaceId,
      currentDir: '/workspace'
    });
    
    socket.emit('terminal-output', `✅ Connected to shared workspace!\r\n`);
    socket.emit('terminal-output', `📁 Working directory: /workspace\r\n`);
    socket.emit('terminal-output', `🛡️ All files are shared across the workspace.\r\n\r\n`);
    socket.emit('terminal-output', `$ `);
    
  } catch (error) {
    console.error('Error creating terminal:', error);
    socket.emit('terminal-output', `❌ Error connecting to workspace: ${error.message}\r\n`);
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
        // Execute command in shared container
        const fullCommand = `cd ${terminalInfo.currentDir} && ${command}`;
        const output = await executeCommand(terminalInfo.workspaceId, fullCommand);
        socket.emit('terminal-output', output);
        
        // Notify file explorer if command might have changed files
        if (shouldRefreshFiles(command)) {
          setTimeout(() => {
            socket.emit('files-changed-from-terminal');
          }, 500);
        }
      }
      
    } catch (error) {
      socket.emit('terminal-output', `❌ Error: ${error.message}\r\n`);
    }
    
    socket.emit('terminal-output', `$ `);
  });
  
  socket.on('disconnect', async () => {
    const sessionId = socket.id;
    console.log(`Terminal session disconnected: ${sessionId}`);
    
    // Only remove terminal session, keep shared container running
    terminals.delete(sessionId);
  });
};