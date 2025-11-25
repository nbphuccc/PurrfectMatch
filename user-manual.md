# Purrfect Match - User Manual

## Overview
**Purrfect Match** is a mobile app designed for dog owners to connect with other dog owners nearby for playdates, share updates on a community board, and manage their pets’ profiles.  
It helps build a friendly community for pets and their humans, making it easier to discover activities and friendships.



## Installation

### Prerequisites
- Node.js **v18** or newer  
- **npm**  
- **Expo CLI** (for mobile app)  
- **Git** (to clone the repository)  

---

## Installation & How to Run the App

### 1. Clone the Repository
```
git clone https://github.com/nbphuccc/PurrfectMatch.git
cd PurrfectMatch
```
### 2. Frontend (Firebase) - Install & Run
This project uses Firebase for backend services. The legacy Express backend has been archived and is not required to run the app.

#### 2.1 Install dependencies
```
cd purrfectMatch-Homepage
npm install
```
#### 2.2 Configure Firebase
Create a .env file in the purrfectMatch-Homepage directory:
```
touch .env
```
or if you're on Powershell,
```
New-Item .env -ItemType File
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
#### 2.3 Start the app
```
npm start
```

### 3. Scan the QR code that show up in terminal using Expo Go on your phone


## Using the App
### Main Features that are currently working
- Account Management: Sign Up
- Playdate Page: Create playdate post and see nearby playdates.
- Community Page: Post and read updates, questions and photos about your pets, comments feature.

## Reporting Bugs
If you encounter any issues, please report them on the GitHub Issues page:
https://github.com/nbphuccc/PurrfectMatch/issues

When reporting a bug, include:

- Steps to reproduce the issue
- Expected vs. actual behavior
- Device type (iOS or Android)
- App version or commit hash
- Screenshots (if applicable)

## Known Issues
- Some UI elements may look different on Android vs IOS.
- Backend filtering and push notifications are not yet implemented.

## Contact
For questions or feedback, contact the PurrfectMatch development team through the GitHub Issues tab.
### Team Contacts
- lmswar@uw.edu
- hsu01@uw.edu
- alew4@uw.edu
- chiemily@uw.edu
- nbphucc@uw.edu
- xuannhu@uw.edu
