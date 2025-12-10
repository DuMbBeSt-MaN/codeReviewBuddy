import { FaCode, FaRobot, FaTerminal, FaPlay } from 'react-icons/fa';

const Welcome = ({ onCreateFile }) => {
  const createSampleFile = (name, content, language) => {
    onCreateFile({
      id: Date.now(),
      name,
      content,
      language
    });
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <h1>
          <FaCode className="welcome-icon" />
          Code Review Buddy
        </h1>
        <p>Your AI-powered development sandbox</p>
        
        <div className="features">
          <div className="feature">
            <FaCode />
            <span>Multi-file Editor</span>
          </div>
          <div className="feature">
            <FaRobot />
            <span>AI Code Review</span>
          </div>
          <div className="feature">
            <FaTerminal />
            <span>Integrated Terminal</span>
          </div>
          <div className="feature">
            <FaPlay />
            <span>Code Execution</span>
          </div>
        </div>
        
        <div className="quick-start">
          <h3>Quick Start</h3>
          <div className="sample-files">
            <button 
              onClick={() => createSampleFile('hello.py', 'print("Hello, World!")', 'python')}
              className="sample-btn"
            >
              Python Hello World
            </button>
            <button 
              onClick={() => createSampleFile('app.js', 'console.log("Hello, World!");', 'javascript')}
              className="sample-btn"
            >
              JavaScript Hello World
            </button>
            <button 
              onClick={() => createSampleFile('Main.java', 'public class Main {\\n    public static void main(String[] args) {\\n        System.out.println("Hello, World!");\\n    }\\n}', 'java')}
              className="sample-btn"
            >
              Java Hello World
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;