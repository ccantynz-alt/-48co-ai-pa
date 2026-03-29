# 48co Voice — Android Custom Keyboard

A system-level input method (IME) for Android that works in every app. Voice-to-text, grammar checking, and custom vocabulary — all from your keyboard.

## How to Build

1. **Open in Android Studio**: File > Open, then select the `android-keyboard` folder
2. **Sync Gradle**: Android Studio will prompt you to sync — click "Sync Now"
3. **Build**: Click the green play button or press Shift+F10
4. **Install**: Connect an Android device (or use an emulator) and run the app

## How to Enable the Keyboard

After installing:

1. Open the **48co Voice** app — it will guide you through setup
2. Tap **Enable Keyboard** — this opens Android's keyboard settings
3. Find **48co Voice** and toggle it ON
4. Tap **Select Keyboard** — choose 48co Voice from the picker
5. Try typing in the test area at the bottom of the setup screen

## Features

- Full QWERTY layout with number row and symbols
- Voice-to-text using Android SpeechRecognizer
- Local grammar checking (30+ common error rules)
- Material 3 design with light/dark theme support
- Key press haptic feedback and animations
- Auto-capitalisation after sentences
- Double-space for period
- Handles input types (email, URL, number, etc.)
- Switch keyboard button for quick IME switching

## Architecture

```
app/src/main/java/nz/co/fortyeightco/keyboard/
  FortyEightCoIME.kt     — InputMethodService (the keyboard service)
  KeyboardView.kt        — Custom View with QWERTY layout and touch handling
  VoiceEngine.kt         — Speech recognition via Android SpeechRecognizer
  GrammarEngine.kt       — Local grammar rules (30+ patterns)
  KeyboardTheme.kt       — Material 3 theming
  SetupActivity.kt       — Setup guide with keyboard enable/select buttons
```

## Requirements

- Android 8.0+ (API 26)
- Android Studio Hedgehog or later
- Kotlin 1.9+
