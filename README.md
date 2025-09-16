# 📄 AI-PDF Assistant

An AI-powered PDF assistant that allows users to upload PDFs, chat with them in real-time, and maintain persistent chat sessions.  
Built with **React (Vite)** on the frontend and **Node.js, Express, Prisma, PostgreSQL** on the backend.

---

## 🚀 Features
- Upload and manage PDF documents
- Chat with PDFs using AI integration
- Persistent chat sessions stored in DB
- Session history with resume support
- Modern UI with React + Vite
- Backend deployed on **Render**

---

## 🛠️ Tech Stack
### Frontend
- React (Vite)
- React Router
- Axios
- Tailwind / CSS modules

### Backend
- Node.js + Express
- Prisma ORM
- PostgreSQL (Render managed DB)
- WebSockets for real-time chat

---

## 📂 Project Structure
```
│── frontend/      # React (Vite) frontend
│   ├── src/       # Components, pages, hooks
│   ├── public/    # Static assets
│   ├── .env       # Frontend environment variables
│   └── package.json
```

---

## ⚙️ Setup (Local Development)

### 1. Clone Repository
```bash
git https://github.com/Amey1619/AskMyPDF-Chat-assistant
```

### 2. Backend Setup
```bash
cd backend
npm install

# Setup database (PostgreSQL URL in .env)
npx prisma migrate dev --name init

# Start backend
npm run dev
```

**Backend `.env` Example:**
```
DATABASE_URL="your postgresQL Database URL"
PORT=****
JWT_SECRET="your secret"
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start frontend
npm run dev
```

**Frontend `.env` Example:**
```
VITE_API_URL="Backend API URL"
```

---

## 🌐 Deployment

### Backend (Render)
1. Push code to GitHub
2. Create a **PostgreSQL** instance on Render
3. Create a **Web Service** on Render with:
   - Build Command: `npm install && npx prisma generate`
   - Start Command: `npm start`
4. Add environment variables (`DATABASE_URL`, `JWT_SECRET`, etc.)
5. Deploy 🚀

### Frontend (Netlify/Vercel/Render)
1. Point build command → `npm run build`
2. Output directory → `dist`
3. Add env variable: `VITE_API_URL=https://<your-backend>.onrender.com`

---

## 🧑‍💻 Scripts

### Backend
- `npm run dev` → Start backend in dev mode
- `npm start` → Start backend in production
- `npx prisma studio` → Open Prisma DB GUI
- `npx prisma migrate dev` → Run migrations locally

### Frontend
- `npm run dev` → Start dev server
- `npm run build` → Build for production
- `npm run preview` → Preview production build

---


## 🏗️ Future Improvements
- User authentication with roles
- Multi-PDF support in one session
- Advanced AI query refinement
- Cloud storage integration for PDFs

---

## 📜 License
MIT License © 2025 Amey Gupta
