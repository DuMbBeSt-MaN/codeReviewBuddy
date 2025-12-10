# Code Review Buddy 🚀

A modern code review tool built with React and Node.js that helps developers review code efficiently with AI assistance.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Monaco Editor
- **Backend**: Node.js, Express.js, Socket.io
- **AI Integration**: Groq API
- **Styling**: CSS3

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 16 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
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

### 4. Environment Setup

1. **Get your Groq API key**:
   - Visit [Groq Console](https://console.groq.com/keys)
   - Sign up/Login and create a new API key

2. **Create environment file**:
   ```bash
   cd backend
   cp .env.example .env
   ```

3. **Add your API key** to `backend/.env`:
   ```env
   GROQ_API_KEY=your_actual_api_key_here
   USE_MOCK_AI=false
   ```

### 5. Start the Application

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

- Real-time code review with AI assistance
- Monaco Editor integration
- Socket.io for real-time communication
- Modern React UI
- Express.js REST API

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

## 📞 Support

If you encounter any issues:
1. Check the [Issues](https://github.com/YOUR_USERNAME/codeReviewBuddy/issues) page
2. Create a new issue with detailed description
3. Include error messages and steps to reproduce

---

Happy coding! 🎉