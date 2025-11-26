# Activity Dashboard - Setup Guide

## Prerequisites
- Node.js 18+ installed
- Neon database account and connection string

## Initial Setup

### 1. Install Dependencies
The project uses Next.js, Prisma, and Tailwind CSS. Dependencies are managed through npm.

### 2. Environment Variables
Add your Neon database URL to your environment:
- Get your database URL from Neon dashboard
- Set it as `DATABASE_URL` in your Vercel environment variables

### 3. Database Setup
Run the Prisma migration to create tables:

\`\`\`bash
npx prisma migrate dev --name init
\`\`\`

This will:
- Create all database tables
- Generate Prisma client

### 4. Seed Demo Data (Optional)
To populate sample data for testing:

\`\`\`bash
npx ts-node scripts/setup-db.ts
\`\`\`

This creates:
- 3 demo users
- 2 demo projects
- 2 demo activities

### 5. Run the Application
Start the development server:

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to access the dashboard.

## Features

### Create Activities
- Enter description, type, and status
- Assign due dates and completion dates
- Tag multiple projects
- Assign to multiple team members

### Dashboard
- View all activities in one place
- Real-time filtering by date range
- Filter by projects
- Filter by assigned persons
- Filter by status

### Activity Types
- **ProjectTask** - Task related to a project
- **RoutineWork** - Regular routine activities
- **AttendMeeting** - Meeting attendance
- **Other** - Miscellaneous activities

### Activity Status
- **Created** - New activity
- **InProgress** - Currently being worked on
- **Completed** - Finished activity

## API Endpoints

- `GET /api/activities` - List all activities with filters
- `POST /api/activities` - Create new activity
- `GET /api/activities/[id]` - Get specific activity
- `PUT /api/activities/[id]` - Update activity
- `DELETE /api/activities/[id]` - Delete activity
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/users` - List all users
- `POST /api/users` - Create new user

## Troubleshooting

### Database Connection Error
- Verify DATABASE_URL is set correctly
- Check Neon dashboard for active connection

### Prisma Client Error
- Run `npx prisma generate` to regenerate client
- Delete `node_modules/.prisma` and reinstall

### Port Already in Use
- Change port: `npm run dev -- -p 3001`
