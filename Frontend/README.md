# Superwise Frontend

This is the frontend application for the Superwise project, built with Nuxt 3, Vue 3, Pinia, and TailwindCSS. It provides a modern, responsive interface for students and supervisors to manage supervision requests, profiles, and onboarding.


## Tech stack
- **Nuxt** framework for Vue
- **Vitest** for testing
- **I18n** for localisation
- **Pinia** for state management
- **DaisyUI** for css designs

## Features

- **Authentication:** Secure sign-in and sign-out using Clerk.
- **Role-based Dashboards:** Separate dashboards for students and supervisors.
- **Supervision Requests:** Students can send, withdraw, and track supervision requests; supervisors can accept, reject, and manage them.
- **Profile Management:** Users can edit their profiles and manage tags/interests.
- **Onboarding:** Guided onboarding flows for both students and supervisors.
- **Responsive Design:** Optimized for both desktop and mobile devices.
- **Localization:** Multi-language support using Vue I18n.
- **State Management:** Uses Pinia for global state and store management.
- **API Integration:** Communicates with the backend via RESTful API endpoints.

## Project Structure

- `pages/` — Main application pages (student, supervisor, onboarding, etc.)
- `components/` — Reusable Vue components (cards, modals, navigation, etc.)
- `stores/` — Pinia stores for state management
- `plugins/` — Nuxt plugins (e.g., Clerk, FontAwesome)
- `middleware/` — Route guards and global middleware
- `server/` — Nuxt backend API routes and server logic
- `assets/` — Static assets (images, styles)
- `locales/` — Localization files

## Getting Started

## Installation and running

1. **Clone the repository to local directory**
2. **ensure you are in the Frontend directory**

```bash
cd Frontend
```

3. **Install dependencies**:

```bash
npm install
```

4. **Environment Variables:**

Copy the `.env.example` to an `.env` file in the root directory and ensure all the environment variables are set correctly. You can reach out to the admin for the secret keys.

5. **Run the application**
```bash
npm run dev
```

## Testing
To Run all the test in the application, run the command
```bash
npm run test
```

To run tests on an individual file for development run the command
```bash
npm run test <file-name>
```
For running specific test (faster for development) install the official **Vitest** extention which would allow running specific test. A play button would appear next to each **Test** in the UI.

>If a play button doesnt appear, open the vitest extention and click the "Refrest Test" button

