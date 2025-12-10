import { FaTimes } from 'react-icons/fa';

const EditorTabs = ({ openFiles, activeFile, onFileSelect, onFileClose }) => {
  return (
    <div className="editor-tabs">
      {openFiles.map(file => (
        <div
          key={file.id}
          className={`tab ${activeFile?.id === file.id ? 'active' : ''}`}
          onClick={() => onFileSelect(file)}
        >
          <span className="tab-name">{file.name}</span>
          <FaTimes
            className="close-icon"
            onClick={(e) => {
              e.stopPropagation();
              onFileClose(file.id);
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default EditorTabs;