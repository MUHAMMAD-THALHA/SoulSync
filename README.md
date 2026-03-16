# SoulSync 💜

> **"SoulSync — Where Emotions Are Built Through Trust."**

SoulSync is a global digital platform designed to help people build meaningful emotional connections based on trust, compatibility, and mutual intention. Unlike traditional dating applications that prioritize quick matches or appearance-based swiping, SoulSync focuses on creating relationships where emotions are built gradually through trust and shared values.

---

## Features

- **🎯 Compatibility Matching** — Smart algorithm analyzes personality traits, lifestyle preferences, values, and life goals to calculate a compatibility score (0–100) for each potential connection.
- **🔒 Privacy First** — Personal contact information (phone, email, social links) is hidden from all other users by default.
- **🤝 Trust Agreement** — Before any communication can begin, both parties must confirm respectful intentions and acknowledge SoulSync community guidelines.
- **⭐ Trust Score** — Each user maintains a Trust Score (0–100) reflecting profile verification, respectful interactions, and community standing.
- **💬 Contact Reveal** — Communication details are unlocked only when *both* users mutually consent through the Contact Reveal feature.
- **🗳️ Community Polls** — Users vote on future platform improvements; the most-requested features are prioritised for development.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| HTTP client | Axios |

---

## Project Structure

```
SoulSync/
├── backend/                # Express API
│   ├── src/
│   │   ├── app.js          # Entry point (port 3000)
│   │   ├── database/
│   │   │   └── db.js       # SQLite schema + seed data
│   │   ├── middleware/
│   │   │   └── auth.js     # JWT middleware
│   │   └── routes/
│   │       ├── auth.js     # /api/auth/*
│   │       ├── profiles.js # /api/profiles/*
│   │       ├── connections.js # /api/connections/*
│   │       └── polls.js    # /api/polls/*
│   ├── .env.example
│   └── package.json
└── frontend/               # React + Vite SPA
    ├── src/
    │   ├── App.jsx
    │   ├── contexts/
    │   │   └── AuthContext.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DiscoverPage.jsx
    │   │   ├── ConnectionsPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   └── PollsPage.jsx
    │   └── components/
    │       ├── Navbar.jsx
    │       ├── ProfileCard.jsx
    │       ├── TrustBadge.jsx
    │       └── ProtectedRoute.jsx
    └── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+

### 1. Backend

```bash
cd backend
cp .env.example .env          # Set JWT_SECRET and PORT
npm install
npm start                      # Runs on http://localhost:3000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                    # Runs on http://localhost:5173
```

The Vite dev server proxies `/api` requests to the backend automatically.

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Sign in |
| GET | `/api/auth/me` | ✅ | Full own profile (incl. contact info) |
| GET | `/api/profiles` | ✅ | Discovery feed with compatibility scores |
| GET | `/api/profiles/me/matches` | ✅ | Top-20 ranked matches |
| PUT | `/api/profiles/me` | ✅ | Update own profile |
| POST | `/api/connections` | ✅ | Send connection request |
| GET | `/api/connections` | ✅ | List all connections |
| PUT | `/api/connections/:id/respond` | ✅ | Accept / reject request |
| POST | `/api/connections/:id/trust-agreement` | ✅ | Sign Trust Agreement |
| POST | `/api/connections/:id/contact-reveal` | ✅ | Request Contact Reveal |
| GET | `/api/connections/:id/contact` | ✅ | Get revealed contact info |
| GET | `/api/polls` | ✅ | Community polls |
| POST | `/api/polls/:id/vote` | ✅ | Cast a vote |

---

## Privacy & Security

- Contact info (`phone`, `social_links`) is **never** returned in profile listings or individual profile views unless both users have mutually completed the Contact Reveal flow.
- Passwords are hashed with **bcrypt** (10 rounds).
- All protected routes require a valid **JWT** bearer token.
- Rate limiting is applied: 20 req/15 min on auth routes, 200 req/15 min elsewhere.
- Profile update fields are validated against a strict whitelist to prevent SQL injection.
