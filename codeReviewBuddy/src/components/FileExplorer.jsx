import { useState } from 'react';
import { FaFile, FaFolder, FaFolderOpen, FaPlus, FaTrash } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

const FileExplorer = ({ files, onFileSelect, onFileCreate, onFileDelete, activeFile }) => {
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
        <FaPlus className="add-icon" onClick={createFile} />
      </div>
      <div className="file-tree">
        {files.map(renderFile)}
      </div>
    </div>
  );
};

export default FileExplorer;