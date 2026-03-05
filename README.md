# Corporate Skill Matrix Platform

A comprehensive **Angular-only** talent and skill management platform that demonstrates a full-featured corporate skill matrix system without any backend code. All data is loaded from JSON files and changes are persisted to `localStorage`.

## Features

### Employee Features
- **User Registration & Login** - Create accounts and authenticate (frontend-only)
- **Profile Management** - View and edit personal profiles with bio and skills
- **Skill Management** - Add, update, and remove skills with proficiency levels (1-5)
- **Talent Search** - Search for colleagues by skills with advanced filters
- **Endorsements** - Endorse colleagues' skills to validate their expertise
- **Vouches** - Provide stronger validation through vouching

### Manager Features
- **Team Analytics** - View department-level skill analytics
- **Skill Gap Analysis** - Identify missing skills in the team
- **Trending Skills** - See which skills are being added/updated recently
- **Team Metrics** - View average proficiency and skill distribution

### Admin Features
- **User Management** - View all users and manage accounts
- **Skill Library Management** - Add, edit, and remove skills from the master library
- **Audit Log** - View all user activities and changes
- **Analytics Dashboard** - Company-wide skill metrics and insights

## Technology Stack

- **Framework**: Angular 17+ (Standalone Components)
- **UI Library**: Angular Material
- **Charts**: Chart.js (ng2-charts)
- **State Management**: Signals + RxJS
- **Data Storage**: JSON files + localStorage for persistence
- **Styling**: CSS with Material Design theming

## Demo Accounts

Use these accounts to test different permission levels:

### Admin Account
- **Email**: `admin@company.com`
- **Password**: `Admin@123`
- **Access**: Full system access including user and skill management

### Manager Account
- **Email**: `manager@company.com`
- **Password**: `Manager@123`
- **Access**: Team analytics and reporting features

### Employee Account
- **Email**: `employee@company.com`
- **Password**: `Employee@123`
- **Access**: Basic profile and search features

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/          # TypeScript interfaces and types
│   │   ├── services/        # Core services (auth, data, overlay-store)
│   │   └── guards/          # Route guards (auth, role)
│   ├── shared/
│   │   ├── components/      # Reusable components (skill-chip, user-card)
│   │   └── pipes/           # Custom pipes (highlight)
│   ├── features/
│   │   ├── auth/            # Login and registration
│   │   ├── profile/         # Profile view and edit
│   │   ├── search/          # Talent discovery and search
│   │   ├── manager/         # Manager analytics dashboard
│   │   └── admin/           # Admin dashboard
│   ├── app.component.ts     # Main app with layout and navigation
│   ├── app.routes.ts        # Application routing configuration
│   └── app.config.ts        # Application configuration
└── assets/
    └── data/                # JSON seed data files
        ├── users.json       # 120 pre-populated users
        ├── skills.json      # 85+ skills across categories
        ├── departments.json # Department list
        └── audit-log.json   # Sample audit entries
```

## Data Architecture

### JSON Files (Read-Only Base Data)
Located in `src/assets/data/`:
- `users.json` - 120 diverse users with varied skills, roles, and departments
- `skills.json` - 85+ skills categorized as Technical, Soft Skills, and Languages
- `departments.json` - 10 departments (Engineering, QA, Data, HR, Finance, etc.)
- `audit-log.json` - Sample audit log entries

### LocalStorage (Write Layer)
Changes are saved to browser localStorage with these keys:
- `sm_currentUser` - Current session information
- `sm_users_overrides` - User profile updates and modifications
- `sm_endorsements` - All endorsements given/received
- `sm_vouches` - All vouches given/received
- `sm_audit_log_overrides` - New audit log entries
- `sm_admin_changes` - Admin modifications (skills added/removed)
- `sm_registrations` - New users created via registration

### Data Merging Strategy
On app initialization:
1. Load base data from JSON files
2. Load deltas from localStorage
3. Merge and overlay changes on top of base data
4. Apply to UI via Angular signals

This ensures:
- All changes persist across sessions
- Base data remains intact
- Easy to reset by clearing localStorage

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### Development Server
Navigate to `http://localhost:4200/` after running `npm start`. The application will automatically reload if you change any of the source files.

## Key Features Detail

### Authentication System
- Frontend-only authentication using localStorage
- Session management with expiration (24 hours)
- Role-based access control (EMPLOYEE, MANAGER, ADMIN)
- Route guards protecting restricted features

### Endorsements & Vouches
- **Self-action prevention**: Cannot endorse/vouch your own skills
- **Duplicate prevention**: Cannot endorse/vouch the same skill twice
- **Real-time counters**: Badges showing number of endorsements/vouches
- **Tooltips**: Hover to see who endorsed/vouched
- **Persistence**: All actions saved to localStorage

### Search & Discovery
- **Debounced search**: Real-time skill-based search with 300ms debounce
- **Advanced filters**: Department, location, minimum proficiency
- **Pagination**: Client-side pagination with customizable page sizes
- **Responsive grid**: Auto-adjusting card layout
- **Quick navigation**: Click any card to view full profile

### Manager Analytics
- **Department metrics**: Team size, total skills, average proficiency
- **Top skills table**: Most common skills with people count
- **Trending analysis**: Skills added/updated in last 30 days
- **Skill gap identification**: Compare team skills vs target skills

### Admin Dashboard
- **Multi-tab interface**: Overview, Skills, Users, Audit Log
- **Skill library CRUD**: Add, edit, delete skills
- **User management**: View and deactivate users
- **Audit trail**: Complete history of system changes
- **Analytics**: Company-wide statistics and charts

## Seed Data Overview

### Users (120 total)
- **Roles**: 95 Employees, 20 Managers, 5 Admins
- **Departments**: 10 departments with realistic distribution
- **Locations**: 30+ Indian cities plus Remote workers
- **Skills**: Each user has 3-8 skills with proficiency 1-5
- **Endorsements**: Pre-seeded endorsements between users

### Skills (85+ total)
- **Technical** (57): Programming languages, frameworks, cloud, DevOps
- **Soft Skills** (14): Communication, leadership, problem-solving
- **Languages** (14): English, Hindi, regional languages, international

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Limitations

This is a **frontend-only demo** with the following intentional limitations:

- No actual backend API or database
- No real authentication security (passwords visible in JSON)
- All data stored in browser localStorage (not shared across devices)
- No server-side validation
- Session data lost on localStorage clear
- Not suitable for production use without a proper backend

## Future Enhancements (Not Implemented)

- Real backend API integration
- Persistent database storage
- File uploads for profile images
- Advanced charts and visualizations
- Email notifications
- Export data to CSV/PDF
- Multi-language support
- Dark/light theme toggle
- Mobile application

## License

This is a demonstration project created for educational purposes.

## Contact

For questions or issues, please refer to the project documentation.

---

**Note**: This application uses localStorage for persistence. Clearing your browser's localStorage will reset all changes back to the original seed data.
