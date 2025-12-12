# Code Review Buddy 🚀

A modern web-based IDE and code review tool with Docker-powered sandboxing, AI assistance, and real-time collaboration features.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Monaco Editor, Socket.IO Client
- **Backend**: Node.js, Express.js, Socket.IO
- **Containerization**: Docker (isolated sandbox environments)
- **AI Integration**: Groq API (Llama 3.1)
- **Code Execution**: PISTON API
- **Styling**: CSS3

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 16 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (required for sandboxing)
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/) (recommended)

## 🚀 Quick Start

### 1. Fork & Clone the Repository

1. **Fork this repository** by clicking the "Fork" button at the top right
2. **Clone your forked repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/codeReviewBuddy.git
   cd codeReviewBuddy
   ```

### 2. Navigate to Project Directory
```bash
cd codeReviewBuddy
```

### 3. Install Dependencies

Install frontend dependencies:
```bash
npm install
```

Install backend dependencies:
```bash
cd backend
npm install
cd ..
```

### 4. Docker Setup

1. **Start Docker Desktop** and ensure it's running

2. **Build the sandbox image**:
   ```bash
   cd backend
   docker build -t code-sandbox:latest .
   ```

### 5. Environment Setup

1. **Get your Groq API key** (optional - mock AI works without it):
   - Visit [Groq Console](https://console.groq.com/keys)
   - Sign up/Login and create a new API key

2. **Create environment file**:
   ```bash
   cd backend
   touch .env
   ```

3. **Add your API key** to `backend/.env`:
   ```env
   # For real AI (optional)
   GROQ_API_KEY=your_actual_api_key_here
   USE_MOCK_AI=false
   
   # For mock AI (works without API key)
   USE_MOCK_AI=true
   ```

### 6. Start the Application

From the root directory:
```bash
npm start
```

This will start both frontend (http://localhost:5173) and backend (http://localhost:3001) servers.

## 🎯 Alternative Start Methods

### Start Frontend Only
```bash
npm run dev
```

### Start Backend Only
```bash
npm run server
```

### Start Separately
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
```

## 🐳 Docker Architecture

### Isolated Sandbox Environment
- Each user session gets a dedicated Docker container
- Complete isolation from host system
- Pre-installed with Python, Node.js, Java, C++, and development tools
- Automatic cleanup when session ends

### Security Features
- **Process Isolation**: Container processes can't affect host
- **Filesystem Isolation**: No access to host files
- **Network Isolation**: Controlled network access
- **Resource Limits**: CPU and memory quotas enforced
- **User Isolation**: Runs as non-root user in container

## 📁 Project Structure

```
codeReviewBuddy/
├── codeReviewBuddy/
│   ├── src/                 # React frontend source
│   │   ├── components/      # React components
│   │   ├── assets/         # Static assets
│   │   └── ...
│   ├── backend/            # Node.js backend
│   │   ├── controllers/    # API controllers
│   │   ├── routes/        # API routes
│   │   ├── .env           # Environment variables (not in git)
│   │   └── server.js      # Main server file
│   ├── public/            # Public assets
│   └── package.json       # Frontend dependencies
└── README.md
```

## 🔧 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start both frontend and backend |
| `npm run dev` | Start frontend development server |
| `npm run server` | Start backend development server |
| `npm run build` | Build frontend for production |
| `npm run lint` | Run ESLint |

### VS Code Setup

1. **Install recommended extensions**:
   - ES7+ React/Redux/React-Native snippets
   - Prettier - Code formatter
   - ESLint

2. **Open project in VS Code**:
   ```bash
   code .
   ```

## 🌟 Features

### 🔒 Secure Development Environment
- **Docker-powered sandboxing** - Complete isolation from host system
- **Multi-language support** - Python, JavaScript, Java, C++, C, HTML, CSS
- **Real-time file synchronization** - Changes in terminal instantly appear in file explorer
- **Integrated terminal** - Full bash/PowerShell access within container

### 🤖 AI-Powered Code Assistance
- **Intelligent code review** - Groq API with Llama 3.1 model
- **Interactive AI chat** - Context-aware conversations about your code
- **Code suggestions** - Real-time improvement recommendations
- **Mock AI fallback** - Works without API key for testing

### 💻 Professional IDE Experience
- **Monaco Editor** - VS Code-like editing experience
- **Multi-file support** - Tabbed interface with file explorer
- **Syntax highlighting** - Support for multiple programming languages
- **Code execution** - Run code safely via PISTON API
- **Real-time collaboration** - Socket.IO powered live updates

### 🎨 Modern UI/UX
- **VS Code-inspired design** - Familiar interface for developers
- **Responsive layout** - Works on desktop and tablet devices
- **Dark theme** - Easy on the eyes for long coding sessions
- **Status bar** - Real-time information about active file and system status

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 3001 (backend)
npx kill-port 3001

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

**Dependencies issues:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Environment variables not loading:**
- Ensure `.env` file is in the `backend/` directory
- Check that your API key is valid
- Restart the backend server after changing `.env`

## 🔧 Docker Troubleshooting

### Common Docker Issues

**Docker not running:**
```bash
# Check Docker status
docker --version
docker ps
```

**Container build fails:**
```bash
# Clean Docker cache and rebuild
docker system prune -f
cd backend
docker build -t code-sandbox:latest .
```

**Permission issues (Linux/Mac):**
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Logout and login again
```

**Container cleanup:**
```bash
# Remove all containers
docker container prune -f

# Remove sandbox image
docker rmi code-sandbox:latest
```

## 🚀 Production Deployment

### Environment Variables
```env
# Production settings
NODE_ENV=production
PORT=3000
GROQ_API_KEY=your_production_api_key
USE_MOCK_AI=false

# Docker settings
DOCKER_HOST=unix:///var/run/docker.sock
CONTAINER_MEMORY_LIMIT=512m
CONTAINER_CPU_LIMIT=0.5
```

### Security Considerations
- Run Docker daemon in rootless mode
- Use container resource limits
- Implement session timeouts
- Monitor container usage
- Regular security updates

## 📞 Support

If you encounter any issues:
1. Check Docker Desktop is running
2. Verify all dependencies are installed
3. Check the [Issues](https://github.com/YOUR_USERNAME/codeReviewBuddy/issues) page
4. Create a new issue with:
   - Error messages
   - Docker version (`docker --version`)
   - Node.js version (`node --version`)
   - Steps to reproduce

---

**Built with ❤️ for developers who value security and productivity**

Happy coding in your secure sandbox! 🎉🐳