import { writeFile, readFile, executeCommand, createContainer, getContainer } from './dockerManager.js';

export const saveFile = async (req, res) => {
  try {
    const { sessionId, fileName, content } = req.body;
    
    if (!sessionId || !fileName || content === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Ensure container exists
    let container = getContainer(sessionId);
    if (!container) {
      container = await createContainer(sessionId);
    }
    
    await writeFile(sessionId, fileName, content);
    
    res.json({ 
      success: true, 
      message: `File ${fileName} saved successfully` 
    });
    
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).json({ error: error.message });
  }
};

export const loadFile = async (req, res) => {
  try {
    const { sessionId, fileName } = req.query;
    
    if (!sessionId || !fileName) {
      return res.status(400).json({ error: 'Missing sessionId or fileName' });
    }
    
    // Ensure container exists
    let container = getContainer(sessionId);
    if (!container) {
      container = await createContainer(sessionId);
    }
    
    const content = await readFile(sessionId, fileName);
    
    res.json({ 
      success: true, 
      content,
      fileName 
    });
    
  } catch (error) {
    console.error('Error loading file:', error);
    res.status(500).json({ error: error.message });
  }
};

export const listFiles = async (req, res) => {
  try {
    const { sessionId } = req.query;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Missing sessionId' });
    }
    
    // Check if container exists, if not create it
    let container = getContainer(sessionId);
    if (!container) {
      try {
        container = await createContainer(sessionId);
      } catch (createError) {
        console.log('Container creation failed, returning empty file list');
        return res.json({ success: true, files: [] });
      }
    }
    
    // Debug: Check what files actually exist in this container
    const testOutput = await executeCommand(sessionId, 'ls /workspace');
    console.log(`Files in container ${sessionId}:`, testOutput);
    
    const output = await executeCommand(sessionId, 'ls -la /workspace');
    const files = output.trim().split('\n')
      .filter(line => line.trim() && !line.startsWith('total') && !line.startsWith('d'))
      .map(line => {
        const parts = line.split(/\s+/);
        const fileName = parts[parts.length - 1];
        if (fileName && fileName !== '.' && fileName !== '..') {
          return {
            name: fileName,
            path: fileName,
            type: 'file'
          };
        }
        return null;
      })
      .filter(file => file !== null);
    
    res.json({ 
      success: true, 
      files 
    });
    
  } catch (error) {
    console.error('Error listing files:', error);
    // Return empty list instead of error to prevent frontend crashes
    res.json({ success: true, files: [] });
  }
};