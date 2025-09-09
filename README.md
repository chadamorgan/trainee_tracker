# Drill Sergeant Trainee Tracker

A comprehensive web-based application designed to provide U.S. Army Drill Sergeants with a centralized tool for managing their trainees throughout a 10-week Basic Combat Training cycle.

## Features

### Dashboard
- **Platoon Availability Display**: Real-time counter showing available trainees
- **Accountability Cards**: Clickable cards for key statuses (Present, Sick Call, Profiles, ACFT Fail, Rifle Unqualified, Male, Female)
- **Upcoming Appointments**: Chronological list of appointments for the next 10 days
- **Priority List**: Combined, sortable list of trainee notes and platoon tasks

### Trainee Management
- **Roster View**: Filterable and searchable list of all trainees
- **Trainee Profile Dialog**: Comprehensive interface for managing individual trainee data including:
  - Personal information (Rank, Name, Gender)
  - Accountability status and location
  - Training & fitness records (ACFT, Rifle Qualification, Run Time)
  - Medical profile restrictions
  - Appointment scheduling
  - Custom notes and counseling records
- **Bulk Upload**: Add multiple trainees via copy-paste
- **Delete Functionality**: Remove trainees with confirmation

### Training & Task Management
- **Training Events**: Define and manage training events with completion tracking
- **Platoon Tasks**: Add, edit, and track platoon-wide tasks with priority levels
- **Progress Tracking**: Visual progress indicators and completion statistics

## Technical Stack

- **Frontend**: HTML5, CSS3 (Tailwind CSS), Vanilla JavaScript
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Static site (GitHub Pages compatible)

## Setup Instructions

### 1. Database Setup (Supabase)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the following SQL commands to create the required tables:

```sql
-- Create trainees table
CREATE TABLE trainees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    platoon TEXT NOT NULL,
    rank TEXT,
    gender TEXT,
    status TEXT DEFAULT 'Present',
    location TEXT,
    history JSONB,
    profile JSONB,
    appointments JSONB,
    fitness JSONB,
    counseling_history JSONB,
    training_events JSONB,
    custom_notes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create training_events table
CREATE TABLE training_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);

-- Create platoon_tasks table
CREATE TABLE platoon_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text TEXT NOT NULL,
    priority TEXT NOT NULL,
    due_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create app_metadata table
CREATE TABLE app_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,
    last_daily_check_in DATE
);
```

### 2. Configuration

1. Open `js/config.js`
2. Replace the placeholder values with your actual Supabase credentials:
   ```javascript
   const CONFIG = {
       SUPABASE_URL: 'https://your-project.supabase.co',
       SUPABASE_ANON_KEY: 'your-anon-key-here',
       // ... other config
   };
   ```

### 3. Deployment

#### Option A: GitHub Pages
1. Push your code to a GitHub repository
2. Enable GitHub Pages in repository settings
3. Select source branch (usually `main` or `master`)
4. Your app will be available at `https://yourusername.github.io/repository-name`

#### Option B: Local Development
1. Serve the files using a local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```
2. Open `http://localhost:8000` in your browser

## Usage

### Getting Started
1. Select a platoon from the dropdown menu
2. Add trainees using the "Add Trainee" button or bulk upload
3. Use accountability cards to filter trainees by status
4. Click on trainee cards to edit their information
5. Manage training events and platoon tasks using the respective buttons

### Keyboard Shortcuts
- `Ctrl/Cmd + N`: Add new trainee
- `Escape`: Close open modals

### Data Management
- All data is automatically saved to Supabase
- Use the bulk upload feature to add multiple trainees at once
- Export/import functionality available for data backup

## File Structure

```
/
├── index.html              # Main HTML file
├── js/
│   ├── config.js          # Configuration and constants
│   ├── database.js        # Supabase database operations
│   ├── trainee.js         # Trainee management functionality
│   ├── events.js          # Training events management
│   ├── tasks.js           # Platoon tasks management
│   └── app.js             # Main application logic
└── README.md              # This file
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Security Notes

- The application uses Supabase's Row Level Security (RLS)
- All database operations are performed through Supabase's secure API
- No sensitive data is stored in local storage
- Consider implementing user authentication for production use

## Future Enhancements

- Advanced reporting and analytics
- AI-powered command interface
- User authentication system
- Mobile app version
- Integration with Army systems

## Support

For issues or questions, please refer to the application logs in the browser console or contact the development team.

## License

This project is developed for U.S. Army use. Please ensure compliance with all applicable regulations and security requirements.