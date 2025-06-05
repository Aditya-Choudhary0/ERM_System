# Engineering Resource Management System

## Overview

This is a full-stack web application designed to help managers efficiently manage engineering team assignments across various projects. It enables tracking of engineer capacity, allocation of personnel, and a comprehensive view of team workload and availability.

The application is composed of:

- **Frontend**: React (Vite + TypeScript + Tailwind CSS)
- **Backend**: Node.js (Express.js) with a PostgreSQL database 

---

## Features

### 🔐 Authentication & User Roles
- Secure login with role-based access (Manager, Engineer)
- Managers: Full access to projects and assignments
- Engineers: View assigned projects and tasks

### 👨‍💻 Engineer Management
- Detailed engineer profiles (skills, seniority, employment type)
- Visual capacity tracking (based on FTE/Part-time availability)

### 📁 Project Management
- Manage project details (name, dates, team size, skills)
- Project status tracking: Planning, Active, Completed

### 🧩 Assignment System
- Assign engineers to projects with % allocation
- View who’s working on what and for how long

### 📊 Dashboard Views
- Manager Dashboard: Team overview, capacity insights
- Engineer Dashboard: Personal assignments and timeline

### 🔄 CRUD Operations
- Create, Read, Update, Delete for:
  - Engineers
  - Projects
  - Assignments

---

## Technologies Used

### Frontend (`./client`)
- **React.js**
- **Vite**
- **TypeScript**
- **Tailwind CSS**
- **React Hook Form**

### Backend (`./backend`)
- **Node.js**
- **Express.js**
- **PostgreSQL**
- **pg**, **bcryptjs**, **jsonwebtoken**, **cors**

---

## Prerequisites

Ensure you have the following installed:

- Node.js (v18+ recommended)
- npm or Yarn
- PostgreSQL
- Git

---

## Getting Started (Local Development)

### 1. Clone the Repository
```bash
git clone https://github.com/Aditya-Choudhary0/ERM_System.git
cd ERM_System
````

### 2. Backend Setup

```bash
cd server
npm install # or yarn install
```

#### `.env` Configuration (`backend/.env`)

```env
DATABASE_URL='Your deployed database url'

PORT = 3000

JWT_SECRET = 'Secret Token'
```

#### Create PostgreSQL Database

```sql
CREATE DATABASE your_pg_database_name;
```

> Apply the schema and seed data using the provided SQL or migration script.

#### Start Backend Server

```bash
npm start
```

Server will run at `http://localhost:3000`

---

### 3. Frontend Setup

```bash
cd ../erm-frontend
npm install # or yarn install
```

#### `.env` Configuration (`client/.env`)

```env
VITE_APP_API_BASE_URL=http://localhost:3000/api
```

#### Start Frontend Server

```bash
npm run dev
```

Frontend will run at `http://localhost:5173`

---

## API Endpoints

*All endpoints are prefixed with `/api` and require `Authorization: Bearer <token>` header.*

### Authentication

* `POST /api/auth/login`
* `GET /api/auth/profile`

### Engineers

* `GET /api/engineers`
* `GET /api/engineers/:id/capacity`
* `PUT /api/engineers/:id`
* `GET /api/engineers/suitable`

### Projects

* `GET /api/projects`
* `POST /api/projects`
* `PUT /api/projects/:id`

### Assignments

* `GET /api/assignments`
* `POST /api/assignments`
* `PUT /api/assignments/:id`
* `DELETE /api/assignments/:id`

---

## Demo Credentials

### Manager

* **Email**: `manager1@example.com`
* **Password**: `managerpass`

### Engineer

* **Email**: `john.doe@example.com`
* **Password**: `engineerpass1`

---

## Deployment on Render

### Backend (Node.js Web Service)

1. Provision a PostgreSQL instance on Render
2. Apply schema & seed data using a PostgreSQL client
3. Deploy backend:

   * Root: `backend`
   * Build: `npm install`
   * Start: `node server.js`
   * Set environment variables

### Frontend (Static Site)

1. Update `client/.env` with deployed backend URL:

   ```env
   VITE_APP_API_BASE_URL=https://your-backend-service.onrender.com/api
   ```
2. Build the frontend:

   ```bash
   npm run build
   ```
3. Deploy to Render as a static site

   * Root: `client`
   * Build Command: `npm run build`
   * Publish Directory: `dist`

### Finalize CORS

Update backend `CORS_ORIGIN` to:

```
CORS_ORIGIN=https://your-frontend-app.onrender.com
```

---

## Database Schema Overview

**Tables**: `users`, `projects`, `assignments`

### users

