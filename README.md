# DailyThrive

A cross-platform diet and fitness planner application designed to help users track nutrition, exercise, and daily progress through a simple and intuitive interface.

---

## Tech Stack
- Frontend: React (Vite)
- Backend: Node.js + Express
- Database: PostgreSQL
- Authentication: JWT

---

## Features
- User registration and secure login
- Daily planner for workouts and activities
- Nutrition and exercise tracking
- Progress dashboard and rewards system
- Profile customisation (avatars and titles)
- Responsive design for desktop and mobile use

---

## Running the Application

### OPTION A (Recommended)

This version uses a hosted database. No additional setup is required.

1. Open two terminals

2. Start the backend:
	1. cd server
	2. npm install
	3. npm run dev

3. Start the frontend:
	1. cd client
	2. npm install
	3. npm run dev

4. Open in browser:
   http://localhost:5173

### OPTION B (Local Database)

If you wish to run the system fully locally:

1. Install PostgreSQL

2. Create a database:
   dailythrive

3. Run SQL files in:
   /server/migrations
   
4. Update `server/.env`:
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD_HERE@localhost:5432/dailythrive

5. Start the application:
	1. cd server
	2. npm install
	3. npm run dev
	 
	4. cd client
	5. npm install
	6. npm run dev

## Notes
- The application defaults to a hosted database for ease of use.
- A local database setup is provided as a fallback option.
- No external accounts or additional configuration are required for standard use.
