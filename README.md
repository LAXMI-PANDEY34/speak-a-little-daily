# Speak A Little Daily

Build an app that Build a simple "Daily Speaking Practice" web app. Keep it minimal and mobile-friendly.

 

Features:

1. Login/Signup with email and password (Supabase Auth).

2. Home page: show one speaking topic for today (pick from a built-in list of 30 simple topics, rotate by date). Example: "Introduce yourself", "Describe your daily routine".

3. Practice page: a big mic button. Use the browser Web Speech API to record and convert speech to text live. Show the text on screen. Add a stop button and a timer.

4. When user stops, show a "Save" button. On save, store in Supabase table "sessions": id, user_id, topic, transcript, duration_seconds, created_at.

5. History page: list all past sessions of the logged-in user (date, topic, transcript, duration), newest first. Allow deleting a session.

6. Show a simple streak counter (number of consecutive days practiced).

 

Backend: Use Supabase. Create the "sessions" table with Row Level Security so each user can only read, insert and delete their own rows.

 

Design: clean, simple, one color theme, bottom navigation with Home, Practice, History. No extra features, no AI calls, no payments

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/06e9b5dd-877e-4645-b024-3672a711a19b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
