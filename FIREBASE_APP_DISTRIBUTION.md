# Firebase App Distribution for the Android app

Minta is a native Kotlin Android app, so **Firebase Hosting cannot host it**. Hosting serves web files, while Firebase App Distribution delivers an installable Android APK to invited testers. This repository uses App Distribution; no `firebase.json`, Firebase SDK, or `google-services.json` is needed for an APK upload.

App Distribution is for pre-release testing, not a replacement for Google Play when you are ready for a public production launch.

## Prerequisites

1. Deploy the backend to [Render](RENDER_DEPLOYMENT.md) and verify its `/health` response. Copy the actual HTTPS service URL from Render.
2. In the [Firebase console](https://console.firebase.google.com/), create or select a project.
3. Add an Android app with package name `com.example.taskmanager`. A nickname is optional. You can skip downloading `google-services.json` and skip the SDK steps because this project only uses App Distribution.
4. Open **Project settings -> General**, select the Android app, and copy its **App ID**. It looks like `1:1234567890:android:abcdef123456`, but you must use the value from your project.
5. Install Node.js 20 or newer. The upload script uses an installed `firebase` command when available and otherwise downloads the Firebase CLI with `npx`.

Authenticate the CLI and confirm that it can access your Firebase project:

```bash
npx --yes firebase-tools@latest login
npx --yes firebase-tools@latest projects:list
```

Authentication opens a browser. Do not commit Firebase refresh tokens or service-account files.

## Build and distribute

From the repository root, set your own values and run:

```bash
export API_BASE_URL="https://YOUR_SERVICE.onrender.com/"
export FIREBASE_APP_ID="YOUR_FIREBASE_ANDROID_APP_ID"
export FIREBASE_TESTERS="tester@example.com"
export RELEASE_NOTES="Minta demo connected to Render"

./scripts/distribute-android.sh
```

Use a comma-separated value for multiple tester emails:

```bash
export FIREBASE_TESTERS="first@example.com,second@example.com"
```

Alternatively, create a tester group in **App Distribution -> Testers and groups**, unset `FIREBASE_TESTERS`, and provide its alias:

```bash
unset FIREBASE_TESTERS
export FIREBASE_GROUPS="testers"
./scripts/distribute-android.sh
```

To upload the release without inviting testers yet, unset both optional target variables:

```bash
unset FIREBASE_TESTERS FIREBASE_GROUPS
./scripts/distribute-android.sh
```

The script:

1. Validates the HTTPS backend URL and Firebase settings.
2. Runs `./gradlew :app:clean :app:assembleDebug -PAPI_BASE_URL=...` and verifies the generated backend URL.
3. Uploads `android/app/build/outputs/apk/debug/app-debug.apk` with the Firebase CLI.
4. Prints Firebase's console and testing links after a successful upload.

To build the APK without uploading it:

```bash
API_BASE_URL="https://YOUR_SERVICE.onrender.com/" \
  ./scripts/distribute-android.sh --build-only
```

## Tester installation

Firebase emails invitations to new testers. Each tester must accept the invitation, open the App Distribution testing link on their Android device, and allow installation from the requested source when Android prompts them. Releases remain available according to Firebase App Distribution's retention policy.

## Signing and release limitations

- This workflow intentionally uses the **debug** variant, which Gradle signs with the local Android debug key. It is suitable for a demo or trusted tester build, not a production release.
- A debug build enables HTTP request/response logging. Do not use real credentials or sensitive data with it.
- If another machine signs the same app with a different debug key, testers may need to uninstall the older build before installing an update.
- For a public release, configure a protected release keystore, build a signed release APK/AAB, and publish through Google Play. Never commit signing keys or passwords.
- The app communicates directly with Render; Firebase App Distribution does not proxy API traffic or provide a web URL for running the Android UI.
