# Arabic Educational Platform Backend

Modular Express & PostgreSQL backend structured for scalability and clean separation of concerns.

## Directory Structure

```
├── src/
│   ├── config/            # Env loading, DB connection, constants
│   │   └── index.js
│   ├── routes/            # URL definitions only
│   │   ├── index.js
│   │   └── user.routes.js
│   ├── controllers/       # Handle req/res, invoke services
│   │   └── user.controller.js
│   ├── services/          # Business logic
│   │   └── user.service.js
│   ├── models/            # DB queries & schema operations
│   │   └── user.model.js
│   ├── middlewares/       # Auth, validation, error handlers
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   ├── validators/        # Request input validation
│   │   └── user.validator.js
│   ├── utils/             # Helpers (logger, ApiError, asyncHandler)
│   ├── jobs/              # Background / Cron jobs orchestrator
│   ├── app.js             # Express app setup & middleware mounting
│   └── server.js          # Server entry & graceful shutdown
├── tests/
│   ├── unit/              # Unit tests
│   └── integration/       # Integration tests
├── scripts/               # DB seed, migration, & connection scripts
├── .env                   # Local secrets (never committed)
├── .env.example           # Example environment variables template
├── .gitignore             # Git ignore definitions
├── .eslintrc              # ESLint configuration
├── .prettierrc            # Prettier configuration
├── package.json
└── README.md
```

## Getting Started

### 1. Environment Setup
Copy `.env.example` to `.env` and fill in your PostgreSQL credentials:
```bash
cp .env.example .env
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Migration & Test
```bash
npm run db:init
npm run db:test
```

### 4. Development Server
```bash
npm run dev
```

### 5. Running Tests
```bash
npm test
```
