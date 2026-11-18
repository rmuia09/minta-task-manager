# Minta — Task Manager (Android + Node.js)

A native Android task manager app with user authentication and forgot-password flow, styled after the **Minta** design concept (Material 3, light, mint/green palette).

## Project structure

```
mobile-app-demo/
├── android/          # Native Android app (Kotlin + Jetpack Compose)
│   ├── app/
│   │   └── src/main/
│   │       ├── java/com/example/taskmanager/
│   │       │   ├── data/          # Models, API, repositories, token store
│   │       │   ├── ui/            # Screens, theme, view models
│   │       │   └── MainActivity.kt
│   │       └── res/               # Resources (colors, themes, icons)
│   ├── build.gradle.kts
│   ├── settings.gradle.kts
│   └── gradlew
└── backend/          # Node.js + Express API (JSON file store)
    ├── server.js
    └── package.json
```

## Features

- **User authentication**: register, login, logout (JWT-based)
- **Forgot password**: request a 6-digit reset code, then reset the password
- **Task management**: create, read, update (toggle complete), and delete tasks
- **Minta design**: mint/green Material 3 theme, progress hero card, filter chips, new-task sheet

## Prerequisites

- **Backend**: Node.js 18+ and npm
- **Android**: Android Studio (with Android SDK 35) and JDK 17

## 1. Run the backend

```bash
cd backend
npm install
npm start
```

The API runs at `http://0.0.0.0:3000`. Data is persisted to a local `taskmanager.json` file (created automatically), so no database setup is required.

To start a fresh local demo with a seeded account and four tasks:

```bash
SEED_DEMO_DATA=true DB_FILE=/tmp/minta-demo.json npm start
```

Use `demo@example.com` / `password123` to log in. Seeding only runs when the configured database is empty.

> **Note on the reset code**: outside production, the forgot-password endpoint returns the 6-digit code in the response (`devResetCode`) and logs it to the console. When `NODE_ENV=production`, the code is not exposed; real email/SMS delivery is required.

## 2. Run the Android app

1. Open the `android/` folder in Android Studio.
2. Let Gradle sync (it will download dependencies).
3. Run the app on an emulator or device.

### Backend URL

The app uses `http://10.0.2.2:3000/` by default, which maps to your machine's `localhost` from the Android emulator. Override it with the `API_BASE_URL` Gradle property, including the trailing slash:

```bash
./gradlew :app:assembleDebug -PAPI_BASE_URL="http://10.0.2.2:3000/"
```

- **Emulator**: keep the default `10.0.2.2`.
- **Physical device**: set `API_BASE_URL` to your computer's LAN IP (for example, `http://192.168.1.10:3000/`), and make sure the device is on the same network.
- **Deployed demo**: follow [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md).

Debug builds permit local HTTP traffic. Release builds disable body logging and require HTTPS.

## API endpoints

| Method | Endpoint                    | Description                          |
|--------|-----------------------------|--------------------------------------|
| GET    | `/health`                   | Service health check                 |
| POST   | `/api/auth/register`        | Create an account                    |
| POST   | `/api/auth/login`           | Log in                               |
| POST   | `/api/auth/forgot-password` | Request a password reset code        |
| POST   | `/api/auth/reset-password`  | Reset password with the code         |
| GET    | `/api/tasks`                | List tasks (auth required)           |
| POST   | `/api/tasks`                | Create a task (auth required)        |
| PUT    | `/api/tasks/:id`            | Update a task (auth required)        |
| DELETE | `/api/tasks/:id`            | Delete a task (auth required)        |

## Tech stack

- **Android**: Kotlin, Jetpack Compose, Material 3, Navigation Compose, Retrofit, Gson, DataStore, Coroutines
- **Backend**: Node.js, Express, bcryptjs, jsonwebtoken (JSON file persistence)
