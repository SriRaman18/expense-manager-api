# Project Structure

This project follows the **MVC (Model-View-Controller)** pattern with a clean, scalable architecture.

## Folder Structure

```
expense-manager-api/
├── src/
│   ├── config/              # Configuration files
│   │   └── database.ts      # Prisma client instance
│   │
│   ├── controllers/         # Request handlers (Controller layer)
│   │   ├── health.controller.ts
│   │   └── user.controller.ts
│   │
│   ├── services/            # Business logic (Service layer)
│   │   └── user.service.ts
│   │
│   ├── routes/              # Route definitions
│   │   ├── index.routes.ts  # Main router
│   │   ├── health.routes.ts
│   │   └── user.routes.ts
│   │
│   ├── middleware/          # Custom middleware
│   │   ├── errorHandler.middleware.ts
│   │   └── asyncHandler.middleware.ts
│   │
│   ├── types/               # TypeScript types and interfaces
│   │   ├── user.types.ts
│   │   └── error.types.ts
│   │
│   ├── app.ts               # Express app configuration
│   └── index.ts             # Application entry point
│
├── prisma/
│   └── schema.prisma        # Database schema (Model layer)
│
├── dist/                    # Compiled output (generated)
├── .env                     # Environment variables
├── package.json
└── README.md
```

## Architecture Overview

### MVC Pattern

```
Request → Routes → Controller → Service → Database
                ↓
            Response
```

### Layer Responsibilities

#### 1. **Routes** (`src/routes/`)

- Define API endpoints
- Map URLs to controllers
- Handle route-level middleware

#### 2. **Controllers** (`src/controllers/`)

- Handle HTTP requests and responses
- Validate request data
- Call services
- Format responses

#### 3. **Services** (`src/services/`)

- Contain business logic
- Interact with database (via Prisma)
- Handle data validation
- Throw custom errors

#### 4. **Models** (`prisma/schema.prisma`)

- Database schema definition
- Prisma generates the model layer automatically

#### 5. **Types** (`src/types/`)

- TypeScript interfaces
- DTOs (Data Transfer Objects)
- Type definitions for requests/responses

#### 6. **Middleware** (`src/middleware/`)

- Error handling
- Request/response processing
- Async error catching

#### 7. **Config** (`src/config/`)

- Database connection
- Environment configuration
- Shared instances

## Request Flow Example

### Creating a User

```
1. POST /api/users
   ↓
2. routes/user.routes.ts
   → asyncHandler middleware (catches errors)
   ↓
3. controllers/user.controller.ts
   → createUser() method
   ↓
4. services/user.service.ts
   → createUser() method
   → Validates email
   → Checks for duplicates
   → Creates user in database
   ↓
5. Response sent back through layers
```

### Error Handling Flow

```
Service throws AppError
   ↓
Caught by asyncHandler
   ↓
Passed to errorHandler middleware
   ↓
Formatted error response sent to client
```

## Benefits of This Structure

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Maintainability**: Easy to find and modify code
3. **Testability**: Each layer can be tested independently
4. **Scalability**: Easy to add new features
5. **Type Safety**: TypeScript types ensure data consistency
6. **Error Handling**: Centralized error handling
7. **Reusability**: Services can be reused across controllers

## Adding New Features

To add a new feature (e.g., Expenses):

1. **Update Schema**: Add model to `prisma/schema.prisma`
2. **Create Types**: Add types to `src/types/expense.types.ts`
3. **Create Service**: Add business logic to `src/services/expense.service.ts`
4. **Create Controller**: Add handlers to `src/controllers/expense.controller.ts`
5. **Create Routes**: Add routes to `src/routes/expense.routes.ts`
6. **Register Routes**: Add to `src/routes/index.routes.ts`

## Best Practices

- ✅ Keep controllers thin - only handle HTTP concerns
- ✅ Put business logic in services
- ✅ Use TypeScript types for all data structures
- ✅ Handle errors in middleware, not controllers
- ✅ Use asyncHandler for all async route handlers
- ✅ Keep services independent and reusable
- ✅ Validate data in services, not controllers
