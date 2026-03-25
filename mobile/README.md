# 48co Mobile Keyboard

AI grammar correction keyboard for iOS and Android. Corrects everything you type — texts, emails, notes, social media — before you hit send.

## Architecture

### How Custom Keyboards Work

**iOS:** Custom keyboard extension (App Extension). Ships inside the main app. User enables it in Settings → Keyboards → Add New Keyboard → 48co.

**Android:** Input Method Editor (IME). Ships as part of the main app. User enables it in Settings → Languages & Input → Manage Keyboards → 48co.

### Tech Stack

- **React Native** (Expo) for the companion app (settings, onboarding, account)
- **Native keyboard extensions** for the actual keyboard (Swift/Kotlin)
  - iOS: Custom Keyboard Extension (UIInputViewController)
  - Android: InputMethodService
- **Claude Haiku API** for grammar checking (fast, cheap — ~$0.001/check)
- **Whisper API** for voice-to-text from the keyboard mic button

### Why Native Keyboard Extensions?

React Native cannot render a custom keyboard directly — iOS and Android require native code for keyboard extensions. The architecture is:

1. **Companion App** (React Native/Expo) — Settings, API key management, account, onboarding
2. **Keyboard Extension** (Swift for iOS, Kotlin for Android) — The actual keyboard UI
3. **Shared Logic** — Grammar API calls, settings sync via App Groups (iOS) / SharedPreferences (Android)

### Features

- Standard QWERTY keyboard layout
- Real-time grammar underlines (red squiggly)
- Tap correction to apply fix
- Autocorrect bar with AI suggestions
- Voice button for dictation (Whisper API)
- Works in every app: Messages, WhatsApp, Gmail, Slack, Notes, etc.
- Dark + light mode (matches system)

### Build & Deploy

```bash
# Companion app (Expo)
npm install
npm run ios        # dev
npm run android    # dev
npm run build:ios  # production (via EAS Build)
npm run build:android

# Keyboard extensions are built as part of the native build
# iOS: Xcode project in ios/
# Android: Gradle project in android/
```

### Development Roadmap

1. **Phase 1:** Companion app with settings + onboarding
2. **Phase 2:** iOS keyboard extension (Swift)
3. **Phase 3:** Android keyboard extension (Kotlin)
4. **Phase 4:** Voice-to-text from keyboard mic button
5. **Phase 5:** App Store + Play Store submission

### App Store Notes

- iOS keyboard extensions require "Full Access" permission for network (API calls)
- User must be informed that keystrokes are sent to Claude API for grammar checking
- Privacy policy must clearly state data handling
- Apple Review: ~1 week, keyboard extensions get extra scrutiny
- Google Play: ~2-3 days review
