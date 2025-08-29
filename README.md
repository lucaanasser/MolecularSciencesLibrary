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
docker compose -f docker-compose.dev.yml up --build
```

* Frontend → [http://localhost:3000](http://localhost:3000)
* API → [http://localhost:3001/api](http://localhost:3001/api)

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
    - [Development](#development)
    - [Production](#production)
    - [Backend only](#backend-only)
    - [Frontend only](#frontend-only)
  - [10. Core Workflows](#10-core-workflows)
  - [11. API Surface (Snapshot)](#11-api-surface-snapshot)
  - [12. Background Tasks](#12-background-tasks)
  - [13. Contribution Guide (Pull Requests)](#13-contribution-guide-pull-requests)
    - [Steps](#steps)
    - [Guidelines](#guidelines)
  - [14. Code Quality, Style \& Testing](#14-code-quality-style--testing)
  - [15. Roadmap](#15-roadmap)
  - [16. Security \& Hardening](#16-security--hardening)
  - [17. License (Public Domain – The Unlicense)](#17-license-public-domain--the-unlicense)
  - [18. Acknowledgements](#18-acknowledgements)

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

### Development

```bash
git clone https://github.com/lucaanasser/MolecularSciencesLibrary.git
cd MolecularSciencesLibrary
cp backend/.env.example backend/.env
docker compose -f docker-compose.dev.yml up --build
```

### Production

```bash
docker compose up -d --build
docker compose logs -f backend
```

### Backend only

```bash
cd backend
npm install
npm start
```

### Frontend only

```bash
cd frontend
npm install
npm run dev
```
---

## 10. Core Workflows

* 📖 Add Book → generate code + EAN13.
* 🟢 Borrow → validate policy, send email.
* 🔄 Renew → enforce max, update due\_date.
* ⏳ Extension → post max renewals only.
* 📬 Nudge → email + optional due\_date shorten.
* ↩️ Return → mark loan + email.
* 🗂️ Virtual Shelf → admin sets ranges, UI highlights.

---

## 11. API Surface (Snapshot)

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

## 12. Background Tasks

| Service   | Purpose                     | Frequency |
| --------- | --------------------------- | --------- |
| `cron`    | Overdues, reminders, nudges | Daily     |
| `backup`  | Upload DB to Google Drive   | Daily     |
| `certbot` | TLS renew & reload Nginx    | Daily     |

---

## 13. Contribution Guide (Pull Requests)

We *welcome* all contributions—code, docs, design, or even book donations.

### Steps

1. Fork → clone.
2. Branch: `feat/<desc>`, `fix/<desc>`...
3. Commit: `git commit -m "feat(books): add language filter"`.
4. Push → PR with rationale + screenshots/tests.

### Guidelines

* No secrets in commits.
* Clear, minimal scope.
* Follow emoji logging.
* Keep API stable.

---

## 14. Code Quality, Style & Testing

* ✍️ Small, pure functions.
* ✅ Controllers thin, Services clean.
* 🧩 Expand TS types (no `any`).
* 🧪 Planned: Vitest/Jest, Supertest, Playwright.
* 📊 Avoid N+1 DB queries.

---

## 15. Roadmap

* [x] Virtual bookshelf editing.
* [ ] Stronger type safety.
* [ ] Automated test suite.
* [ ] CSV import/export.
* [ ] i18n framework.
* [ ] PWA offline mode.
* [ ] Postgres adapter.
* [ ] Analytics & dashboards.

---

## 16. Security & Hardening

* 🔑 Rotate JWT secrets.
* 🍪 Consider httpOnly cookies for tokens.
* 🧹 Input sanitization (future: schema validation).
* 📧 Use app passwords for SMTP.
* 🔍 Regular `npm audit` + `docker scan`.

---

## 17. License (Public Domain – The Unlicense)

Released into the **public domain**.
Do whatever you want—use, remix, fork.

Attribution is optional, but **deeply appreciated**.

---

## 18. Acknowledgements

🙏 To the CM-USP community—students, alumni, staff, donors—who believe shared knowledge compounds.
💡 Special thanks to early collaborators & testers.

---

**Build something. Improve something. Share it back.**
PRs are open—so is the library.

Made with curiosity & care by students of Ciências Moleculares.
