# 48co Voice — iOS Custom Keyboard

A system-level keyboard for iOS that works in every app. Voice-to-text, grammar checking, and custom vocabulary — all from your keyboard.

## How to Build

1. **Open in Xcode**: Double-click `FortyEightCoKeyboard.xcodeproj` (or open it from Xcode > File > Open)
2. **Set your team**: In Xcode, select the project in the sidebar, go to "Signing & Capabilities", and select your Apple Developer account for both targets:
   - `FortyEightCoKeyboard` (the main app)
   - `KeyboardExtension` (the keyboard itself)
3. **Set bundle ID**: Change `nz.co.48co.voice` to your own bundle ID if needed
4. **Build**: Press Cmd+R to build and run on your device (must be a real device, not simulator — keyboards don't work in the simulator)

## How to Enable the Keyboard

After installing on your device:

1. Open **Settings** > **General** > **Keyboard** > **Keyboards** > **Add New Keyboard**
2. Find **48co Voice** in the list and tap it
3. Tap **48co Voice** again, then enable **Allow Full Access** (required for voice-to-text and network features)
4. Open any app with a text field, tap the globe icon on your keyboard to switch to 48co Voice

## Features

- Full QWERTY keyboard with proper key sizing and haptic feedback
- Voice-to-text using Apple Speech framework (works on-device for privacy)
- Local grammar checking (30+ common error rules)
- Light/dark mode support (follows system setting)
- Auto-capitalisation after sentences
- Double-space for period (like the default iOS keyboard)
- Globe button to switch between keyboards (required by Apple)

## Architecture

```
FortyEightCoKeyboard/     — Container app (required by Apple)
  AppDelegate.swift        — App lifecycle
  MainViewController.swift — Setup instructions shown when app is opened
  Info.plist               — App configuration

KeyboardExtension/         — The actual keyboard
  KeyboardViewController.swift — Main keyboard UI and input handling
  VoiceEngine.swift        — Speech recognition via SFSpeechRecognizer
  GrammarEngine.swift      — Local grammar rules (30+ patterns)
  KeyboardTheme.swift      — Light/dark theme colours and sizing
  Info.plist               — Extension configuration
```

## Requirements

- iOS 16.0+
- Xcode 15.0+
- Swift 5.9+
- Apple Developer account (free or paid)
