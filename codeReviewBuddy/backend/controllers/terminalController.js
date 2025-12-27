import { createContainer, executeCommand, cleanupContainer, getContainer } from './dockerManager.js';

const terminals = new Map();
const sharedContainers = new Map(); // workspace -> container mapping

// File-modifying commands that should trigger file explorer refresh
const FILE_COMMANDS = ['touch', 'echo', 'cat', 'cp', 'mv', 'rm', 'mkdir', 'rmdir', 'nano', 'vim', 'vi'];

// Allowed commands for security
const ALLOWED_COMMANDS = ['ls', 'cat', 'echo', 'touch', 'mkdir', 'cd', 'pwd', 'cp', 'mv', 'rm', 'grep', 'find', 'head', 'tail', 'wc', 'sort', 'uniq', 'chmod', 'python3', 'node', 'javac', 'java', 'gcc', 'g++', 'make', 'npm', 'pip', 'git'];

const sanitizeCommand = (command) => {
  // Remove dangerous characters and sequences
  const dangerous = [';', '&&', '||', '|', '>', '<', '`', '$', '(', ')', '{', '}', '[', ']', '&', '*', '?', '~', '#', '!'];
  let sanitized = command.trim();
  
  // Check if command starts with allowed command
  const firstWord = sanitized.split(' ')[0];
  if (!ALLOWED_COMMANDS.includes(firstWord)) {
    throw new Error(`Command '${firstWord}' is not allowed`);
  }
  
  // Remove dangerous characters (except for specific safe cases)
  for (const char of dangerous) {
    if (char === '>' && (sanitized.includes('echo') || sanitized.includes('cat'))) continue;
    if (sanitized.includes(char)) {
      throw new Error(`Dangerous character '${char}' not allowed`);
    }
  }
  
  return sanitized;
};

const shouldRefreshFiles = (command) => {
  return FILE_COMMANDS.some(cmd => command.trim().startsWith(cmd)) || 
         command.includes('>');
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
      
      // Sanitize command input
      let sanitizedCommand;
      try {
        sanitizedCommand = sanitizeCommand(command);
      } catch (sanitizeError) {
        socket.emit('terminal-output', `❌ ${sanitizeError.message}\r\n$ `);
        return;
      }
      
      // Handle cd command specially to track directory
      if (sanitizedCommand.startsWith('cd ')) {
        const newDir = sanitizedCommand.substring(3).trim() || '/workspace';
        
        // Validate path is within workspace
        if (!newDir.startsWith('/workspace') && newDir !== '/workspace') {
          socket.emit('terminal-output', `❌ Access denied: Can only navigate within /workspace\r\n$ `);
          return;
        }
        
        const fullCommand = `cd "${newDir}" && pwd`;
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
        // Execute sanitized command in shared container
        const fullCommand = `cd "${terminalInfo.currentDir}" && ${sanitizedCommand}`;
        const output = await executeCommand(terminalInfo.workspaceId, fullCommand);
        socket.emit('terminal-output', output);
        
        // Notify file explorer if command might have changed files
        if (shouldRefreshFiles(sanitizedCommand)) {
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