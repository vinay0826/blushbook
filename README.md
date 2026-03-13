# Between The Lines

A full-stack emotional book reflection website with a pink-sky, glassmorphism UI.

## Stack

- Frontend: React + Vite + Tailwind + Framer Motion
- Backend: Node.js + Express + MongoDB (Mongoose)

## Features

- Reflection-first review flow:
  - Book Title
  - How did it make you feel?
  - A line that stayed with you
  - Would you live in this world? (Yes/No)
- Home + auth pages:
  - `/` home
  - `/login` login form
  - `/register` create account form
- Animated heart like button
- Personal shelf section titled "My Shelf of Feelings"
- Quiet hero section with "Between The Lines" messaging and CTA
- Mobile-first responsive UI for phones, tablets, and desktop

## Project Structure

- `frontend/`: UI app
- `backend/`: REST API

## Setup

1. Backend:
   - `cd backend`
   - `npm install`
   - copy `.env.example` to `.env`
   - set `MONGODB_URI` and `JWT_SECRET`
   - optional setup collections/indexes: `npm run migrate`
   - `npm run dev`
2. Frontend:
   - `cd frontend`
   - `npm install`
   - optional: create `.env` with `VITE_API_BASE_URL=<your-backend-url>/api` (not needed for local ngrok via Vite proxy)
   - `npm run dev`

## Ngrok Public Access

- Keep backend running on `http://localhost:5000`
- Keep frontend running on `http://localhost:5173`
- Expose only frontend with ngrok: `ngrok http 5173`
- Share the ngrok frontend URL; `/api` is proxied to backend automatically

## API Endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token required)
- `GET /api/reviews`
- `POST /api/reviews` with `bookTitle`, `feltSummary`, `stayedLine`, `liveInWorld`
- `PATCH /api/reviews/:id/like`
- `GET /api/shelf`
- `POST /api/shelf`
- `DELETE /api/shelf/:id`
