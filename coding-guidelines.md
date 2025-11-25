# 🧭 Coding Guidelines

## 📚 Languages Used
- **TypeScript**
  - Frontend: React Native + Expo  
- **Config / Infra** — Firebase (Firestore, Auth, Storage), Firebase Emulator Suite
- **Testing** — Jest, React Native Testing Library, 
- **Shell / Scripts** — npm, Expo CLI  

---

## 🧩 Guidelines

### **TypeScript / JavaScript**
- Follow **Airbnb JavaScript/TypeScript Style Guide**  
  🔗 https://github.com/airbnb/javascript
- React/React Native best practices for:
  - Component structure and naming
  - Using hooks effectively
  - Clear and typed props
  - Avoiding “god components” — keep UI modular and composable  
  🔗 https://react.dev/learn
- Commit messages follow **Conventional Commits**  
  🔗 https://www.conventionalcommits.org

---

## 💡 Why These Guidelines
- **Widely adopted** and well-documented standards across the industry  
- **Strong editor/CI tooling** (ESLint, Prettier, TypeScript) helps catch issues early  
- **Clear React guidance** prevents over-complex components and improves reusability  

---

## 🧱 How We Enforce Them

### **Linting & Formatting**
- **ESLint + Prettier** configured for the frontend (`purrfectMatch-Homepage/`)
  - Shared base config for consistency
  - Disallow unused variables/imports
  - Enforce import order, consistent quotes and semicolons
- **Prettier** handles formatting  
- **ESLint** handles code-quality and style rules

### **TypeScript Strict Mode**
- Enforced via `tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "noUncheckedIndexedAccess": true
    }
  }
