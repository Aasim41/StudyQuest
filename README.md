# StudyQuest 🚀

StudyQuest is an AI-powered, gamified study planner and educational companion application designed for university students. 

## 🏗 Architecture

The project is structured as a full-stack monorepo:
- **`frontend/`**: A React Native (Expo) mobile application using modern UI principles, glassmorphism, and reanimated fluid 3D-like animations.
- **`backend/`**: A Node.js / Express backend server hosted on Render, serving as the central orchestration layer for Firebase Auth, Google Gemini API, Groq SDK, and various REST endpoints.

## 🚀 Key Features

1. **AI Schedule Generation**: Upload a syllabus, calendar, and timetable (via PDFs/images), and let Gemini construct a hyper-optimized daily study schedule.
2. **StudyTube Integration**: A personalized feed that pulls educational YouTube videos specifically aligned with your active study subjects. 
3. **AI Video Summaries**: View any educational video and seamlessly extract AI-generated notes.
4. **Gamification Engine**: Earn XP, level up, maintain streaks, and climb the Leaderboards by completing Focus Sessions and finishing daily tasks.
5. **Secure Cloud Syncing**: Your data automatically syncs with Firebase Firestore to ensure progress is never lost.

## 🛠️ Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- A Firebase project
- API keys for [Google Gemini](https://aistudio.google.com/) and [Groq](https://console.groq.com/)

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file in the `backend/` root directory:
   ```env
   PORT=3000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:8081,exp://127.0.0.1:8081
   
   # Add your comma-separated API keys here
   GEMINI_API_KEYS=your_gemini_key_1,your_gemini_key_2
   GROQ_API_KEYS=your_groq_key_1,your_groq_key_2
   
   # Firebase Service Account JSON (stringified)
   FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"..."}'
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```
2. Create your `firebaseConfig.js` (if not already initialized) mapped to your Firebase web credentials.
3. Update `config/apiConfig.js` to point to your backend url (e.g. `http://192.168.x.x:3000` or production Render URL).
4. Run the Expo dev server:
   ```bash
   npm start
   ```

## 🧪 Testing

The backend includes a suite of automated API tests powered by Jest and Supertest.
To run the test suite:
```bash
cd backend
npm test
```

## 🔒 Security Practices
- No secrets are stored in the codebase (Firebase admin certs are passed dynamically via environment variables).
- API keys are handled strictly server-side.
- CORS is restricted in production.
- Firebase Auth tokens are verified securely on backend endpoints.

---
*Built to make studying smarter, not harder.*
