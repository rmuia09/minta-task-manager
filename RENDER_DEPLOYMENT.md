# Render demo deployment

This setup uses Render's free Web Service with disposable JSON storage. A fresh empty database is seeded with a shared demo account and four tasks. Data created afterward can disappear when Render redeploys or recreates the service.

## 1. Push the project to GitHub

Create a GitHub repository and push this project's root directory, including both `android/` and `backend/`. The root `.gitignore` excludes dependencies, local data, local Android configuration, and signing credentials.

## 2. Create the Render Web Service

In the Render dashboard, select **New -> Web Service** and connect the GitHub repository. Use these settings:

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Instance Type | Free |
| Health Check Path | `/health` |

Render supplies `PORT` automatically. Do not override it.

## 3. Configure environment variables

Add the following under **Environment**:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | A random secret of at least 32 bytes |
| `SEED_DEMO_DATA` | `true` |
| `DEMO_NAME` | `Demo User` |
| `DEMO_EMAIL` | `demo@example.com` |
| `DEMO_PASSWORD` | `password123` |

Generate a suitable local value for `JWT_SECRET` with `openssl rand -hex 32`, then paste the generated value into Render. Do not commit it to Git.

The demo credentials are intentionally public and must never protect real data. `DEMO_PASSWORD` should be a demo-only password.

## 4. Deploy and verify

Deploy the service, then open:

```text
https://YOUR_SERVICE.onrender.com/health
```

The expected response is:

```json
{"status":"ok"}
```

Verify the seeded login from your terminal, replacing the URL with your assigned service URL:

```bash
curl -X POST "https://YOUR_SERVICE.onrender.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}'
```

A successful response contains a JWT token and the demo user. Free services can take time to wake after inactivity, so open the health URL shortly before the client demo.

## 5. Point Android at Render

Add the assigned HTTPS URL to `android/gradle.properties`, including the trailing slash:

```properties
API_BASE_URL=https://YOUR_SERVICE.onrender.com/
```

Alternatively, pass it for a single Gradle invocation:

```bash
cd android
./gradlew :app:assembleDebug -PAPI_BASE_URL="https://YOUR_SERVICE.onrender.com/"
```

For a client install, use **Build -> Generate Signed App Bundle / APK** in Android Studio and generate a signed APK. The Gradle property is used by Android Studio as well. Release builds disable request/response body logging and do not permit cleartext HTTP.

## Demo behavior and limitations

- Login: `demo@example.com` / `password123`
- Everyone using this account sees and changes the same tasks.
- New registrations and task changes are temporary on Render Free.
- Seeding runs only when both the users and tasks collections are empty; it does not overwrite an existing database.
- Production forgot-password responses do not expose `devResetCode`. Real email or SMS delivery is required to make that flow usable publicly.
- This configuration is intended for a short client demonstration, not production data.