| Column         | Type    | Notes                   |
| -------------- | ------- | ----------------------- |
| id             | VARCHAR | Primary key             |
| email          | VARCHAR | Unique, for login       |
| password\_hash | VARCHAR | Hashed password         |
| name           | VARCHAR | Full name               |
| role           | VARCHAR | `manager` or `engineer` |
| skills         | TEXT\[] | Skillset array          |
| seniority      | VARCHAR | Junior/Mid/Senior       |
| max\_capacity  | INTEGER | 100 for FT, 50 for PT   |
| department     | VARCHAR | Department name         |

### projects

| Column           | Type    | Notes                     |
| ---------------- | ------- | ------------------------- |
| id               | VARCHAR | Primary key               |
| name             | VARCHAR | Project name              |
| description      | TEXT    | Project summary           |
| start\_date      | DATE    | Start of project          |
| end\_date        | DATE    | End of project            |
| required\_skills | TEXT\[] | Required skills           |
| team\_size       | INTEGER | Target team size          |
| status           | VARCHAR | planning/active/completed |
| manager\_id      | VARCHAR | FK to `users.id`          |

### assignments

| Column                 | Type    | Notes               |
| ---------------------- | ------- | ------------------- |
| id                     | VARCHAR | Primary key         |
| engineer\_id           | VARCHAR | FK to `users.id`    |
| project\_id            | VARCHAR | FK to `projects.id` |
| allocation\_percentage | INTEGER | 0–100%              |
| start\_date            | DATE    | Assignment start    |
| end\_date              | DATE    | Assignment end      |
| role                   | VARCHAR | Engineer's role     |

---

## 🤖 AI-Assisted Development

### Tools Used

Throughout the development of this project, AI tools were integrated into the workflow to improve speed, productivity, and learning. The following tools were used:

- **ChatGPT (GPT-4)**: Used for architectural planning, code debugging, schema design, and documentation generation (including this README).
- **Gemini**: Used for the query building and routing and debugging in the typescrit error.

### How AI Accelerated Development

Here are some specific examples of how AI meaningfully contributed:

- **Initial Backend Scaffold**: AI generated the Express.js project structure, JWT-based auth middleware, and the initial PostgreSQL schema layout in minutes, which would have taken hours manually.
- **Form Validation with React Hook Form**: AI provided instantly working code snippets to integrate complex validation rules without digging into documentation.
- **SQL Query Assistance**: AI helped write and optimize PostgreSQL queries for joining engineer assignments with capacity data.
- **Error Explanation & Debugging**: During integration, AI quickly explained cryptic TypeScript or Postgres errors and suggested viable fixes, especially around type mismatches and CORS configurations.

---

### Challenges with AI-Generated Code

While AI was a huge help, there were several challenges:

- **Overconfidence in Responses**: Some AI-generated code looked valid but included non-existent properties or misused libraries (e.g., outdated JWT examples).
- **Security Assumptions**: The original JWT setup generated by AI didn’t include token expiration checks or refresh logic, which had to be manually revised for production readiness.
- **Ambiguous Database Schema Suggestions**: AI initially mixed some business logic into the schema (like including calculated fields), which had to be cleaned up to maintain normalization.

**How we resolved it:**

- Manually cross-referenced AI-generated output with official docs and trusted community examples.
- Wrote unit tests or manual test cases for all critical logic (auth, assignments, etc.).
- Kept AI as a *collaborator* not an *authority*, treating its output as a draft or prototype.

---

### Approach to Validating AI Suggestions

To responsibly integrate AI into the workflow, we followed this process:

1. **Read Before You Run**: Never copy-pasted code blindly. Every suggestion was reviewed line-by-line for side effects and accuracy.
2. **Compare with Documentation**: Confirmed AI-generated API usages (e.g., `bcryptjs`, `pg`, `express`) against official documentation.
3. **Isolated Testing**: When in doubt, created small test files or sandboxes to run and verify AI snippets before integrating into the main codebase.
4. **Git Commits as Checkpoints**: After major AI-generated changes, used `git commit` checkpoints to easily revert and compare AI output against stable versions.

---

Overall, AI tools significantly enhanced velocity and helped solve unfamiliar problems faster. However, their true value was unlocked only when combined with a strong understanding of the project goals, technology stack, and good developer judgment.

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── controllers/    # Route logic
│   │   ├── models/         # DB queries
│   │   ├── routes/         # API routes
│   │   └── server.js       # App entry
│   ├── .env.example
│   └── package.json
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── types.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── index.html
```

---

## Contributing

Feel free to fork this repository, create a feature branch, and submit a pull request.

---

