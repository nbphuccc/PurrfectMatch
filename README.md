# 🐾 Purrfect Match

Purrfect Match is a lightweight mobile app that helps adopters discover adoptable pets near them through a modern, mobile-first experience. It provides real-time listings from a public adoption API, a simple detail view, and the ability to favorite pets. The app removes the friction of heavy, desktop-oriented adoption websites by offering a swipe-like discovery flow, one-tap contact, and simple local storage of favorites.

---

## Features (MVP)

- Browse adoptable pets from the **Petfinder API** via our Node/Express proxy  
- View detailed pet information (photos, description, shelter contact)  
- Save and remove favorites locally using AsyncStorage  
- Simple filters: type (dog/cat), location (zip code), and search radius  
- Robust error handling for no internet or empty results  

**Stretch Goals:**  
- Tinder-style swipe-based discovery  
- Additional filters (age, size)  
- Map view (shelter clusters)  
- Playdate board for pet owners  
- Pet-care tips page  
- Messaging between adopters and shelters  

---

## Tech Stack

- **Frontend:** React Native + Expo  
- **Backend:** Node.js + Express (Petfinder API proxy, mock data fallback)  
- **Storage:** AsyncStorage for local favorites  
- **Design:** Figma for UI/UX mockups  

---

## Repository Structure

- **Backend/** – Express server (API proxy + mock dataset)  
  - **src/**  
    - **routes/** – API route definitions  
    - **controllers/** – Logic for handling requests  
    - **utils/** – Helper functions (API fetch, validation)  
    - **app.js** – Main Express app  
  - **tests/** – Backend tests (Jest/Supertest)  
  - **package.json**  
  - **.env.example** – Example backend environment variables  

- **Frontend/** – React Native app (Expo)  
  - **assets/** – Images, icons  
  - **components/** – Reusable UI components  
  - **screens/** – App screens (Browse, Detail, Favorites, Tips)  
  - **navigation/** – React Navigation setup  
  - **utils/** – Helper functions  
  - **App.js** – Entry point for React Native  
  - **package.json**  

- **Docs/** – Documentation  
  - **design-doc.md** – Design doc  
  - **requirements.md** – Requirements document  
  - **wireframes/** – Figma exports  

