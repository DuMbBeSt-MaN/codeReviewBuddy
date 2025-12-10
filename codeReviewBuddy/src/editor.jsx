import Editor from "@monaco-editor/react";

const CodeEditor = ({ file, onCodeChange }) => {
  const handleEditorChange = (value) => {
    onCodeChange(file.id, value);
  };

  if (!file) {
    return (
      <div className="no-file-selected">
        <p>Select a file to start editing</p>
      </div>
    );
  }

  return (
    <Editor
      height="100%"
      language={file.language}
      value={file.content}
      onChange={handleEditorChange}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: 'on'
      }}
    />
  );
};

export default CodeEditor;