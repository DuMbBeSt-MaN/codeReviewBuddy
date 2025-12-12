import { useState } from 'react';
import { FaFile, FaFolder, FaFolderOpen, FaPlus, FaTrash, FaSync } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

const FileExplorer = ({ files, onFileSelect, onFileCreate, onFileDelete, activeFile, onRefresh }) => {

  const [expandedFolders, setExpandedFolders] = useState(new Set(['root']));

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const createFile = () => {
    const fileName = prompt('Enter file name:');
    if (fileName) {
      onFileCreate({
        id: uuidv4(),
        name: fileName,
        type: 'file',
        content: '',
        language: getLanguageFromExtension(fileName)
      });
    }
  };

  const getLanguageFromExtension = (fileName) => {
    const ext = fileName.split('.').pop();
    const langMap = {
      'py': 'python',
      'js': 'javascript',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'html': 'html',
      'css': 'css'
    };
    return langMap[ext] || 'plaintext';
  };

  const renderFile = (file) => (
    <div
      key={file.id}
      className={`file-item ${activeFile?.id === file.id ? 'active' : ''}`}
      onClick={() => onFileSelect(file)}
    >
      <FaFile className="file-icon" />
      <span>{file.name}</span>
      <FaTrash 
        className="delete-icon" 
        onClick={(e) => {
          e.stopPropagation();
          onFileDelete(file.id);
        }}
      />
    </div>
  );

  return (
    <div className="file-explorer">
      <div className="explorer-header">
        <h3>Explorer</h3>
        <div className="header-actions">
          <FaSync className="refresh-icon" onClick={onRefresh} title="Refresh files" />
          <FaPlus className="add-icon" onClick={createFile} title="Create file" />
        </div>
      </div>
      <div className="file-tree">
        {files.length === 0 ? (
          <div className="no-files">No files found. Create files in terminal and refresh.</div>
        ) : (
          files.map((file, index) => {
            console.log('Rendering file:', file);
            return renderFile(file);
          })
        )}
      </div>
    </div>
  );
};

export default FileExplorer;