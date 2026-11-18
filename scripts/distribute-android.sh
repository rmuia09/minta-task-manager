#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ANDROID_DIR="$ROOT_DIR/android"
APK_PATH="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
BUILD_CONFIG_PATH="$ANDROID_DIR/app/build/generated/source/buildConfig/debug/com/example/taskmanager/BuildConfig.java"
BUILD_ONLY=false

usage() {
  cat <<'EOF'
Build Minta against Render and optionally upload it to Firebase App Distribution.

Usage:
  API_BASE_URL=https://SERVICE.onrender.com/ ./scripts/distribute-android.sh --build-only

  FIREBASE_APP_ID=1:1234567890:android:0a1b2c3d4e5f67890 \
  API_BASE_URL=https://SERVICE.onrender.com/ \
  FIREBASE_TESTERS=tester@example.com \
  ./scripts/distribute-android.sh

Use FIREBASE_GROUPS instead of FIREBASE_TESTERS to distribute to a comma-separated
list of existing tester group aliases. If neither is set, the release is uploaded
without sending tester invitations. RELEASE_NOTES is optional.

Environment:
  FIREBASE_APP_ID   Firebase Android App ID (required unless using --build-only)
  API_BASE_URL      Deployed HTTPS backend URL, including the trailing slash
  FIREBASE_TESTERS  Optional comma-separated tester email addresses
  FIREBASE_GROUPS   Optional comma-separated Firebase tester group aliases
  RELEASE_NOTES     Notes shown to testers (defaults to a UTC timestamp)
EOF
}

fail() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

case "${1:-}" in
  --help|-h)
    usage
    exit 0
    ;;
  --build-only)
    BUILD_ONLY=true
    shift
    ;;
esac

[[ $# -eq 0 ]] || fail "Unknown argument: $1. Use --help for usage."
[[ -n "${API_BASE_URL:-}" ]] || fail "Set API_BASE_URL to the deployed Render URL."
[[ "$API_BASE_URL" =~ ^https://[^[:space:]]+/$ ]] || \
  fail "API_BASE_URL must be an HTTPS URL with a trailing slash."

if [[ "$BUILD_ONLY" == false ]]; then
  [[ -n "${FIREBASE_APP_ID:-}" ]] || fail "Set FIREBASE_APP_ID to the Firebase Android App ID."
  [[ "$FIREBASE_APP_ID" =~ ^[0-9]+:[0-9]+:android:[0-9a-f]+$ ]] || \
    fail "FIREBASE_APP_ID is not a valid Firebase Android App ID."

  if [[ -n "${FIREBASE_TESTERS:-}" && -n "${FIREBASE_GROUPS:-}" ]]; then
    fail "Set only one of FIREBASE_TESTERS or FIREBASE_GROUPS."
  fi
fi

printf 'Building the Android APK with API_BASE_URL=%s\n' "$API_BASE_URL"
(
  cd "$ANDROID_DIR"
  ./gradlew :app:clean :app:assembleDebug "-PAPI_BASE_URL=$API_BASE_URL"
)

[[ -f "$APK_PATH" ]] || fail "Gradle finished without creating $APK_PATH"
[[ -f "$BUILD_CONFIG_PATH" ]] || fail "Gradle did not generate BuildConfig.java"
grep -F "API_BASE_URL = \"$API_BASE_URL\";" "$BUILD_CONFIG_PATH" >/dev/null || \
  fail "The generated APK configuration does not contain the requested API_BASE_URL."
printf 'APK created: %s\n' "$APK_PATH"

if [[ "$BUILD_ONLY" == true ]]; then
  exit 0
fi

if command -v firebase >/dev/null 2>&1; then
  FIREBASE_COMMAND=(firebase)
elif command -v npx >/dev/null 2>&1; then
  NODE_MAJOR="$(node -p 'Number(process.versions.node.split(".")[0])')"
  (( NODE_MAJOR >= 20 )) || \
    fail "The Firebase CLI requires Node.js 20 or newer. Activate a newer Node version and retry."
  FIREBASE_COMMAND=(npx --yes firebase-tools@latest)
else
  fail "Install the Firebase CLI or Node.js 20+ with npx."
fi

DISTRIBUTION_ARGS=(
  appdistribution:distribute "$APK_PATH"
  --app "$FIREBASE_APP_ID"
  --release-notes "${RELEASE_NOTES:-Minta Android debug build $(date -u +%Y-%m-%dT%H:%M:%SZ)}"
)

if [[ -n "${FIREBASE_TESTERS:-}" ]]; then
  DISTRIBUTION_ARGS+=(--testers "$FIREBASE_TESTERS")
elif [[ -n "${FIREBASE_GROUPS:-}" ]]; then
  DISTRIBUTION_ARGS+=(--groups "$FIREBASE_GROUPS")
else
  printf 'No tester target set; uploading without sending invitations.\n'
fi

printf 'Uploading the APK to Firebase App Distribution...\n'
"${FIREBASE_COMMAND[@]}" "${DISTRIBUTION_ARGS[@]}"
