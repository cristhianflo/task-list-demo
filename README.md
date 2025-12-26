# Task List App

This project is a demo task management system designed to showcase a full-stack application built with modern web technologies. It allows users to authenticate securely using AWS Cognito and manage personal tasks through a simple, intuitive interface. Key functionalities include creating, viewing, updating, and completing tasks, with data persisted in a MySQL database. The app demonstrates integration between Next.js for rendering and API handling, Auth.js for authentication, Drizzle ORM for database operations, and AWS Lambda for serverless task processing.

## Technologies

This project utilizes the following stack:

| Category           | Technologies                            |
| ------------------ | --------------------------------------- |
| Front-end/Back-end | Next.js 16                              |
| Language           | TypeScript                              |
| Authentication     | Auth.js v5, AWS Cognito                 |
| Database           | MySQL                                   |
| ORM                | Drizzle ORM, Drizzle-Kit                |
| Validation         | Zod                                     |
| UI                 | Material UI (MUI), TailwindCSS          |
| Testing            | Jest (Unit, Integration), Cypress (E2E) |
| Infrastructure     | Vercel, AWS Lambda, AWS Cognito         |

## Features

- **User Authentication**: Secure signup/login via AWS Cognito, with session management and callbacks for enriched user data.
- **Task Management**: Create, read, update, and delete tasks; update task status (e.g., mark as complete).
- **Database Integration**: Persistent storage using MySQL with Drizzle ORM, including schema migrations.
- **API Handling**: Server-side API routes for task operations, supplemented by AWS Lambda for specific actions like task completion.
- **Testing Coverage**: Unit tests with Jest (type-safe) for components and logic; end-to-end tests with Cypress covering auth flows, logout, and task interactions.
- **UI/UX Elements**: Toast notifications for feedback, global styling, and separated routes for authenticated/guest users.

## What I Learned

During this project i utilized for the first time multiple technologies that provided a decent challenge when it came to integrate everything together.

### AWS Cognito

This was my first time using an auth provider, it was difficult at first but when everything was setup i appreciate it how seammless i had authentication in my whole app!

### Cloud functions

I never realized how convenient serverless can be until this project, having develop a quick AWS Lambda Function taught me how powerful and easy is it to integrate server functionality in a project that don't even need a backend to begin with.

### Component libraries

Using Material UI was a smooth experience, not having to worry about creating small components like table rows, buttons, etc, speeds the development process significantly.

### Testing experience

Cypress documentation was delightful and writing E2E tests with it feel natural and intuitive

## Running the project (Development)

To get the app running locally:

Clone the repository: `git clone https://github.com/cristhianflo/task-list-demo.git`
Install dependencies: `npm install` (or `yarn install`, `pnpm install`, `bun install`)
Copy `.env.example` to `.env` and fill in the required variables (see Environment Variables section).
Run the development server: `npm run dev` (or equivalent with yarn/pnpm/bun)
Open `http://localhost:3000` in your browser.

The app will hot-reload on changes. For database setup, run migrations using Drizzle commands as configured in drizzle.config.ts

## Environment Variables

Refer to `.env.example` for the full list. Essential variables include:

- `DATABASE_URL`: Connection string for MySQL database (e.g., mysql://user:password@host:port/dbname).
- `COGNITO_CLIENT_ID`: AWS Cognito app client ID for authentication.
- `COGNITO_CLIENT_SECRET`: Secret for Cognito client.
- `COGNITO_ISSUER`: Cognito user pool issuer URL.
- `AUTH_SECRET`: Secret for Auth.js session encryption.
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`: For AWS Lambda and other services.
- Other variables for testing or deployment as needed.

These ensure proper integration with external services. Always keep sensitive values secure and avoid committing .env to version control.

## API Endpoints

The app uses Next.js API routes under `src/app/api` for backend logic, with additional serverless support via AWS Lambda. Inferred endpoints based on structure:

| Endpoint                  | Method    | Description                                     |
| ------------------------- | --------- | ----------------------------------------------- |
| `/api/auth/[...nextauth]` | GET/POST  | Handles authentication routes via Auth.js.      |
| `/api/tasks`              | GET       | Retrieves list of tasks for authenticated user. |
| `/api/tasks`              | POST      | Creates a new task.                             |
| `/api/tasks/[id]`         | PATCH     | Updates a task (title and description).         |
| `/api/tasks/[id]`         | DELETE    | Deletes a task.                                 |
| Lambda: `complete-task`   | (Invoked) | Serverless function to mark tasks as complete.  |

These are derived from typical Next.js patterns and the Lambda folder; actual implementation may vary. Check source code for exact handlers.

## Testing

To run tests:

- Unit tests: `npm run test:unit` (using Jest with type safety).
- End-to-end tests: `npm run test:e2e` (Cypress covers auth flows and logout).

This ensures the app's reliability across components, APIs, and user journeys.

## Video

Coming soon!
