# Render backend + Firebase Android deployment

This setup deploys the Express API to Render and distributes the native Android app with Firebase App Distribution. Firebase Hosting is not used because it serves web apps, not Kotlin/Android APKs.

The included Render configuration uses a Free Web Service with disposable JSON storage. A fresh empty database is seeded with a shared demo account and four tasks. Data created afterward can disappear when Render redeploys or recreates the service.

## 1. Push the project to GitHub

Push the repository root, including `render.yaml`, `android/`, and `backend/`. The root `.gitignore` excludes dependencies, local data, local Android configuration, Firebase logs, and signing credentials.

## 2. Deploy the Render Blueprint

1. In the [Render dashboard](https://dashboard.render.com/), select **New -> Blueprint**.
2. Connect the GitHub repository. Render detects the root `render.yaml` and displays the `minta-task-manager-api` Web Service.
3. Select the Free plan if it is not already selected and click **Apply/Deploy**.
4. When prompted for `DEMO_PASSWORD`, enter a demo-only password. Use `password123` only if you want to match the examples below; never reuse a real password.

The Blueprint configures:

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Health Check Path | `/health` |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Generated securely by Render |
| `SEED_DEMO_DATA` | `true` |
| `DEMO_NAME` | `Demo User` |
| `DEMO_EMAIL` | `demo@example.com` |
| `DEMO_PASSWORD` | Supplied privately during setup |

Render supplies `PORT` automatically; do not override it. The service URL can include a suffix if the requested name is unavailable, so always copy the actual URL from the dashboard.

### Alternative: manual Web Service setup

If you do not use the Blueprint, select **New -> Web Service**, connect the repository, and enter the Root Directory, Runtime, Build Command, Start Command, and Health Check Path from the table above. Then add every environment variable listed above. For `JWT_SECRET`, generate a random value of at least 32 bytes locally and paste it into Render:

```bash
openssl rand -hex 32
```

Do not commit this secret to Git.

## 3. Verify the API

Wait for the Render deploy to finish, then replace the example host with your assigned service URL:

```bash
export API_BASE_URL="https://YOUR_SERVICE.onrender.com/"
curl "${API_BASE_URL}health"
```

The expected response is:

```json
{"status":"ok"}
```

Verify the seeded login, using the demo password chosen during setup:

```bash
curl -X POST "${API_BASE_URL}api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}'
```

A successful response contains a JWT token and the demo user. Free services can take time to wake after inactivity, so open the health URL shortly before a demo.

## 4. Build and distribute the Android app

Follow [FIREBASE_APP_DISTRIBUTION.md](FIREBASE_APP_DISTRIBUTION.md). The included script builds the APK against the Render URL and uploads it to Firebase:

```bash
export API_BASE_URL="https://YOUR_SERVICE.onrender.com/"
export FIREBASE_APP_ID="YOUR_FIREBASE_ANDROID_APP_ID"
export FIREBASE_TESTERS="tester@example.com"
./scripts/distribute-android.sh
```

The URL must use HTTPS and include the trailing slash. The app reads it through Android's `BuildConfig.API_BASE_URL`; no CORS or Firebase Hosting rewrite is required for a native Android client.

## Demo behavior and limitations

- If you used `password123` during setup, login is `demo@example.com` / `password123`.
- Everyone using this account sees and changes the same tasks.
- New registrations and task changes are temporary on Render Free.
- Seeding runs only when both the users and tasks collections are empty; it does not overwrite an existing database.
- Production forgot-password responses do not expose `devResetCode`. Real email or SMS delivery is required to make that flow usable publicly.
- This configuration is intended for a short client demonstration, not production data.
- Firebase App Distribution is for tester builds. A public production Android release should use protected release signing and Google Play.
