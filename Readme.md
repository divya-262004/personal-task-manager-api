# Personal Task Manager API

A RESTful task management API built with **Node.js, Express.js, PostgreSQL, and Sequelize**.

The project provides JWT-based authentication, password hashing with bcrypt, protected task CRUD operations, validation, filtering, sorting, pagination, rate limiting, centralized error handling, Winston logging, and custom in-memory caching.

## Features

- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Protected task routes
- Task CRUD operations
- User-based task ownership
- Request validation
- Filtering by priority, status, and due-date range
- Sorting by due date and priority
- Pagination with `page` and `limit`
- Custom in-memory caching with TTL
- Cache invalidation after task create/update/delete
- Request rate limiting
- Centralized error handling
- Winston application logging
- PostgreSQL database with Sequelize ORM
- Sequelize migrations

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Sequelize
- JSON Web Token (`jsonwebtoken`)
- bcrypt
- Winston
- Nodemon / Node watch
- JavaScript (ES Modules)

## Project Structure

```text
personal-task-manager-api/
├── config/
│   ├── config.js
│   └── SequelizeConfig.cjs
├── connection/
│   └── database.js
├── controllers/
│   ├── authController.js
│   └── taskController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── errorMiddleWare.js
│   ├── ratelimiting.js
│   └── taskValidation.js
├── migrations/
│   ├── 20261001055854-create-user.js
│   ├── 20261001062044-create-task.js
│   └── package.json
├── models/
│   ├── index.js
│   ├── task.js
│   └── user.js
├── routes/
│   ├── authRoutes.js
│   └── taskRoutes.js
├── services/
│   ├── authService.js
│   └── taskService.js
├── utils/
│   ├── AppError.js
│   ├── cache.js
│   └── logger.js
├── .env
├── .gitignore
├── .sequelizerc
├── app.js
├── package.json
└── package-lock.json
```

## Database Design

### User

| Field | Description |
|---|---|
| `id` | Primary key, auto-increment |
| `username` | Unique username |
| `email` | Unique email |
| `password` | Hashed password |
| `createdAt` | Creation timestamp |
| `updatedAt` | Last update timestamp |

### Task

| Field | Description |
|---|---|
| `id` | Primary key, auto-increment |
| `title` | Required task title |
| `description` | Optional task description |
| `priority` | `low`, `medium`, or `high` |
| `dueDate` | Required due date |
| `status` | `pending` or `completed` |
| `userId` | Foreign key referencing the user |
| `createdAt` | Creation timestamp |
| `updatedAt` | Last update timestamp |

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=task_manager
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret
```

Do not commit `.env` to Git.

## Installation

### 1. Install dependencies

```bash
npm install
```

### 2. Configure PostgreSQL

Create the PostgreSQL database configured in `.env`.

### 3. Run migrations

```bash
npx sequelize-cli db:migrate
```

### 4. Start the server

```bash
npm run dev
```

The API runs on:

```text
http://localhost:3000
```

## API Endpoints

### Health Check

```http
GET /
```

### Authentication

#### Register

```http
POST /auth/register
```

Body:

```json
{
  "username": "hema",
  "email": "hema@gmail.com",
  "password": "your_password"
}
```

#### Login

```http
POST /auth/login
```

Body:

```json
{
  "email": "hema@gmail.com",
  "password": "your_password"
}
```

The login response returns a JWT token.

For protected routes, send:

```http
Authorization: Bearer <JWT>
```

## Task Endpoints

All task routes require authentication.

### Create a Task

```http
POST /tasks
```

Body:

```json
{
  "title": "Learn Express",
  "description": "Build task manager API",
  "priority": "high",
  "dueDate": "2026-10-10",
  "status": "pending"
}
```

### Get All Tasks

```http
GET /tasks
```

### Get a Task by ID

```http
GET /tasks/:id
```

Example:

```http
GET /tasks/1
```

### Update a Task

```http
PATCH /tasks/:id
```

Example body:

```json
{
  "title": "Learn Express and Sequelize",
  "priority": "medium",
  "status": "completed"
}
```

### Delete a Task

```http
DELETE /tasks/:id
```

## Filtering

The `GET /tasks` endpoint supports optional filters.

### Priority

```http
GET /tasks?priority=high
```

Allowed values:

```text
low
medium
high
```

### Status

```http
GET /tasks?status=pending
```

Allowed values:

```text
pending
completed
```

### Due-Date Range

```http
GET /tasks?dueDateFrom=2026-10-01&dueDateTo=2026-10-31
```

## Sorting

### By Due Date

Ascending:

```http
GET /tasks?sortBy=dueDate&order=asc
```

Descending:

```http
GET /tasks?sortBy=dueDate&order=desc
```

### By Priority

Ascending:

```http
GET /tasks?sortBy=priority&order=asc
```

Priority order:

```text
low → medium → high
```

Descending:

```http
GET /tasks?sortBy=priority&order=desc
```

## Pagination

Pagination uses `page` and `limit` query parameters:

```http
GET /tasks?page=1&limit=10
```

For example:

```text
page = 2
limit = 3
```

means the API returns the second page with up to 3 tasks.

The offset is calculated as:

```text
offset = (page - 1) * limit
```

The response includes pagination metadata such as:

```json
{
  "tasks": [],
  "totalTasks": 10,
  "currentPage": 1,
  "totalPages": 4,
  "limit": 3
}
```

## Combined Task Query

Filtering, sorting, and pagination can be combined in one request:

```http
GET /tasks?priority=high&status=pending&sortBy=dueDate&order=asc&page=1&limit=5
```

## Caching

The project uses a custom **in-memory cache** built with JavaScript `Map`.

Cache keys include the authenticated user ID and the task query options so that different users and different filter/sort/pagination combinations do not share the wrong result.

Cached task lists use a TTL and are invalidated when a task is:

- created
- updated
- deleted

### Cache Flow

```text
GET /tasks
    ↓
Create cache key
    ↓
Check cache
    ├── Cache hit → return cached result
    └── Cache miss
            ↓
       Query PostgreSQL
            ↓
       Store result in cache
            ↓
         Return result
```

The current cache is process-local, so restarting the Node.js application clears the cache.

## Middleware

### Authentication Middleware

Verifies JWT tokens and attaches the authenticated user's ID to the request.

```text
Authorization: Bearer <JWT>
        ↓
jwt.verify()
        ↓
req.userId
```

### Task Validation

Validates task request bodies and task query parameters, including:

- required task fields
- title
- priority
- status
- due date
- filtering values
- sorting values
- pagination values

### Rate Limiting

Limits repeated requests from a client within a configured time window and returns HTTP `429` when the limit is exceeded.

### Error Handling

The project uses a custom `AppError` class together with global error-handling middleware to return standardized JSON error responses.

Example:

```json
{
  "message": "Task not found"
}
```

### Logging

Winston is used for application-level logging, including database connection and server startup messages and unexpected application errors.

## Request Flow

### Authentication

```text
Client
  ↓
Auth Route
  ↓
Auth Controller
  ↓
Auth Service
  ↓
PostgreSQL
```

### Protected Task Request

```text
Client
  ↓
JWT Authentication Middleware
  ↓
Task Validation
  ↓
Task Controller
  ↓
Task Service
  ↓
Cache
  ↓
PostgreSQL
```

## Sequelize Migrations

Run migrations:

```bash
npx sequelize-cli db:migrate
```

Undo the latest migration:

```bash
npx sequelize-cli db:migrate:undo
```