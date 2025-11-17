# 🐾 Purrfect Match

Purrfect Match is a lightweight mobile app designed to connect pet owners through a community-driven playdate and resource board. Unlike adoption platforms such as Petfinder, our app focuses on building local connections between pet owners. Our goal is to create a fun, mobile-first way for owners to discover events, share knowledge, and connect with others in their area.

**Playdates Tab:** Dog-focused posts to find nearby play buddies.

**Community Tab:** A shared board for cats, rabbits, and small pets — for tips, resources, and pet sitting arrangements.


## What are Purrfect Match features?

- Browse playdates board based on location (city input)
- Create playdate posts (time, place, pet info, contact)
- Playdates Tab: Dog playdate meetups
- Community Tab: Posts for all pets (cats, rabbits, small pets) — pet sitting, tips, and resources
- Post details with photos, description, location, and contact email/URL
- Keyword search on community board

## Prerequisites
Before installing Purrfect Match, make sure you have the following.
- **Node.js** (version 18 or higher)
- **npm** (comes with Node)
- **Expo Go App**
  - **iOS:** Download from the [App Store](https://apps.apple.com/app/expo-go/id982107779)
  - **Android:** Download from the [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

## Installation & Run Instructions

### 1. Clone the Repository
```
git clone https://github.com/nbphuccc/PurrfectMatch.git
cd PurrfectMatch
```
### 2. In Terminal A, install dependencies and run backend
```
cd server
npm install
npm rebuild better-sqlite3
npm start
```
### 3. In Terminal B, set up Firebase and run frontend
#### 3.1 Install dependencies
```
cd purrfectMatch-Homepage
npm install
```
#### 3.2 Configure Firebase
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

### 4. Scan the QR code that show up in terminal using Expo Go on your phone


## Repository Structure

- **Server** – Node.js + Express server
  - **db/** - DB schema and sample data
    - **schema.sql** 
  - **node_modules/** - Dependencies 
  - **src/**  
    - **controllers/** – Parse req/res, call service, set HTTP codes 
    requests 
    - **dao/** – Data Access Layer
    - **moddlewares/** – Reusable Express middlewares
    - **routes/** – API route definitions  
    - **services/** – Business logic + validation
    - **tests/** – Backend integration/unit tests
  - **app.ts** - Exports configured Express app (for testing)
  - **index.ts** - Entry point: creates and starts Express app
  
  
- **App** – React Native app (Expo)  
  - **assets/** – Images, icons  
  - **components/** – Reusable UI components  
  - **screens/** – App screens (Browse, Detail, Favorites, Tips)  
  - **navigation/** – React Navigation setup  
  - **app.js** – Entry point for React Native


## Reporting Bugs

If you encounter any issues, please report them on the GitHub Issues page:  
🔗 [https://github.com/nbphuccc/PurrfectMatch/issues](https://github.com/nbphuccc/PurrfectMatch/issues)

When reporting a bug, include:
- Steps to reproduce the issue  
- Expected vs. actual behavior  
- Device type (iOS or Android)  
- Screenshots (if applicable)

**Bug Report Template:**
```
**Title:** [Bug] Short description of the issue

**Description:**
Briefly describe what went wrong and how it affects the app.

**Steps to Reproduce:**
1. Go to [...]
2. Tap [...]
3. Observe [...]

**Expected Behavior:**
Describe what you expected to happen.

**Actual Behavior:**
Describe what actually happens instead.

**Environment:**
- Device: (e.g., iPhone 13 / Samsung S22)
- OS Version: (e.g., iOS 17.2 / Android 14)
- Network: (Wi-Fi / Cellular)

**Screenshots or Logs:**
If applicable, attach images, console errors, or screenshots.

**Additional Notes:**
Any other context that might help identify the issue.

```

## Documentation  
  - **Living Document** https://docs.google.com/document/d/1UyGKCmjU4S7Y3MQkD8P3KaTdfpmO1xyd4bRpTTp9g9A/edit?tab=t.ypct95m4pes8
  - **User Manual Google Doc** - https://docs.google.com/document/d/1UyGKCmjU4S7Y3MQkD8P3KaTdfpmO1xyd4bRpTTp9g9A/edit?tab=t.xhk44xm02hj6
  - **Developer Guidelines Google Doc** - https://docs.google.com/document/d/1UyGKCmjU4S7Y3MQkD8P3KaTdfpmO1xyd4bRpTTp9g9A/edit?tab=t.19ziwlhegglo
  - **Figma Mock UI Designs** - https://www.figma.com/design/pcUD0XE7ul2yHJSdUwS0YE/Purrfect-Match-App?node-id=0-1&p=f&t=9FO5LRdfpCX0pySG-0
  - **Operational Use Cases** - https://docs.google.com/document/d/1UyGKCmjU4S7Y3MQkD8P3KaTdfpmO1xyd4bRpTTp9g9A/edit?tab=t.dzqes8hrfs6j
