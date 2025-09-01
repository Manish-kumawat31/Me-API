# Me-API Playground (Track A: Backend Assessment)

## Live (replace after deploy)
- Backend (API): [https://<your-backend-url>](https://me-api-zu8c.onrender.com)
- Frontend (UI): [https://<your-frontend-url>](https://me-api-coral.vercel.app/)
- Resume: https:[//<your-resume-link>](https://drive.google.com/file/d/1_nA9SMOdAKmiP-Zcv1zOJPo4qgBX53Ml/view?usp=sharing)

## Summary
Small playground that stores my candidate profile in MongoDB and exposes APIs to create/read/update and query the data. Minimal frontend calls the API for profile, projects list, filtering, and search.

## Architecture
- Backend: Node.js + Express + Mongoose (MongoDB)
- Frontend: React (Vite)
- Hosting: Render / Heroku / Railway (backend) + Netlify / Vercel (frontend)

## API Endpoints
- `GET /health` - liveness (returns 200)
- `POST /profile` - create profile (basic-auth optional)
- `GET /profile` - get profile
- `PUT /profile` - update profile (basic-auth optional)
- `GET /projects?skill=<skill>` - filter projects by skill
- `GET /skills/top` - list top skills with counts
- `GET /search?q=<term>` - search across projects, skills, work

## DB Schema
See `backend/schema.md`.

## Local Setup
1. Backend:
   - `cd backend`
   - Copy `.env.example` to `.env` and set `MONGO_URI`
   - `npm i`
   - `npm run seed`
   - `npm run dev` (server at [http://localhost:8080](https://me-api-zu8c.onrender.com))

2. Frontend:
   - `cd frontend`
   - `npm i`
   - set `VITE_API_BASE` in `.env` if needed
   - `npm run dev` (Vite serves at [http://localhost:5173](https://me-api-coral.vercel.app/))

## Sample cURL
- Health:
  `curl -i http://localhost:8080/health`

- Read profile:
  `curl http://localhost:8080/profile | jq`

- Projects by skill:
  `curl "http://localhost:8080/projects?skill=react" | jq`

- Top skills:
  `curl http://localhost:8080/skills/top | jq`

- Search:
  `curl "http://localhost:8080/search?q=mern" | jq`

## Known limitations
- Single-profile single-document design (fine for assessment).
- No pagination for list endpoints.
- Write endpoints optionally behind Basic Auth (configured via .env).
- Minimal validation (can add Joi/Zod for production).

