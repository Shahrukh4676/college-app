# Android Release and Deployment Guide — Student Marketplace

This guide details the verified development setup, environment configuration, build commands, internal testing process, and Google Play production submission for Student Marketplace.

---

## 1. Verified Development & Build Setup

### System Prerequisites
- **Node.js**: v20 LTS or v22 LTS
- **Package Manager**: npm v10+
- **Expo CLI**: Integrated with Expo SDK 57
- **Java Development Kit (JDK)**: OpenJDK 17 or Eclipse Temurin 17 (required for native Gradle builds)
- **Android SDK & Command Line Tools**:
  - API Level: 34 (Android 14) and API Level 35 (Android 15)
  - `ANDROID_HOME` or `ANDROID_SDK_ROOT` set in system environment variables
  - `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\cmdline-tools\latest\bin` added to `PATH`

### Verification Commands
```bash
# Verify Node and npm
node -v
npm -v

# Verify project dependencies and static checks
npm test
npm run lint
npx tsc --noEmit
```

---

## 2. Environment Configuration

The application uses Expo's public environment variable mechanism (`EXPO_PUBLIC_*`).

### Development Environment (`.env.development` or default `.env`):
```env
# Local network IP of your host machine running Person 1's backend
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api/v1
# Enable offline mock data if testing without a running backend server
EXPO_PUBLIC_USE_MOCK_API=true
```

### Production Environment (`.env.production`):
```env
# Production backend cluster
EXPO_PUBLIC_API_URL=https://api.studentmarketplace.campus.edu/api/v1
# CRITICAL: strictly false for release builds
EXPO_PUBLIC_USE_MOCK_API=false
```

> **Security Note**: Variables prefixed with `EXPO_PUBLIC_` are bundled into client JavaScript. Never place payment gateway private API keys, database credentials, or secret signing keys into this file.

---

## 3. Internal Testing Process (Physical Android Devices)

### Option A: Cloud APK Generation via EAS (Fastest & Most Reliable)
EAS Build creates an installable `.apk` file without requiring a local Android SDK or Gradle build.

```bash
# 1. Login to your Expo account
npx eas-cli login

# 2. Trigger the preview profile build for Android
npx eas-cli build --platform android --profile preview
```
- EAS outputs a direct `.apk` download URL and QR code.
- Download the `.apk` on test devices, permit "Install unknown apps" in Android settings, and install.

### Option B: Local Android Development Build
For running directly on an Android emulator or USB-connected device:

```bash
# Ensure an Android emulator is running or a device with USB debugging is connected
adb devices

# Run the native development client
npx expo run:android
```

---

## 4. Generating the Production Android App Bundle (.aab)

Google Play Store requires an **Android App Bundle (.aab)** signed with a release keystore.

```bash
# 1. Run full verification suite prior to build
npm test
npm run lint
npx tsc --noEmit

# 2. Build production bundle via EAS
npx eas-cli build --platform android --profile production
```

When building for the first time:
- EAS will ask: `Generate a new Android keystore?` ➔ Select **Yes**.
- EAS securely manages keystores in your account. Back up credentials with:
  ```bash
  npx eas-cli credentials
  ```

---

## 5. Google Play Console Submission Checklist

Before submitting the `.aab` to Closed Testing / Internal Track:

1. **App Metadata**:
   - Title: `Student Marketplace`
   - Short Description: `Peer-to-peer academic assistance, course notes, and tutoring marketplace.`
   - Full Description: Highlighting student skill collaboration, peer tutoring, lab debugging, and study material exchange.
   - Category: Education

2. **Screenshots & Graphics**:
   - High-resolution icon: 512x512 PNG (32-bit color)
   - Feature Graphic: 1024x500 PNG/JPEG
   - Phone Screenshots: Minimum 4 screenshots (Home, Marketplace, Task Details, Chat).

3. **Data Safety Disclosures**:
   - **Personal info**: Name, academic email address (for identification and account management).
   - **Financial info**: Transaction and escrow history (no credit card details stored).
   - **Messages**: In-app peer chat collaboration messages.
   - **Data encryption**: All data encrypted in transit using TLS/HTTPS.
   - **Account Deletion**: Provide the deletion request mechanism implemented in Settings (`/settings`).

4. **Academic Integrity Declaration**:
   - Ensure app guidelines explicitly declare that Student Marketplace prohibits live examination cheating, proxy submissions, and plagiarism.

---

## 6. Known Release Blockers & Pre-Flight Checks

Before promoting an internal testing track to public production:
1. **Person 1 Backend Deployment**:
   - Live backend must be deployed to an HTTPS domain.
   - CORS headers on the backend must permit mobile app origin requests.
2. **Payment Gateway Credentials**:
   - Razorpay/Cashfree live credentials configured on the backend server.
3. **Mock API Verification**:
   - Verify that `EXPO_PUBLIC_USE_MOCK_API` is set to `false` and that the app displays truthful offline states rather than fallback fixtures if the server is unreachable.
