import { useState } from 'react'
import Editor from './editor.jsx'
import FileExplorer from './components/FileExplorer.jsx'
import EditorTabs from './components/EditorTabs.jsx'
import AIChat from './components/AIChat.jsx'
import Terminal from './components/Terminal.jsx'
import StatusBar from './components/StatusBar.jsx'
import Welcome from './components/Welcome.jsx'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

function App() {
  const [files, setFiles] = useState([
    {
      id: uuidv4(),
      name: 'main.py',
      content: '# Write your code here\nprint("Hello World!")',
      language: 'python'
    }
  ])
  const [openFiles, setOpenFiles] = useState([])
  const [activeFile, setActiveFile] = useState(null)
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeBottomTab, setActiveBottomTab] = useState('output')

  const handleFileSelect = (file) => {
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

  const handleFileCreate = (newFile) => {
    setFiles([...files, newFile])
  }

  const handleFileDelete = (fileId) => {
    setFiles(files.filter(f => f.id !== fileId))
    handleFileClose(fileId)
  }

  const handleCodeChange = (fileId, newContent) => {
    setFiles(files.map(f => 
      f.id === fileId ? { ...f, content: newContent } : f
    ))
    setOpenFiles(openFiles.map(f => 
      f.id === fileId ? { ...f, content: newContent } : f
    ))
    if (activeFile?.id === fileId) {
      setActiveFile({ ...activeFile, content: newContent })
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
