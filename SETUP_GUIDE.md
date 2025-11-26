# Activity Dashboard - Setup Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Neon PostgreSQL database (connected via DATABASE_URL)

## Quick Start

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Initialize the Database

The first time you run the application, you need to set up the database tables and seed sample data.

\`\`\`bash
npm run seed
\`\`\`

This script will:
- Create all required database tables (User, Project, Activity, etc.)
- Create indexes for optimal query performance
- Seed demo data with sample users, projects, and activities

### 3. Start the Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit http://localhost:3000 to see the application.

## Database Setup Explained

The application uses:
- **Neon PostgreSQL** as the database
- **Prisma** as the ORM for type-safe database access
- **Serverless Neon client** for direct SQL execution in the seed script

### Database Schema

The application includes:
- **User** - Team members who create and are assigned to activities
- **Project** - Projects that activities can be tagged with
- **Activity** - Main entity with description, type, status, and dates
- **ActivityProject** - Junction table linking activities to projects
- **ActivityPerson** - Junction table linking activities to assigned users

## Features

### Create Activity
- Add description and detailed notes
- Select activity type (ProjectTask, RoutineWork, AttendMeeting, Other)
- Set due date and time
- Tag multiple projects
- Assign to multiple team members

### Dashboard
- View all activities in a grid layout
- Real-time status indicators (Created, In Progress, Completed)
- Activity type badges with color coding

### Filtering
- Filter by date range
- Filter by project (single or multiple)
- Filter by assigned person (single or multiple)
- Filter by status
- Combined filtering (all filters work together)

## Troubleshooting

### "Internal Server Error" when loading activities
**Solution:** Run `npm run seed` to initialize the database tables.

### "Failed to fetch projects/users"
**Solution:** Ensure:
1. DATABASE_URL environment variable is set
2. Neon database is accessible
3. Run `npm run seed` to create tables

### Activities not appearing after creation
**Solution:** 
1. Check browser console for errors
2. Verify all required fields are filled
3. Ensure the user creating the activity exists in the database

## Development Tips

- The seed script uses the Neon serverless client directly for table creation
- Prisma is used in the API routes for all database queries
- Filters are applied both server-side (for optimal performance) and client-side (for local filtering)
- All timestamps are stored in UTC in the database

## Deployment

When deploying to Vercel:

1. Set `DATABASE_URL` environment variable in Vercel project settings
2. Run migrations before deployment
3. The application will work seamlessly with Vercel's serverless functions

For more info, see Vercel's [environment variables documentation](https://vercel.com/docs/concepts/projects/environment-variables).
