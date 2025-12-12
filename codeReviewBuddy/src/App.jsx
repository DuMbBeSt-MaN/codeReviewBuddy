import { useState, useEffect } from 'react'
import Editor from './editor.jsx'
import FileExplorer from './components/FileExplorer.jsx'
import EditorTabs from './components/EditorTabs.jsx'
import AIChat from './components/AIChat.jsx'
import Terminal from './components/Terminal.jsx'
import StatusBar from './components/StatusBar.jsx'
import Welcome from './components/Welcome.jsx'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { io } from 'socket.io-client'

function App() {
  const [files, setFiles] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [openFiles, setOpenFiles] = useState([])
  const [activeFile, setActiveFile] = useState(null)
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeBottomTab, setActiveBottomTab] = useState('output')

  // Initialize session and sync files
  useEffect(() => {
    const socket = io('http://localhost:5000')
    
    socket.on('connect', () => {
      console.log('Connected with session ID:', socket.id)
      setSessionId(socket.id)
    })
    
    // Listen for real-time file changes
    socket.on('files-changed', (data) => {
      console.log('Files changed:', data.files)
      const containerFiles = data.files.map(file => ({
        id: uuidv4(),
        name: file.name,
        content: '', // Will be loaded when opened
        language: getLanguageFromExtension(file.name),
        containerPath: file.path,
        modified: file.modified
      }))
      setFiles(containerFiles)
    })
    
    // Start file watching when container is ready
    socket.on('terminal-output', (data) => {
      if (data.includes('Sandbox ready')) {
        setTimeout(() => {
          socket.emit('start-file-watching')
        }, 1000)
      }
    })
    
    return () => {
      socket.disconnect()
    }
  }, [])

  const refreshFiles = async (currentSessionId = sessionId) => {
    if (!currentSessionId) return
    
    try {
      const response = await axios.get(`http://localhost:5000/api/files/list?sessionId=${currentSessionId}`)
      
      if (response.data.success) {
        const containerFiles = response.data.files.map(file => ({
          id: uuidv4(),
          name: file.name,
          content: '', // Will be loaded when opened
          language: getLanguageFromExtension(file.name),
          containerPath: file.path
        }))
        setFiles(containerFiles);
      }
    } catch (error) {
      console.error('Error refreshing files:', error)
    }
  }

  const getLanguageFromExtension = (fileName) => {
    const ext = fileName.split('.').pop()
    const langMap = {
      'py': 'python',
      'js': 'javascript', 
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'html': 'html',
      'css': 'css'
    }
    return langMap[ext] || 'plaintext'
  }

  const handleFileSelect = async (file) => {
    // Load file content from container if not already loaded
    if (!file.content && file.containerPath) {
      try {
        const response = await axios.get(`http://localhost:5000/api/files/load?sessionId=${sessionId}&fileName=${file.containerPath}`)
        if (response.data.success) {
          file.content = response.data.content
        }
      } catch (error) {
        console.error('Error loading file:', error)
        file.content = '// Error loading file'
      }
    }
    
    if (!openFiles.find(f => f.id === file.id)) {
      setOpenFiles([...openFiles, file])
    }
    setActiveFile(file)
  }

  const handleFileClose = (fileId) => {
    const newOpenFiles = openFiles.filter(f => f.id !== fileId)
    setOpenFiles(newOpenFiles)
    if (activeFile?.id === fileId) {
      setActiveFile(newOpenFiles[0] || null)
    }
  }

  const handleFileCreate = async (newFile) => {
    if (!sessionId) return
    
    try {
      // Save file to container
      await axios.post('http://localhost:5000/api/files/save', {
        sessionId,
        fileName: newFile.name,
        content: newFile.content || ''
      })
      
      // Add to local files
      const fileWithContainer = {
        ...newFile,
        containerPath: newFile.name
      }
      setFiles([...files, fileWithContainer])
      
      // Refresh files to sync with container
      setTimeout(() => refreshFiles(), 500)
      
    } catch (error) {
      console.error('Error creating file:', error)
    }
  }

  const handleFileDelete = (fileId) => {
    setFiles(files.filter(f => f.id !== fileId))
    handleFileClose(fileId)
  }

  const handleCodeChange = async (fileId, newContent) => {
    // Update local state
    setFiles(files.map(f => 
      f.id === fileId ? { ...f, content: newContent } : f
    ))
    setOpenFiles(openFiles.map(f => 
      f.id === fileId ? { ...f, content: newContent } : f
    ))
    if (activeFile?.id === fileId) {
      setActiveFile({ ...activeFile, content: newContent })
    }
    
    // Save to container (debounced)
    const file = files.find(f => f.id === fileId)
    if (file && file.containerPath && sessionId) {
      try {
        await axios.post('http://localhost:5000/api/files/save', {
          sessionId,
          fileName: file.containerPath,
          content: newContent
        })
      } catch (error) {
        console.error('Error saving file:', error)
      }
    }
  }

  const executeCode = async () => {
    if (!activeFile) return
    
    setLoading(true)
    try {
      const response = await axios.post('http://localhost:5000/api/code/execute', {
        language: activeFile.language,
        code: activeFile.content
      })
      
      const result = response.data
      setOutput(result.run?.stdout || result.run?.stderr || 'No output')
    } catch (error) {
      setOutput(`Error: ${error.message}`)
    }
    setLoading(false)
  }

  return (
    <div className="app-container">
      <div className="main-layout">
        <div className="sidebar">
          <FileExplorer
            files={files}
            onFileSelect={handleFileSelect}
            onFileCreate={handleFileCreate}
            onFileDelete={handleFileDelete}
            activeFile={activeFile}
            onRefresh={() => refreshFiles()}
          />
        </div>
        
        <div className="main-content">
          <div className="editor-section">
            <EditorTabs
              openFiles={openFiles}
              activeFile={activeFile}
              onFileSelect={setActiveFile}
              onFileClose={handleFileClose}
            />
            
            <div className="controls">
              <button onClick={executeCode} disabled={loading || !activeFile}>
                {loading ? 'Running...' : 'Run Code'}
              </button>
            </div>
            
            <div className="editor-container">
              {activeFile ? (
                <Editor
                  file={activeFile}
                  onCodeChange={handleCodeChange}
                />
              ) : (
                <Welcome onCreateFile={handleFileCreate} />
              )}
            </div>
          </div>
          
          <div className="bottom-panel">
            <div className="panel-tabs">
              <button 
                className={`tab-btn ${activeBottomTab === 'output' ? 'active' : ''}`}
                onClick={() => setActiveBottomTab('output')}
              >
                Output
              </button>
              <button 
                className={`tab-btn ${activeBottomTab === 'terminal' ? 'active' : ''}`}
                onClick={() => setActiveBottomTab('terminal')}
              >
                Terminal
              </button>
            </div>
            <div className="panel-content">
              {activeBottomTab === 'output' && (
                <div className="output-container">
                  <h3>Output:</h3>
                  <pre>{output}</pre>
                </div>
              )}
              {activeBottomTab === 'terminal' && <Terminal />}
            </div>
          </div>
        </div>
        
        <div className="right-sidebar">
          <AIChat activeFile={activeFile} />
        </div>
      </div>
      
      <StatusBar activeFile={activeFile} loading={loading} />
    </div>
  )
}

export default App
