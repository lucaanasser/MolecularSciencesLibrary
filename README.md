# 📚 Molecular Sciences Library (Biblioteca do curso de Ciências Moleculares da USP)

[![License: Unlicense](https://img.shields.io/badge/license-Unlicense-blue.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![Made with ❤️ by Students](https://img.shields.io/badge/made%20by-students-red)](#18-acknowledgements)

> “Knowledge grows when it is shared.”
> An open, student-driven platform to **map, preserve, and amplify** the collective learning resources of the Undergraduate Program in Molecular Sciences (Ciências Moleculares) at USP.

---

The *Molecular Sciences Library* is a fully open-source initiative created **by students, for students** of the Ciências Moleculres USP community.

It started from a simple pain: *books existed, but discovery was hard, circulation was messy, and collective memory was fragile*.

We decided to fix that by building an extensible, transparent and collaborative system that:

* 📖 Catalogs every physical item with structured codes & metadata.
* 🔍 Makes searching intuitive (area, subarea, language, status, availability, lending state).
* 🗂️ Models the **physical arrangement** through a Virtual Bookshelf (digital ↔ real shelves).
* 🔄 Automates loans, renewals, extensions, overdue flows & didactic reservations.
* ✉️ Sends meaningful notifications (borrow, return, renewal, extension, nudges, custom).
* 🏅 Encourages engagement (badges, donor registry, contribution recognition).
* 🌍 Stays totally open: **your pull requests shape the next iteration**.

Created and initially maintained by **Luca Marinho** and **Helena Reis** (Turma 33).
Now, *you*—students, alumni, contributors—are invited to help grow this into a living academic commons.

---

## 🚀 Quick Start (for the impatient)

```bash
git clone https://github.com/lucaanasser/MolecularSciencesLibrary.git
cd MolecularSciencesLibrary
cp backend/.env.example backend/.env   # edit as needed

# Setup aliases (optional but recommended)
bash scripts/setup-aliases.sh
source ~/.bash_aliases

# Run with interactive menu
npm run dev
```

* Frontend → [http://localhost:8080](http://localhost:8080)
* API → [http://localhost:3001/api](http://localhost:3001/api)

**Pro tip:** After setup, just type `dev` from anywhere to start! 🎯

---

## 📑 Table of Contents

- [📚 Molecular Sciences Library (Biblioteca do curso de Ciências Moleculares da USP)](#-molecular-sciences-library-biblioteca-do-curso-de-ciências-moleculares-da-usp)
  - [🚀 Quick Start (for the impatient)](#-quick-start-for-the-impatient)
  - [📑 Table of Contents](#-table-of-contents)
  - [1. Vision \& Philosophy](#1-vision--philosophy)
  - [2. Feature Overview](#2-feature-overview)
  - [3. Architecture \& Technology Stack](#3-architecture--technology-stack)
  - [4. Directory Structure (Condensed)](#4-directory-structure-condensed)
  - [5. Data \& Domain Model (High-Level)](#5-data--domain-model-high-level)
  - [6. Logging \& Conventions](#6-logging--conventions)
  - [7. Environments (Development vs Production)](#7-environments-development-vs-production)
  - [8. Environment Variables (Backend Example)](#8-environment-variables-backend-example)
  - [9. Running the Project](#9-running-the-project)
    - [Quick Commands (with aliases)](#quick-commands-with-aliases)
    - [Development](#development)
    - [Production](#production)
  - [10. Developer Scripts \& Automation](#10-developer-scripts--automation)
  - [11. Core Workflows](#11-core-workflows)
  - [12. API Surface (Snapshot)](#12-api-surface-snapshot)
  - [13. Background Tasks](#13-background-tasks)
  - [14. Contribution Guide (Pull Requests)](#14-contribution-guide-pull-requests)
    - [Steps](#steps)
    - [Guidelines](#guidelines)
  - [15. Code Quality, Style \& Testing](#15-code-quality-style--testing)
  - [16. Roadmap](#16-roadmap)
  - [17. Security \& Hardening](#17-security--hardening)
  - [18. License (Public Domain – The Unlicense)](#18-license-public-domain--the-unlicense)
  - [19. Acknowledgements](#19-acknowledgements)

---

## 1. Vision & Philosophy

We believe an academic library is **infrastructure for imagination**.

This project:

* 🎯 Treats operational clarity (statuses, rules, due windows) as UX.
* 🗂️ Sees physical arrangement (shelves) as a navigable data model.
* 🔓 Embraces openness: everything auditable, extensible, remixable.
* ⚡ Prefers *pragmatic simplicity* over premature abstraction.
* 🧪 Welcomes experimentation: modular and replaceable features.

Fork it, extend it, adapt it—**that’s the point**.

---

## 2. Feature Overview

| Domain                | Highlights                                                                                |
| --------------------- | ----------------------------------------------------------------------------------------- |
| 📚 Books              | Structured codes `AREA-SUBAREA.SEQ v.X`, EAN-13 ID, filtering, didactic reservation flag. |
| 🗂️ Virtual Bookshelf | Logical ordering of shelves & rows with start/end code ranges.                            |
| 🔄 Loans              | Authenticated by NUSP, renewals, due windows, extension blocks.                           |
| ⏳ Extensions & Nudges | Policy-driven logic for eligibility & shortened due dates.                                |
| ⚙️ Rules Engine       | Admin-editable runtime parameters (limits, cooldowns, multipliers).                       |
| ✉️ Notifications      | Internal + email (borrow, return, renewal, extension, nudge, custom).                     |
| 👤 Users              | Roles (`admin`, `aluno`, `proaluno` kiosk), password reset, profile image.                |
| 🏅 Badges             | Unlockable achievements.                                                                  |
| 🎁 Donors             | Registry & filters (internal vs external).                                                |
| 📬 Forms              | “Help the Library” contribution form with confirmation email.                             |
| 🤖 Automation         | Daily cron for overdues, Google Drive backups, Certbot renewal.                           |

---

## 3. Architecture & Technology Stack

**Backend:** Node.js (Express), SQLite (WAL), JWT, Nodemailer.
**Frontend:** React + TypeScript + Vite, React Query, TailwindCSS + shadcn/ui.
**Infra:** Docker, Nginx, Certbot, sidecar cron/backup.
**Observability:** Semantic console logging with emoji stages.

```
Client (React) ──> REST API (Express) ──> Services ──> Models ──> SQLite
                          │
                          ├──> Email Service
                          ├──> Notifications
                          └──> Cron / Backup / Certbot
```

---

## 4. Directory Structure (Condensed)

```
backend/
  src/{routes,controllers,services,models,middlewares,database}
  scripts/ (overdue, seeding, imports)
frontend/
  src/features/{books,loans,users,notifications,rules,donators}
  src/{components,services,hooks,utils}
certbot/   (ACME challenges)
database/  (SQLite persistent files)
ssl/       (prod certs)
ssl-dev/   (dev certs)
scripts/   (backup, automation)
```

---

## 5. Data & Domain Model (High-Level)

* **books**: id (EAN13), area, subarea, title, edition, volume, language, reserved.
* **loans**: book\_id, student\_id, due\_date, returned\_at, renewals, is\_extended.
* **rules**: runtime policy (singleton).
* **users**: id, NUSP, role, password\_hash, email, class, profile\_image.
* **notifications**: user\_id, type, message, metadata, read state.
* **badges** & **user\_badges**.
* **donators**: name, type, linked user (optional).

---

## 6. Logging & Conventions

Emoji stages keep logs scannable:

* 🔵 Start
* 🟢 Success
* 🟡 Warning/alternate
* 🔴 Error

---

## 7. Environments (Development vs Production)

| Aspect   | Dev                     | Prod                          |
| -------- | ----------------------- | ----------------------------- |
| Frontend | `http://localhost:3000` | Public domain (TLS)           |
| Backend  | `3001` (http/https)     | Behind Nginx TLS              |
| Reload   | Hot-reload              | Static build                  |
| Sidecars | Skipped                 | Enabled (cron/backup/certbot) |
| Certs    | `ssl-dev/` self-signed  | `ssl/` auto-renew             |

---

## 8. Environment Variables (Backend Example)

```ini
JWT_SECRET=change_me
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=you@example.com
SMTP_PASS=app_password
KIOSK_ALLOWED_IP=123.455.78.90
```

---

## 9. Running the Project

### Quick Commands (with aliases)

After running `bash scripts/setup-aliases.sh` once:

```bash
# Development
dev           # Interactive development menu
save          # Git add + commit + push (prompts for message)

# Production (VPS)
deploy        # Git pull + restart with SSL & prune
restart       # Restart containers with cleanup
rebuild       # Full rebuild from scratch

# Monitoring
logs          # Live container logs
status        # Container status
stop          # Stop all containers

# Database
db            # Open SQLite CLI
seed          # Populate database with sample data
backup        # Manual backup to Google Drive
scrape        # Update USP disciplines

# Utilities
aliases       # Show all available commands
biblioteca    # Navigate to project directory
```

### Development

**Option 1: Interactive Menu** (Recommended)
```bash
npm run dev
# or just: dev (if aliases are set up)
```

Choose from 6 development modes:
1. Full Docker Compose (frontend + backend)
2. Frontend only (Vite dev server)
3. Backend in Docker + Frontend local (hot-reload)
4. Backend only (nodemon)
5. Backend Docker only
6. Both frontend + backend local (best DX!)

**Option 2: Manual Docker Compose**
```bash
docker compose -f docker-compose.dev.yml up --build
```

### Production

**On VPS:**
```bash
cd MolecularSciencesLibrary
git pull
npm run start
# or just: deploy (if aliases are set up)
```

The production script automatically:
- Stops existing containers
- Cleans old images (`docker system prune`)
- Copies SSL certificates
- Starts fresh containers
- Shows status

---

## 10. Developer Scripts & Automation

| Script | Command | Purpose |
|--------|---------|---------|
| **Development** |
| `start-dev.sh` | `npm run dev` / `dev` | Interactive development menu with 6 modes |
| `save.sh` | `save "message"` | Quick git add + commit + push |
| **Production** |
| `start-production.sh` | `npm run start` / `restart` | Deploy with SSL + cleanup |
| `setup-aliases.sh` | Run once | Configure global shortcuts |
| `show-aliases.sh` | `aliases` | Display all available commands |
| **Database** |
| `seed_database.js` | `npm run seed` / `seed` | Populate with sample data |
| `importCsv.js` | `npm run import:csv file.csv` | Import books from CSV |
| `clean_test_scenarios.js` | `npm run clean:test` | Remove test data |
| **Maintenance** |
| `backup_db_to_gdrive.sh` | `npm run backup` / `backup` | Upload DB to Google Drive |
| `scrapeUSPDisciplines.js` | `npm run scrape:disciplines` / `scrape` | Update USP course catalog |
| `checkOverdues.js` | Cron daily | Check overdue loans + send emails |
| `troubleshoot.sh` | `npm run troubleshoot` | System diagnostics |

**Background Services** (Production only):
- `cron` → Daily overdue checks & notifications
- `backup` → Daily Google Drive backups  
- `certbot` → Automatic SSL renewal

---

## 11. Core Workflows

* 📖 Add Book → generate code + EAN13.
* 🟢 Borrow → validate policy, send email.
* 🔄 Renew → enforce max, update due\_date.
* ⏳ Extension → post max renewals only.
* 📬 Nudge → email + optional due\_date shorten.
* ↩️ Return → mark loan + email.
* 🗂️ Virtual Shelf → admin sets ranges, UI highlights.

---

## 12. API Surface (Snapshot)

```http
/books (GET filter, POST add, DELETE, POST borrow|return)
/loans (GET, POST create, PUT renew, PUT extend)
/rules (GET, PUT)
/notifications (GET, POST, PATCH read)
/users (POST create, POST login, GET /me)
/virtual-bookshelf (GET, PUT config)
/forms/submit (help form)
```

🔐 Auth → Bearer JWT.

---

## 13. Background Tasks

| Service   | Purpose                     | Frequency |
| --------- | --------------------------- | --------- |
| `cron`    | Overdues, reminders, nudges | Daily     |
| `backup`  | Upload DB to Google Drive   | Daily     |
| `certbot` | TLS renew & reload Nginx    | Daily     |

---

## 14. Contribution Guide (Pull Requests)

We *welcome* all contributions—code, docs, design, or even book donations.

### Steps

1. Fork → clone.
2. Branch: `feat/<desc>`, `fix/<desc>`...
3. Commit: `git commit -m "feat(books): add language filter"`.
4. Push → PR with rationale + screenshots/tests.

**Quick commit:** Use `save "your message"` for instant add + commit + push! 🚀

### Guidelines

* No secrets in commits.
* Clear, minimal scope.
* Follow emoji logging.
* Keep API stable.

---

## 15. Code Quality, Style & Testing

* ✍️ Small, pure functions.
* ✅ Controllers thin, Services clean.
* 🧩 Expand TS types (no `any`).
* 🧪 Planned: Vitest/Jest, Supertest, Playwright.
* 📊 Avoid N+1 DB queries.

---

## 16. Roadmap

* [x] Virtual bookshelf editing.
* [x] Developer automation scripts.
* [x] Interactive development menu.
* [x] Global command aliases.
* [x] Automated deployment workflow.
* [ ] Stronger type safety.
* [ ] Automated test suite.
* [ ] CSV import/export UI.
* [ ] i18n framework.
* [ ] PWA offline mode.
* [ ] Postgres adapter.
* [ ] Analytics & dashboards.

---

## 17. Security & Hardening

* 🔑 Rotate JWT secrets.
* 🍪 Consider httpOnly cookies for tokens.
* 🧹 Input sanitization (future: schema validation).
* 📧 Use app passwords for SMTP.
* 🔍 Regular `npm audit` + `docker scan`.

---

## 18. License (Public Domain – The Unlicense)

Released into the **public domain**.
Do whatever you want—use, remix, fork.

Attribution is optional, but **deeply appreciated**.

---

## 19. Acknowledgements

🙏 To the CM-USP community—students, alumni, staff, donors—who believe shared knowledge compounds.
💡 Special thanks to early collaborators & testers.

---

**Build something. Improve something. Share it back.**
PRs are open—so is the library.

Made with curiosity & care by students of Ciências Moleculares.
