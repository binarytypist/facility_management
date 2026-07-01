# facility_management


The **facility_management** is a full-stack solution designed for managing, assigning, and tracking geographic tasks and field work. The system is split across three main components: an admin web dashboard, a central API, and a mobile application for field workers.

## 📖 Program Description

- **Web Dashboard (Frontend)**: A web-based interface for administrators and dispatchers. It allows users to create work events, manage master data (like categories, clients, and teams), and visualize tasks on a map interface.
- **API Server (Backend)**: A robust backend server that acts as the single source of truth for both the web and mobile clients. It handles data persistence, authentication, and business logic.
- **Mobile Application**: A cross-platform mobile app used by field workers to view their assignments, report status updates, and view task locations.

## 🚀 Tech Stack

### Frontend (Web Dashboard)
- **Framework**: Angular 21
- **UI & Styling**: PrimeNG, TailwindCSS 4, PrimeIcons
- **Maps**: Leaflet
- **Authentication**: Keycloak
- **Testing**: Playwright & Vitest

### Backend (API Server)
- **Framework**: Next.js 16 (utilized for API Routes)
- **Database & ORM**: MariaDB / MySQL with Prisma ORM v7
- **Security & Validation**: bcryptjs, Zod
- **Language**: TypeScript

### Mobile App (Field Workers)
- **Framework**: Flutter (Dart)
- **State Management**: Provider
- **Networking**: HTTP package
- **UI**: Material Design, Google Fonts

---

## ⚙️ Setup Instructions

### Prerequisites
Before running the project locally, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or v20+)
- [npm](https://www.npmjs.com/) (or yarn/pnpm)
- [Flutter SDK](https://docs.flutter.dev/get-started/install) (for the mobile app)
- A running instance of **MariaDB** or **MySQL**.

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Environment Configuration:
   - Copy `.env.example` to `.env`
   - Update the `DATABASE_URL` variable to point to your local MariaDB/MySQL instance.
4. Database Setup:
   ```bash
   # Push the schema to your database
   npx prisma db push
   
   # Run the seed script to populate initial master data
   npm run prisma db seed
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
   *The backend API will typically run on `http://localhost:3000`.*

### Database Reset / New PC Setup
If you delete your database or clone this repository on a brand new PC, the backend will fail to connect and return errors. To restore it:
1. Ensure your `.env` file exists in `backend/` and `DATABASE_URL` is correct.
2. Recreate all database tables automatically:
   ```bash
   npx prisma db push
   ```
3. Populate the empty database with initial default data:
   ```bash
   npx prisma db seed
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Environment Configuration:
   - Ensure the API URL and Keycloak configurations in `src/environments/environment.ts` are pointing to your local instances.
4. Start the Angular development server:
   ```bash
   npm start
   ```
   *The web dashboard will be available at `http://localhost:4200`.*

### 3. Mobile App Setup
1. Open a new terminal and navigate to the mobile app directory:
   ```bash
   cd mobile_app
   ```
2. Install Flutter packages:
   ```bash
   flutter pub get
   ```
3. Configuration:
   - Ensure the API base URL in `lib/constants/api_constants.dart` points to your backend server (use your local IP address instead of `localhost` if running on a physical device or emulator).
4. Run the app on an emulator or connected device:
   ```bash
   flutter run
   ```

## 📝 License
This project is private and confidential.
