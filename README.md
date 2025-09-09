# Drill Sergeant Trainee Tracker

Static web app for platoon accountability, training tracking, and task management. Frontend: HTML + Tailwind + vanilla JS. Backend: Supabase (PostgreSQL).

## Quick Start

1) Create a Supabase project.
2) In the SQL editor, paste `schema.sql` and run it to create tables.
3) Copy `config.example.js` to `config.js` and set your project URL and anon key.
4) Open `index.html` locally, or serve the folder with any static server.

Anon keys are safe to expose in client apps. Ensure Row Level Security (RLS) rules are configured appropriately in Supabase if you enable them.

## Deploy on GitHub Pages

- Push this repository to GitHub
- Settings → Pages → Deploy from main branch (root)
- Ensure `config.js` is present in the repo so the app can connect to Supabase

## Data Shapes (JSONB columns)

- `appointments`: array of `{ date: 'YYYY-MM-DD', time?: 'HH:MM', location?: string, description?: string }`
- `profile`: `{ restriction?: string, end_date?: 'YYYY-MM-DD' }`
- `fitness`: `{ acft_status?: 'Pass'|'Fail', rifle_qualification?: 'Pass'|'Fail', run_time?: string }`
- `custom_notes`: array of `{ text: string, priority?: 'High'|'Medium'|'Low', due_date?: 'YYYY-MM-DD' }`
- `training_events`: object map `{ [eventIdOrName]: { completed: boolean, date?: 'YYYY-MM-DD' } }` (flexible)

## Development Notes

- The UI loads counts, roster, appointments, and a combined priority list.
- Editing basic fields (rank/name/gender/status/location) auto-saves.
- Training Events and Platoon Tasks modals are scaffolded for future implementation.

# trainee_tracker
Tracker for Trainees
