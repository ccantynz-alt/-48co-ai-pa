// 48co — Tauri 2.0 Backend
//
// System tray app with global hotkey. Records voice, transcribes via Whisper,
// types text into any focused application using OS-level keyboard simulation.
//
// Architecture:
//   - Rust backend: audio capture, Whisper API, keyboard simulation, settings
//   - React frontend: settings UI only (the app is invisible during normal use)
//   - No Electron. No Node.js. Pure Rust + native APIs.
//
// Size: ~5MB (vs 150MB Electron). No antivirus warnings. No native compilation issues.

mod audio;
mod keyboard;
mod transcribe;
mod grammar;

use std::sync::{Arc, Mutex};
use tauri::{
    AppHandle, Manager, SystemTray, SystemTrayMenu, SystemTrayMenuItem,
    SystemTrayEvent, CustomMenuItem,
};

// App state shared across commands
pub struct AppState {
    pub is_recording: Mutex<bool>,
    pub whisper_api_key: Mutex<String>,
    pub claude_api_key: Mutex<String>,
    pub language: Mutex<String>,
    pub ai_rewrite: Mutex<bool>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            is_recording: Mutex::new(false),
            whisper_api_key: Mutex::new(String::new()),
            claude_api_key: Mutex::new(String::new()),
            language: Mutex::new("en".to_string()),
            ai_rewrite: Mutex::new(false),
        }
    }
}

// Tauri commands callable from the frontend
#[tauri::command]
async fn toggle_recording(state: tauri::State<'_, Arc<AppState>>, app: AppHandle) -> Result<String, String> {
    let mut recording = state.is_recording.lock().unwrap();

    if *recording {
        // Stop recording
        *recording = false;
        drop(recording); // release lock before async work

        // Get recorded audio and transcribe
        let audio_data = audio::stop_recording();

        let api_key = state.whisper_api_key.lock().unwrap().clone();
        let language = state.language.lock().unwrap().clone();

        if api_key.is_empty() {
            return Err("No API key set. Open Settings to add your OpenAI key.".to_string());
        }

        // Transcribe with Whisper
        let text = transcribe::whisper_api(&audio_data, &api_key, &language)
            .await
            .map_err(|e| format!("Transcription failed: {}", e))?;

        if text.is_empty() {
            return Ok("No speech detected.".to_string());
        }

        // Optional: AI grammar/rewrite
        let ai_enabled = *state.ai_rewrite.lock().unwrap();
        let claude_key = state.claude_api_key.lock().unwrap().clone();

        let final_text = if ai_enabled && !claude_key.is_empty() {
            grammar::rewrite(&text, &claude_key)
                .await
                .unwrap_or(text.clone()) // fallback to original on failure
        } else {
            grammar::post_process(&text)
        };

        // Type into focused application
        keyboard::type_text(&final_text)
            .map_err(|e| format!("Typing failed: {}", e))?;

        // Update tray
        update_tray(&app, false);

        Ok(final_text)
    } else {
        // Start recording
        let api_key = state.whisper_api_key.lock().unwrap().clone();
        if api_key.is_empty() {
            return Err("No API key set. Open Settings to add your OpenAI key.".to_string());
        }

        *recording = true;
        drop(recording);

        audio::start_recording()
            .map_err(|e| format!("Mic error: {}", e))?;

        update_tray(&app, true);

        Ok("Recording started".to_string())
    }
}

#[tauri::command]
fn set_api_key(state: tauri::State<'_, Arc<AppState>>, key: String) {
    *state.whisper_api_key.lock().unwrap() = key;
}

#[tauri::command]
fn set_claude_key(state: tauri::State<'_, Arc<AppState>>, key: String) {
    *state.claude_api_key.lock().unwrap() = key;
}

#[tauri::command]
fn set_language(state: tauri::State<'_, Arc<AppState>>, lang: String) {
    *state.language.lock().unwrap() = lang;
}

#[tauri::command]
fn set_ai_rewrite(state: tauri::State<'_, Arc<AppState>>, enabled: bool) {
    *state.ai_rewrite.lock().unwrap() = enabled;
}

fn update_tray(app: &AppHandle, recording: bool) {
    if let Some(tray) = app.tray_by_id("main") {
        let _ = tray.set_tooltip(Some(if recording {
            "48co — Recording..."
        } else {
            "48co — Ready"
        }));
    }
}

fn build_tray_menu() -> SystemTrayMenu {
    SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("toggle", "Start Recording"))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("settings", "Settings"))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("quit", "Quit 48co"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let state = Arc::new(AppState::default());

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_notification::init())
        .manage(state.clone())
        .system_tray(SystemTray::new().with_menu(build_tray_menu()))
        .on_system_tray_event(move |app, event| {
            match event {
                SystemTrayEvent::LeftClick { .. } => {
                    // Toggle recording on left click
                    let state = app.state::<Arc<AppState>>();
                    let app_handle = app.clone();
                    tauri::async_runtime::spawn(async move {
                        let _ = toggle_recording(state, app_handle).await;
                    });
                }
                SystemTrayEvent::MenuItemClick { id, .. } => {
                    match id.as_str() {
                        "toggle" => {
                            let state = app.state::<Arc<AppState>>();
                            let app_handle = app.clone();
                            tauri::async_runtime::spawn(async move {
                                let _ = toggle_recording(state, app_handle).await;
                            });
                        }
                        "settings" => {
                            if let Some(window) = app.get_webview_window("settings") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                }
                _ => {}
            }
        })
        .setup(|app| {
            // Register global shortcut: Ctrl+Shift+Space
            use tauri_plugin_global_shortcut::ShortcutState;

            let state = app.state::<Arc<AppState>>().inner().clone();
            let app_handle = app.handle().clone();

            app.global_shortcut().on_shortcut("CmdOrCtrl+Shift+Space", move |_, _, event| {
                if event.state == ShortcutState::Pressed {
                    let s = state.clone();
                    let h = app_handle.clone();
                    tauri::async_runtime::spawn(async move {
                        let _ = toggle_recording(
                            tauri::State::from(&s),
                            h,
                        ).await;
                    });
                }
            })?;

            // Load saved settings from store
            // Settings are loaded by the frontend on startup and sent via commands

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            toggle_recording,
            set_api_key,
            set_claude_key,
            set_language,
            set_ai_rewrite,
        ])
        .run(tauri::generate_context!())
        .expect("error while running 48co");
}
