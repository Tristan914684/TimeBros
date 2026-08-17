# TimeBros

A timetable planner for NUS students. Pick your modules, auto-generate clash-free schedules based on your own constraints, compare timetables with friends, and export the result straight to your phone's calendar.

**Live app:** [time-bros.vercel.app](https://time-bros.vercel.app/)

## Features

- **Module search** — browse and select modules pulled from the [NUSMods](https://nusmods.com/) API (module code, title, credits, lesson slots).
- **Manual scheduling** — pick a specific class number for each lesson type (Lecture, Tutorial, Lab, etc.) and see the resulting timetable instantly.
- **Auto-generate** — let TimeBros find valid, clash-free combinations for you, with optional constraints:
  - No gaps between classes
  - A protected free block (e.g. keep 12:00–14:00 free for lunch)
  - Max consecutive teaching hours
  - Minimum buffer time between classes
- **Personal time blocks** — mark out recurring commitments (work, CCA, gym, etc.) per day so the generator schedules around them.
- **Day toggles** — disable specific weekdays entirely if you don't want classes on them.
- **Friend match** — enter a friend's email to compare shared modules, spot timing clashes, and swap class slots directly from the panel.
- **Calendar export** — download a `.ics` file of your finalised timetable (with correct SGT timezone handling) for a given semester date range, ready to import into Google/Apple/Outlook calendar.
- **Accounts** — sign up / log in, plus a forgot-password flow with emailed OTP verification.
- **Saved schedules** — your generated timetable and settings are saved to your account and reloaded next time you log in.

## Tech Stack

**Frontend**
- React 19 + Vite
- React Router

**Backend**
- Node.js + Express
- PostgreSQL (via `pg`)
- bcrypt for password hashing
- Nodemailer (Gmail) for OTP emails

**Data source**
- [NUSMods API](https://api.nusmods.com/) — module and lesson data is seeded into Postgres

**Deployment**
- Frontend: [Vercel](https://vercel.com/)
- Backend: [Render](https://render.com/)
- Database: [Render](https://render.com/) (PostgreSQL)

## API Overview

| Method | Endpoint                    | Description                              |
|--------|------------------------------|-------------------------------------------|
| POST   | `/signup`                   | Create a new account                      |
| POST   | `/login`                    | Log in with email + password              |
| POST   | `/forgot-password`          | Request a password reset OTP by email     |
| POST   | `/verify-otp`               | Verify an OTP code                        |
| POST   | `/reset-password`           | Reset password using a verified OTP       |
| GET    | `/modules`                  | List all modules                          |
| GET    | `/modules/:code/lessons`    | List lessons for a given module           |
| POST   | `/schedules`                | Save/update a user's timetable            |
| GET    | `/schedules/:email`         | Fetch a user's saved timetable             |

## Acknowledgements

- Module and lesson data provided by [NUSMods](https://nusmods.com/).

















