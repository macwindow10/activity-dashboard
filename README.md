# Activity Dashboard

A comprehensive web application for managing and tracking activities with advanced filtering, project tagging, and team collaboration features.

## Tech Stack

- **Frontend**: Next.js 16 with React 19
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Form Handling**: React Hook Form with Zod validation
- **Notifications**: Sonner toast system
- **Icons**: Lucide React

## Features

### Activity Management
- Create activities with description, type, and status
- Set due dates and track completion dates
- Choose from predefined activity types:
  - ProjectTask
  - RoutineWork
  - AttendMeeting
  - Other

### Tagging & Assignment
- Tag multiple projects per activity
- Assign activities to multiple team members
- Quick tag removal with badge interactions

### Dashboard
- View all activities in a clean, organized list
- Real-time status indicators (Created, InProgress, Completed)
- Visual activity type indicators

### Advanced Filtering
- Filter by date range (from and to dates)
- Filter by project(s)
- Filter by assigned person(s)
- Filter by activity status
- Apply multiple filters simultaneously
- Reset filters to view all activities

### Activity Details
- View complete activity information
- Edit activity details
- Delete activities with confirmation
- Track creation details and creator information

## Database Schema

### Users
- Email (unique)
- Name
- Timestamps

### Projects
- Name and description
- Owner relationship
- Assignees
- Timestamps

### Activities
- Description
- Type (dropdown selection)
- Status (Created, InProgress, Completed)
- Due date and completion date
- Creator information
- Many-to-many relationships with projects and persons

## Getting Started

### Prerequisites
- Node.js 18+
- Neon database account

### Installation

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd activity-dashboard
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Set up environment variables**
Create a `.env.local` file with:
\`\`\`
DATABASE_URL=your_neon_database_url
\`\`\`

4. **Run database migrations**
\`\`\`bash
npx prisma migrate dev --name init
\`\`\`

5. **Seed demo data (optional)**
\`\`\`bash
npx ts-node scripts/setup-db.ts
\`\`\`

6. **Start development server**
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to access the dashboard.

## API Endpoints

### Activities
- `GET /api/activities` - List activities with optional filters
- `POST /api/activities` - Create new activity
- `GET /api/activities/[id]` - Get specific activity
- `PUT /api/activities/[id]` - Update activity
- `DELETE /api/activities/[id]` - Delete activity

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create new user

## Query Parameters

### Activities List Filtering
- `dateFrom` - Start date (ISO format)
- `dateTo` - End date (ISO format)
- `projectIds[]` - Array of project IDs
- `personIds[]` - Array of user IDs
- `status` - Activity status (Created, InProgress, Completed)

Example:
\`\`\`
GET /api/activities?dateFrom=2024-01-01&dateTo=2024-12-31&status=InProgress
\`\`\`

## Project Structure

\`\`\`
├── app/
│   ├── api/
│   │   ├── activities/
│   │   ├── projects/
│   │   └── users/
│   ├── activities/[id]/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── activity-form.tsx
│   ├── activity-filters.tsx
│   ├── activity-list.tsx
│   ├── activity-edit-form.tsx
│   └── ui/
├── lib/
│   ├── db.ts
│   └── types.ts
├── prisma/
│   └── schema.prisma
└── scripts/
    └── setup-db.ts
\`\`\`

## Usage Guide

### Creating an Activity

1. Navigate to the "Create Activity" tab
2. Fill in the activity description
3. Select activity type from dropdown
4. Set due date and time
5. (Optional) Search and select projects
6. (Optional) Search and assign team members
7. Click "Create Activity"

### Filtering Activities

1. Go to the Dashboard tab
2. Use the filter panel:
   - Set date range with From/To date pickers
   - Search and select projects
   - Search and select persons
   - Choose a status filter
3. Click "Apply Filters"
4. Use "Reset" to clear all filters

### Managing Activities

- Click any activity card to view details
- Use the Edit button to modify activity information
- Use the Delete button to remove an activity (with confirmation)
- Track activity progress through status badges

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
\`\`\`bash
git add .
git commit -m "Initial commit"
git push origin main
\`\`\`

2. **Connect to Vercel**
- Visit vercel.com and sign in
- Click "Add New..." > "Project"
- Import your GitHub repository
- Set environment variables:
  - `DATABASE_URL` - Your Neon database URL
- Click "Deploy"

### Environment Setup

Ensure these environment variables are set in Vercel:
- `DATABASE_URL` - PostgreSQL connection string from Neon

## Performance Optimization

- Prisma client is optimized with singleton pattern
- Database queries include proper indexes
- UI components are optimized with React 19
- Images are unoptimized by default (can be changed in next.config.js)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Create a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions:
1. Check the SETUP.md file for detailed setup instructions
2. Review the API endpoints documentation above
3. Check console logs for error messages
4. Verify your database connection and environment variables
