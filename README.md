# Employee Management System (EMS) - PERN STACK

A full-stack Employee Management System built with the PERN stack (PostgreSQL, Express.js, React, Node.js). This system supports two user roles (Manager and Employee), real-time chat, meeting scheduling, authentication, and role-based dashboards.

---

## Features

- **User Authentication**: Secure login/signup for managers and employees (JWT-based).
- **Role-based Dashboards**:
  - **Manager**: View/manage employees, handle meeting requests, chat with employees.
  - **Employee**: View/edit profile, request meetings with managers, chat with managers.
- **Meeting Scheduling**: Employees can request meetings; managers can accept/reject/delay them.
- **Real-time Chat**: Socket.io-based chat for meetings between employees and managers.
- **Database**: PostgreSQL with Knex.js and Objection.js ORM.
- **RabbitMQ**: Used for meeting request queueing (decouples meeting requests from processing).
- **Redis**: Used for JWT blacklist (logout and token invalidation).

---

## Technology Stack

- **Frontend**: React, Axios, React Router
- **Backend**: Node.js, Express.js, Knex.js, Objection.js
- **Database**: PostgreSQL
- **Real-time**: Socket.io
- **Queue**: RabbitMQ
- **Cache/Session**: Redis

---

## Project Structure

```
├── client/           # React frontend
│   ├── public/       # Static files
│   └── src/          # React components (App.js, Login.js, ...)
├── server/           # Express backend
│   ├── controllers/  # Route controllers (meetingController.js, ...)
│   ├── db/           # Database config (knex.js)
│   ├── migrations/   # Knex migration files
│   ├── models/       # Objection.js models
│   ├── routes/       # Express routes
│   ├── seeds/        # Seed data
│   └── index.js      # Main server entry point
├── README.md         # Project documentation
└── .gitignore        # Node modules ignored
```

---

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL
- Redis
- RabbitMQ

### 1. Clone the Repository
```powershell
git clone https://github.com/smmk47/Employee_Management_System_-EMS-_PERN-STACK.git
cd Employee_Management_System_-EMS-_PERN-STACK
```

### 2. Setup the Backend (server)
```powershell
cd server
npm install
```

- Create a `.env` file in `server/` with the following (edit as needed):
  ```env
  DATABASE_URL=postgres://username:password@localhost:5432/ems_db
  JWT_SECRET=your_jwt_secret
  RABBIT_URL=amqp://localhost
  REDIS_URL=redis://localhost:6379
  ```

- Run database migrations and seeds:
  ```powershell
  npx knex migrate:latest
  npx knex seed:run
  ```

- Start the backend server:
  ```powershell
  npm run dev
  # or
  npm start
  ```

### 3. Setup the Frontend (client)
```powershell
cd ../client
npm install
npm start
```

The React app will run on [http://localhost:3000](http://localhost:3000) and the backend on [http://localhost:5000](http://localhost:5000) by default.

---

## Usage
- Register as a manager or employee.
- Employees can request meetings with managers and chat in real-time.
- Managers can view/manage employees, handle meeting requests, and chat.

---

## Key Scripts
- **Backend**:
  - `npm run dev` — Start server with nodemon
  - `npm start` — Start server
  - `npx knex migrate:latest` — Run migrations
  - `npx knex seed:run` — Seed database
- **Frontend**:
  - `npm start` — Start React app

---

## Database Structure (Main Tables)
- **users**: id, name, email, password, role
- **meetings**: id, employee_id, manager_id, requested_at, scheduled_for, status, reason
- **chat_messages**: id, meeting_id, sender_id, message, sent_at

---

## Environment Variables
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — JWT secret for authentication
- `RABBIT_URL` — RabbitMQ connection string
- `REDIS_URL` — Redis connection string

---

## Notes
- Do not commit `.env` or any sensitive credentials.
- `node_modules` are excluded from git.
- For production, update CORS and environment variables as needed.

---

## License
MIT
