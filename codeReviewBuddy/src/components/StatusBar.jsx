import { FaCode, FaPlay, FaRobot } from 'react-icons/fa';

const StatusBar = ({ activeFile, loading }) => {
  return (
    <div className="status-bar">
      <div className="status-left">
        <span className="status-item">
          <FaCode /> {activeFile ? activeFile.name : 'No file selected'}
        </span>
        {activeFile && (
          <span className="status-item">
            {activeFile.language}
          </span>
        )}
      </div>
      
      <div className="status-right">
        {loading && (
          <span className="status-item loading">
            <FaPlay /> Running...
          </span>
        )}
        <span className="status-item">
          <FaRobot /> AI Ready
        </span>
      </div>
    </div>
  );
};

export default StatusBar;