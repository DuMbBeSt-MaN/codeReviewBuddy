import Docker from 'dockerode';
import tar from 'tar-stream';
import { Readable } from 'stream';

const docker = new Docker();
const containers = new Map(); // Store container info per session

export const createContainer = async (sessionId) => {
  try {
    console.log(`Creating container for session: ${sessionId}`);
    
    // Build image if it doesn't exist
    await buildSandboxImage();
    
    // Create container
    const container = await docker.createContainer({
      Image: 'code-sandbox:latest',
      name: `sandbox-${sessionId}`,
      Tty: true,
      OpenStdin: true,
      StdinOnce: false,
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      WorkingDir: '/workspace',
      Env: ['TERM=xterm'],
      HostConfig: {
        Memory: 512 * 1024 * 1024, // 512MB limit
        CpuShares: 512, // CPU limit
        NetworkMode: 'none' // No network access for security
      }
    });
    
    // Start container
    await container.start();
    
    // Store container info
    containers.set(sessionId, {
      container,
      id: container.id,
      created: new Date()
    });
    
    console.log(`Container created: ${container.id}`);
    return container;
    
  } catch (error) {
    console.error('Error creating container:', error);
    throw error;
  }
};

export const getContainer = (sessionId) => {
  return containers.get(sessionId)?.container;
};

export const executeCommand = async (sessionId, command) => {
  try {
    const container = getContainer(sessionId);
    if (!container) {
      throw new Error('Container not found');
    }
    
    const exec = await container.exec({
      Cmd: ['bash', '-c', command],
      AttachStdout: true,
      AttachStderr: true,
      Tty: false
    });
    
    const stream = await exec.start({ Tty: false });
    
    return new Promise((resolve, reject) => {
      let output = '';
      
      stream.on('data', (chunk) => {
        // Docker multiplexes stdout/stderr, we need to parse it
        if (chunk.length > 8) {
          output += chunk.slice(8).toString();
        }
      });
      
      stream.on('end', () => {
        resolve(output);
      });
      
      stream.on('error', reject);
    });
    
  } catch (error) {
    console.error('Error executing command:', error);
    throw error;
  }
};

export const writeFile = async (sessionId, filePath, content) => {
  try {
    const container = getContainer(sessionId);
    if (!container) {
      throw new Error('Container not found');
    }
    
    // Create tar stream with file content
    const pack = tar.pack();
    pack.entry({ name: filePath }, content);
    pack.finalize();
    
    // Upload to container
    await container.putArchive(pack, { path: '/workspace' });
    
    console.log(`File written: ${filePath}`);
    
  } catch (error) {
    console.error('Error writing file:', error);
    throw error;
  }
};

export const readFile = async (sessionId, filePath) => {
  try {
    const container = getContainer(sessionId);
    if (!container) {
      throw new Error('Container not found');
    }
    
    const stream = await container.getArchive({ path: `/workspace/${filePath}` });
    
    return new Promise((resolve, reject) => {
      const extract = tar.extract();
      let content = '';
      
      extract.on('entry', (header, stream, next) => {
        stream.on('data', (chunk) => {
          content += chunk.toString();
        });
        stream.on('end', next);
        stream.resume();
      });
      
      extract.on('finish', () => {
        resolve(content);
      });
      
      extract.on('error', reject);
      
      stream.pipe(extract);
    });
    
  } catch (error) {
    console.error('Error reading file:', error);
    throw error;
  }
};

export const cleanupContainer = async (sessionId) => {
  try {
    const containerInfo = containers.get(sessionId);
    if (containerInfo) {
      const { container } = containerInfo;
      
      // Stop and remove container
      await container.stop();
      await container.remove();
      
      containers.delete(sessionId);
      console.log(`Container cleaned up: ${sessionId}`);
    }
  } catch (error) {
    console.error('Error cleaning up container:', error);
  }
};

const buildSandboxImage = async () => {
  try {
    // Check if image exists
    const images = await docker.listImages();
    const imageExists = images.some(img => 
      img.RepoTags && img.RepoTags.includes('code-sandbox:latest')
    );
    
    if (imageExists) {
      console.log('Sandbox image already exists');
      return;
    }
    
    console.log('Building sandbox image...');
    
    // Build image from Dockerfile
    const stream = await docker.buildImage({
      context: '.',
      src: ['Dockerfile']
    }, { t: 'code-sandbox:latest' });
    
    // Wait for build to complete
    await new Promise((resolve, reject) => {
      docker.modem.followProgress(stream, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
    
    console.log('Sandbox image built successfully');
    
  } catch (error) {
    console.error('Error building image:', error);
    throw error;
  }
};