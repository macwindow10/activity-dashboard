git clone <repository-url>
cd activity-dashboard
\`\`\`
npm install
\`\`\`
DATABASE_URL=your_neon_database_url
\`\`\`
npx prisma migrate dev --name init
\`\`\`
npx ts-node scripts/setup-db.ts
\`\`\`
npm run dev
\`\`\`
GET /api/activities?dateFrom=2024-01-01&dateTo=2024-12-31&status=InProgress
\`\`\`
git add .
git commit -m "Initial commit"
git push origin main
\`\`\`

# 🚀 Activity Dashboard

A comprehensive web app for managing and tracking activities, projects, and teams! 🗂️✨

## 🛠️ Tech Stack

- ⚛️ **Frontend**: Next.js 16 + React 19
- 🎨 **Styling**: Tailwind CSS 4 + shadcn/ui
- 🗄️ **Database**: PostgreSQL (Neon)
- 🔗 **ORM**: Prisma
- 📝 **Forms**: React Hook Form + Zod
- 🔔 **Notifications**: Sonner toast
- 🎯 **Icons**: Lucide React

## 🌟 Features

### 📝 Activity Management
- Create activities with description, type, and status
- Set due dates & track completion
- Choose from types: ProjectTask 🏗️, RoutineWork 🔄, AttendMeeting 📅, Other 🧩

### 🏷️ Tagging & Assignment
- Tag multiple projects per activity 🏷️
- Assign activities to team members 👥
- Quick tag removal with badges 🏷️❌

### 📊 Dashboard
- View all activities in a clean list 🧾
- Real-time status indicators: Created 🟡, InProgress 🟠, Completed 🟢
- Visual activity type icons

### 🔎 Advanced Filtering
- Filter by date range 📅
- Filter by project(s) 🏗️
- Filter by person(s) 👤
- Filter by status 🟡🟠🟢
- Apply multiple filters at once
- Reset filters to view all activities 🔄

### 📋 Activity Details
- View complete info
- Edit activity details ✏️
- Delete activities with confirmation 🗑️
- Track creation details & creator info

## 🗃️ Database Schema

### 👤 Users
- Email (unique) 📧
- Name 🏷️
- Timestamps ⏰

### 🏗️ Projects
- Name & description 📝
- Owner relationship 👑
- Assignees 👥
- Timestamps ⏰

### 📝 Activities
- Description 📝
- Type (dropdown) 🔽
- Status (Created, InProgress, Completed) 🟡🟠🟢
- Due date & completion date 📅
- Creator info 👤
- Many-to-many: projects & persons 🔗

## ⚡ Performance Optimization

- Prisma client uses singleton pattern 🦾
- Indexed database queries ⚡
- React 19 optimized UI 🚀
- Images unoptimized by default (can be changed in next.config.js) 🖼️

## 🤝 Contributing

1. Create a feature branch 🌱
2. Make your changes 🛠️
3. Test thoroughly ✅
4. Create a pull request 🔄

## 📄 License

MIT License – use freely for personal or commercial projects! 🆓

## 💬 Support

For help or questions:
1. Check `SETUP.md` for setup instructions 📖
2. Review code comments & docs 📝
3. Check console logs for errors 🖥️
4. Verify your database connection & environment variables 🔗
