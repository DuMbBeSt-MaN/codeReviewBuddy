import { executeCommand } from './dockerManager.js';

class FileSystemWatcher {
  constructor(io) {
    this.io = io;
    this.watchers = new Map(); // sessionId -> interval
    this.lastFileStates = new Map(); // sessionId -> file hash
  }

  startWatching(sessionId, socket) {
    if (this.watchers.has(sessionId)) {
      this.stopWatching(sessionId);
    }

    console.log(`Starting file watcher for session: ${sessionId}`);
    
    const interval = setInterval(async () => {
      try {
        await this.checkForChanges(sessionId, socket);
      } catch (error) {
        console.error(`File watcher error for ${sessionId}:`, error);
      }
    }, 2000); // Check every 2 seconds

    this.watchers.set(sessionId, interval);
  }

  async checkForChanges(sessionId, socket) {
    try {
      const workspaceId = 'shared-workspace'; // Use shared workspace
      // Get current file list with timestamps
      const output = await executeCommand(workspaceId, 'find /workspace -type f -exec stat -c "%n|%Y" {} \\;');
      const currentState = output.trim();
      
      const lastState = this.lastFileStates.get(workspaceId);
      
      if (currentState !== lastState) {
        console.log(`File changes detected in shared workspace`);
        this.lastFileStates.set(workspaceId, currentState);
        
        // Parse files and emit update to this socket and broadcast to all
        const files = this.parseFileList(currentState);
        socket.emit('files-changed', { files });
        // Broadcast to all other connected clients
        socket.broadcast.emit('files-changed', { files });
      }
    } catch (error) {
      // Container might not exist yet, ignore
    }
  }

  parseFileList(output) {
    if (!output.trim()) return [];
    
    return output.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [fullPath, timestamp] = line.split('|');
        const name = fullPath.split('/').pop();
        return {
          name,
          path: name,
          type: 'file',
          modified: parseInt(timestamp) * 1000 // Convert to milliseconds
        };
      })
      .filter(file => file.name && !file.name.startsWith('.'));
  }
  
  // Static method for external use
  static parseFileList(output) {
    if (!output.trim()) return [];
    
    return output.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [fullPath, timestamp] = line.split('|');
        const name = fullPath.split('/').pop();
        return {
          name,
          path: name,
          type: 'file',
          modified: parseInt(timestamp) * 1000
        };
      })
      .filter(file => file.name && !file.name.startsWith('.'));
  }

  async forceRefresh(sessionId, socket) {
    try {
      await this.checkForChanges(sessionId, socket);
      // Also broadcast to all connected clients
      this.io.emit('files-changed-broadcast');
    } catch (error) {
      console.error(`Force refresh error for ${sessionId}:`, error);
    }
  }

  stopWatching(sessionId) {
    const interval = this.watchers.get(sessionId);
    if (interval) {
      clearInterval(interval);
      this.watchers.delete(sessionId);
      this.lastFileStates.delete(sessionId);
      console.log(`Stopped file watcher for session: ${sessionId}`);
    }
  }

  cleanup() {
    for (const sessionId of this.watchers.keys()) {
      this.stopWatching(sessionId);
    }
  }
}

export default FileSystemWatcher;