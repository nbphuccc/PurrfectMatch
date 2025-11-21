# Purrfect Match - Developer Guidelines

## 1) Obtain the Source Code
- Ensure you have Node.js v18+, npm, Git, and Expo CLI.
- Download Expo Go App from App Store or Google Play Store
- Clone the repo:  
  `git clone "https://github.com/nbphuccc/PurrfectMatch"`
- Enter the repo directory:  
  `cd PurrfectMatch`

---

## 2) Directory Structure

### purrfectMatch-Homepage/
- **api/**: Firebase and REST API functions (community.ts, Client.ts)
- **app/**: App screens and navigation
- **(tabs)/**:screens, navigation, components, features, services, store, hooks, utils  
- **assets/**: images, fonts  
- **tests/**: frontend tests (`*.test.tsx`)  
- **package.json**, **app.json** or **app.config.ts**

### server/
- **src/**: `app.ts`, `index.ts`, `routes/`, `controllers/`, `services/`, `dao/`, `models/`, `middlewares/`, `__tests__/` or `tests/`
- **db/**: `schema.sql`, optional `seeds.sql`
- **package.json**

### docs/
- `README`, `User Manual`, `Developer Guide`, `reports`, `coding-guidelines`

### .github/workflows/
- `ci.yml`: GitHub Actions (lint/test)

**Source:** `purrfectMatch-Homepage/src` and `server/src`  
**Tests:** `purrfectMatch-Homepage/__tests__` and `server/src/tests`  
**Data:** `server/db/` (schema + seeds)

---

## 3) Build the Software

### 3.1 Prerequisites
- Node.js v18+, npm, Git, Expo (use `npx expo`), SQLite driver (bundled by node module), Firebase

### 3.2 Installation & How to Run the App

#### 1. Clone the Repository
```
git clone https://github.com/nbphuccc/PurrfectMatch.git
cd PurrfectMatch
```
#### 2. In Terminal A, install dependencies and run backend
```
cd server
npm install
npm rebuild better-sqlite3
npm start
```
#### 3. In Terminal B, set up Firebase and run frontend
##### 3.1 Install dependencies
```
cd purrfectMatch-Homepage
npm install
```
##### 3.2 Configure Firebase
Create a .env file in the purrfectMatch-Homepage directory:
```
touch .env
```
Get the .env file credentials in this google docs link: https://docs.google.com/document/d/1UyGKCmjU4S7Y3MQkD8P3KaTdfpmO1xyd4bRpTTp9g9A/edit?pli=1&tab=t.hynt2e8dzz0y

The .env file should look like:
```
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```
Security Note: Never commit the .env file to Git. It's already in .gitignore.

#### 3.3 Start the app
```
npm start
```

#### 4. Scan the QR code that show up in terminal using Expo Go on your phone
---

## 4) Test the Software

### 4.1 Backend (Jest + supertest)
- **Location:** `server/tests/`
- **Commands:**
  - `cd server`
  - `npm test`

### 4.2 Frontend (Jest + React Native Testing Library)
- **Location:** `purrfectMatch-Homepage/__tests__/`
- **Commands:**
  - `cd purrfectMatch-Homepage`
  - `npm test`

### 4.3 Continuous Integration
- CI runs on PRs to main and on push (as configured) using GitHub Actions.
- **Workflow file:** `.github/workflows/ci.yml`
- **CI steps:** install, build and test frontend + backend.

---

## 5) Add New Tests

### 5.1 Naming & Placement
**Backend**
- Place in `server/tests/`
- Use `*.test.ts`

**Frontend**
- Place in `purrfectMatch-Homepage/__tests__/`
- Use `*.test.tsx`

### 5.2 Harness
**Backend**
- Use Jest + supertest to hit Express app endpoints.
- Mock external dependencies and avoid network calls outside the app.

**Frontend**
- Use Jest + React Native Testing Library.
- Test components, hooks, screens; mock network calls and navigation.

### 5.3 Running Locally
- Backend: `cd server && npm test`  
- Frontend: `cd purrfectMatch-Homepage && npm test`

---

## 6) Build a Release

### 6.1 Versioning & Tagging
- Bump versions in:
  - `server/package.json` and `purrfectMatch-Homepage/package.json`
- Commit:  
  `git commit -m "chore(release): vX.Y.Z"`

### 6.2 Mobile App (Expo)
**Android build:**
- `cd purrfectMatch-Homepage`
- `npm run`, scan QR code, and choose key for Android

**iOS build:**
- `cd purrfectMatch-Homepage`
- `npm run`, scan QR code, and choose key for iOS

### 6.3 Backend Artifact
- Build: `cd server && npm run build`
- Start: `npm start`

### 6.4 Post-build Sanity Checklist
- App version in UI matches.
- Can sign up/login, create post, view post, comment successfully.
- Playdates/Community lists load correctly.

---

## 7) Contribution Workflow

### 7.1 Branching
- Feature branches: `name/<role>-<short-desc>`
- Bugfix branches: `fix/<scope>-<short-desc>`

### 7.2 Commits
- Use **Conventional Commits**:
  - `feat(auth): add refresh token endpoint`
  - `fix(posts): correct timezone handling`
  - `chore(ci): add coverage gate`

### 7.3 Pull Requests
- Include summary, screenshots for UI changes, and test notes.
- At least one reviewer from another sub-team.
- CI must pass before merge.
- Use **Squash & Merge**.

---

## 8) Code Style & Tooling
- TypeScript strict mode in frontend and backend.  
- ESLint + Prettier (Airbnb style for JS/TS).  
- React/React Native best practices: hooks, small components.  
- SQL style per Simon Holywell.  

---

## 9) Troubleshooting
- **Expo app cannot reach API:**  
  Use LAN IP for `EXPO_PUBLIC_API_BASE_URL` and ensure phone and computer are on the same Wi-Fi network.  
- **CORS errors:**  
  Set `CORS_ORIGIN` in `server/.env` to your Expo dev origin.  
- **SQLite file missing:**  
  Run your DB init/reset script or apply `db/schema.sql`.  
- **Test runs hang:**  
  Mock network calls; avoid external services.

---

## 10) Useful Links
- GitHub Repository – https://github.com/nbphuccc/PurrfectMatch
- User Manual Google Doc - https://docs.google.com/document/d/1UyGKCmjU4S7Y3MQkD8P3KaTdfpmO1xyd4bRpTTp9g9A/edit?tab=t.xhk44xm02hj6
- Developer Guidelines Google Doc - https://docs.google.com/document/d/1UyGKCmjU4S7Y3MQkD8P3KaTdfpmO1xyd4bRpTTp9g9A/edit?tab=t.19ziwlhegglo
- Figma Mock UI Designs - https://www.figma.com/design/pcUD0XE7ul2yHJSdUwS0YE/Purrfect-Match-App?node-id=0-1&p=f&t=9FO5LRdfpCX0pySG-0


