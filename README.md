# 🐾 Purrfect Match

Purrfect Match is a lightweight mobile app designed to connect pet owners through a community-driven playdate and resource board. Unlike adoption platforms such as Petfinder, our app focuses on building local connections between pet owners.

Playdates Tab: Dog-focused posts to find nearby play buddies.

Community Tab: A shared board for cats, rabbits, and small pets — for tips, resources, and pet sitting arrangements.

Goal: Create a fun, mobile-first way for owners to discover events, share knowledge, and connect with others in their area.

---

## Features (MVP)

- Browse playdates board based on location (city input)
- Create playdate posts (time, place, pet info, contact)
- Playdates Tab: Dog playdate meetups
- Community Tab: Posts for all pets (cats, rabbits, small pets) — pet sitting, tips, and resources
- Post details with photos, description, location, and contact email/URL
- Keyword search on community board
  
**Stretch Goals:**  
- Simple filters: type (dog/cat) + location (ZIP/City) + radius
- Extra filters: age, size
- Map view (find playdates by pins)
- Pet care tips page with species-specific content
- Local pet owner uploads (photos/media)
- Post expiry and auto-removal after a set time
- Messaging between pet owners

---

## Tech Stack

- **Frontend:** React Native + Expo  
- **Backend:** Node.js + Express (account system, posts CRUD endpoints)
- **Database:** SQLite
- **Design:** Figma for UI/UX mockups  

---

## Repository Structure

- **Backend** – Node.js + Express server
  - **src/**  
    - **routes/** – API route definitions  
    - **controllers/** – Logic for handling requests  
    - **models/** – SQLite schema (posts, users) 
    - **server.js** – Entry point
  - **tests/** – Backend tests
 

- **Frontend** – React Native app (Expo)  
  - **assets/** – Images, icons  
  - **components/** – Reusable UI components  
  - **screens/** – App screens (Browse, Detail, Favorites, Tips)  
  - **navigation/** – React Navigation setup  
  - **app.js** – Entry point for React Native  

- **Docs** – Documentation  
  - **Living Document link** https://docs.google.com/document/d/1UyGKCmjU4S7Y3MQkD8P3KaTdfpmO1xyd4bRpTTp9g9A/edit?tab=t.ypct95m4pes8
