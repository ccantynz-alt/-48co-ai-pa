// Custom hotkey system — supports keyboard shortcuts AND mouse buttons
//
// This is what makes AlecRae Voice different from WhisperTyping:
// Users can choose ANY trigger they want — keyboard combo, mouse button, etc.
//
// Supported triggers:
//   - Keyboard: CmdOrCtrl+Shift+Space (default)
//   - Mouse: Middle click (mouse wheel press)
//   - Mouse: Mouse button 4 (side button)
//   - Mouse: Mouse button 5 (side button)
//   - Any keyboard key combo the user wants
//
// Uses `rdev` crate for global input capture at the OS level.
// Works on Windows, Mac, Linux.

use rdev::{listen, Event, EventType, Button};
use std::sync::{Arc, atomic::{AtomicBool, Ordering}};
use std::thread;

static MOUSE_HOTKEY_ENABLED: AtomicBool = AtomicBool::new(true);
static MOUSE_BUTTON: once_cell::sync::Lazy<std::sync::Mutex<HotkeyButton>> =
    once_cell::sync::Lazy::new(|| std::sync::Mutex::new(HotkeyButton::MiddleClick));

#[derive(Debug, Clone, PartialEq)]
pub enum HotkeyButton {
    MiddleClick,    // Mouse wheel press
    Mouse4,         // Side button (back)
    Mouse5,         // Side button (forward)
    None,           // Disabled — use keyboard only
}

impl HotkeyButton {
    pub fn from_str(s: &str) -> Self {
        match s {
            "middle" | "middle-click" | "mouse3" => HotkeyButton::MiddleClick,
            "mouse4" | "back" => HotkeyButton::Mouse4,
            "mouse5" | "forward" => HotkeyButton::Mouse5,
            "none" | "disabled" | "keyboard-only" => HotkeyButton::None,
            _ => HotkeyButton::MiddleClick, // default
        }
    }

    pub fn to_str(&self) -> &str {
        match self {
            HotkeyButton::MiddleClick => "middle-click",
            HotkeyButton::Mouse4 => "mouse4",
            HotkeyButton::Mouse5 => "mouse5",
            HotkeyButton::None => "keyboard-only",
        }
    }
}

/// Set which mouse button triggers recording
pub fn set_mouse_hotkey(button: HotkeyButton) {
    *MOUSE_BUTTON.lock().unwrap() = button;
}

/// Enable/disable mouse hotkey
pub fn set_mouse_hotkey_enabled(enabled: bool) {
    MOUSE_HOTKEY_ENABLED.store(enabled, Ordering::Relaxed);
}

/// Start the global mouse listener in a background thread.
/// Calls `on_toggle` whenever the configured mouse button is pressed.
/// Returns immediately — the listener runs in a separate thread.
pub fn start_mouse_listener<F>(on_toggle: F)
where
    F: Fn() + Send + Sync + 'static,
{
    let callback = Arc::new(on_toggle);

    thread::spawn(move || {
        let cb = callback.clone();

        let result = listen(move |event: Event| {
            if !MOUSE_HOTKEY_ENABLED.load(Ordering::Relaxed) {
                return;
            }

            let target_button = MOUSE_BUTTON.lock().unwrap().clone();
            if target_button == HotkeyButton::None {
                return;
            }

            match event.event_type {
                EventType::ButtonPress(button) => {
                    let matched = match target_button {
                        HotkeyButton::MiddleClick => button == Button::Middle,
                        HotkeyButton::Mouse4 => button == Button::Unknown(3), // platform-specific
                        HotkeyButton::Mouse5 => button == Button::Unknown(4),
                        HotkeyButton::None => false,
                    };

                    if matched {
                        cb();
                    }
                }
                _ => {}
            }
        });

        if let Err(e) = result {
            eprintln!("[AlecRae Voice] Mouse listener error: {:?}", e);
        }
    });
}
