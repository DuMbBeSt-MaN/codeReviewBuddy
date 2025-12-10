import { spawn } from 'child_process';
import os from 'os';

const terminals = new Map();

export const createTerminal = (socket) => {
  socket.emit('terminal-output', `Welcome to Code Review Buddy Terminal\r\n`);
  socket.emit('terminal-output', `Platform: ${os.platform()}\r\n`);
  socket.emit('terminal-output', `Working Directory: ${process.cwd()}\r\n\r\n`);
  
  let currentDir = process.cwd();
  
  socket.on('terminal-input', async (data) => {
    const command = data.trim();
    
    if (command === '\r' || command === '') {
      socket.emit('terminal-output', '\r\n$ ');
      return;
    }
    
    socket.emit('terminal-output', `\r\n`);
    
    try {
      if (command.startsWith('cd ')) {
        const newDir = command.substring(3).trim();
        try {
          process.chdir(newDir);
          currentDir = process.cwd();
          socket.emit('terminal-output', `Changed directory to: ${currentDir}\r\n`);
        } catch (err) {
          socket.emit('terminal-output', `cd: ${err.message}\r\n`);
        }
      } else {
        const [cmd, ...args] = command.split(' ');
        const child = spawn(cmd, args, { 
          cwd: currentDir,
          shell: true 
        });
        
        child.stdout.on('data', (data) => {
          socket.emit('terminal-output', data.toString());
        });
        
        child.stderr.on('data', (data) => {
          socket.emit('terminal-output', data.toString());
        });
        
        child.on('close', (code) => {
          socket.emit('terminal-output', `\r\n$ `);
        });
        
        child.on('error', (err) => {
          socket.emit('terminal-output', `Error: ${err.message}\r\n$ `);
        });
      }
    } catch (error) {
      socket.emit('terminal-output', `Error: ${error.message}\r\n$ `);
    }
  });
  
  socket.emit('terminal-output', '$ ');
  
  socket.on('disconnect', () => {
    terminals.delete(socket.id);
  });
};