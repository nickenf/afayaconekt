# AfyaConnect v2

A medical travel platform connecting patients in Africa with hospitals in India.

## Project Structure

- `backend/` - Express.js API server
- `frontend/` - React application with Vite
- `.env.local` - Environment variables

## Running the Application

### Backend (API Server)
```bash
cd backend
npm install
npm start
```
Server runs on: http://localhost:3001

### Frontend (React App)
```bash
cd frontend
npm install
npm run dev
```
Application runs on: http://localhost:5173

## API Endpoints

- `GET /api/hospitals` - Fetch all hospitals
- `GET /api/hospitals/:name` - Fetch hospital details
- `POST /api/chat` - Chat with AI assistant
- `POST /api/inquiries` - Submit patient inquiry
- `GET /api/inquiries` - Get all inquiries (admin)
- `POST /api/hospitals/:id/ratings` - Submit hospital rating

## Environment Variables

Create `.env.local` in the backend directory with:
```
GEMINI_API_KEY=your_gemini_api_key_here