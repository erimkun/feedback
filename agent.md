# ROLE
You are a Senior Full Stack Developer expert in Next.js (App Router), Tailwind CSS, and Prisma.

# PROJECT CONTEXT & FILES
I have provided you with:
1. `feedback.html` and 'thanks.html': The exact HTML/Tailwind code for the frontend UI.
2. `screen.png`: The visual reference for the design.
3. Project Summary & Tech Spec: A simple feedback app using SQLite.

# GOAL
Build a "Flashback Lite" feedback application. Users access a specific URL with a UUID, rate their experience (1-5 scale) using the provided UI, and the data is saved to a local SQLite database.

# TECHNICAL CONSTRAINTS
- **Framework:** Next.js 14+ (App Router).
- **Database:** SQLite (local file).
- **ORM:** Prisma.
- **Styling:** Tailwind CSS (Use the exact classes from `code.html`).
- **Language:** TypeScript.
- **Simplicity:** Keep it extremely simple. No complex auth, no Docker.

# TASK LIST

## Step 1: Database Setup (Prisma)
- Initialize Prisma with SQLite provider.
- Create a model named `Feedback` with these fields:
  - `id`: String (UUID) @id
  - `targetName`: String (Who is the feedback for?)
  - `rating`: Int? (Nullable initially, 1-5 range)
  - `comment`: String? (Optional)
  - `isUsed`: Boolean (Default false)
  - `createdAt`: DateTime (Default now)
- Generate the migration.

## Step 2: Seed Script
- Create a simple script (e.g., `scripts/create-link.ts`) that allows me to generate a new feedback link via terminal.
- It should take a name as input, create a record in DB, and log the full URL (e.g., `localhost:3000/feedback/[uuid]`).

## Step 3: Frontend Implementation (`/feedback/[id]/page.tsx`)
- Create a page that captures the `id` from params.
- Fetch the feedback session from SQLite.
  - If not found or `isUsed` is true, show a simple error/info message.
  - If valid, render the Feedback Form.

## Step 4: Component Logic (The Form)
- Convert the provided `code.html` into a React Client Component.
- **Important:** Stick 100% to the design in `code.html`. Do not change colors or spacing unless necessary for logic.
- **Interactivity:**
  - Create a state for `selectedRating` (1-5).
  - When a user clicks a rating face:
    - Update `selectedRating`.
    - Apply the active styles (from the HTML: `.rating-selected` logic: change icon style to FILL 1 and color to blue).
    - Enable the "Submit" button (remove opacity/disabled state).
- **Submission:**
  - Use a Server Action (preferred) or API Route to save data.
  - On success, replace the form with a simple "Teşekkürler, geri bildiriminiz alındı." message (centered, styled like the headlines).

# EXECUTION
Start by setting up the Prisma schema and the Next.js page structure. Then implement the UI using the provided HTML.


every time u complete a task report that task in md files. 