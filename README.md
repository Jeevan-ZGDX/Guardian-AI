# TrackChain - Campus Issue Resolution System

A modern, blockchain-integrated campus issue resolution system built with React, FastAPI, and SQLite. Features dynamic animations, JWT authentication, and role-based access control.

## 🌟 Features

### Frontend
- **Modern UI**: Built with React, Vite, and Tailwind CSS
- **Dynamic Animations**: Framer Motion for smooth transitions and interactions
- **Glassmorphism Design**: Modern translucent UI elements
- **Responsive Layout**: Works on desktop and mobile devices
- **Multi-step Issue Form**: Creative, user-friendly issue reporting flow

### Backend
- **FastAPI**: High-performance Python web framework
- **SQLite Database**: Lightweight, embedded database
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Student and vendor role separation
- **Blockchain Integration**: Immutable issue tracking
- **AI Integration**: Severity classification and sentiment analysis

### Security
- **Email Domain Restriction**: Only @citchennai.net emails allowed
- **Password Hashing**: BCrypt for secure password storage
- **Protected Routes**: Authentication required for dashboard access
- **CORS Enabled**: Cross-origin resource sharing configured

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jeevan-ZGDX/Guardian-AI.git
   cd Guardian-AI
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python main_light.py
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## 🔐 Authentication

### Test Accounts
- **Student**: `student1@citchennai.net` / `student123`
- **Vendor**: `vendor1@citchennai.net` / `vendor123`

### Email Requirements
- Must end with `@citchennai.net`
- Unique email addresses only

## 📁 Project Structure

```
Guardian-AI/
├── backend/
│   ├── main_light.py          # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   ├── campus_track.db        # SQLite database
│   └── venv/                  # Python virtual environment
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── context/           # React context providers
│   │   ├── App.jsx           # Main application
│   │   └── main.jsx          # Entry point
│   ├── public/               # Static assets
│   └── package.json          # Node.js dependencies
└── README.md                 # This file
```

## 🎨 Color Scheme

- **Primary**: Black (#000000)
- **Secondary**: Teal (#14b8a6)
- **Accent**: Golden Yellow (#f59e0b)
- **Background**: White (#ffffff)

## 🔧 API Endpoints

### Authentication
- `POST /token` - Login
- `POST /register` - Register new user

### Issues
- `POST /api/issues` - Create new issue (students only)
- `GET /api/inventory` - Get inventory items
- `POST /api/inventory/{id}/check` - Check item availability

### Blockchain
- `GET /api/chain` - Get blockchain data

## 🛠️ Technologies Used

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- React Router DOM
- Lucide React (icons)
- Axios

### Backend
- FastAPI
- SQLAlchemy
- SQLite
- Python-JOSE (JWT)
- Passlib (password hashing)
- Uvicorn

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Bug Reports

If you find any bugs or issues, please create an issue in the GitHub repository.

## 📞 Support

For support and questions, please open an issue in the GitHub repository.