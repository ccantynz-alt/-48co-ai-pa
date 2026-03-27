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
mod local_whisper;
mod local_grammar;

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
    pub use_local_whisper: Mutex<bool>,       // true = on-device, false = API
    pub local_model: Mutex<String>,            // model filename e.g. "ggml-base.bin"
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            is_recording: Mutex::new(false),
            whisper_api_key: Mutex::new(String::new()),
            claude_api_key: Mutex::new(String::new()),
            language: Mutex::new("en".to_string()),
            ai_rewrite: Mutex::new(false),
            use_local_whisper: Mutex::new(false),
            local_model: Mutex::new("ggml-base.bin".to_string()),
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

        let use_local = *state.use_local_whisper.lock().unwrap();
        let language = state.language.lock().unwrap().clone();

        let text = if use_local {
            // On-device transcription — no API key, no internet, no cost
            let model_name = state.local_model.lock().unwrap().clone();
            let model_file = local_whisper::model_path(&model_name);

            if !model_file.exists() {
                return Err(format!(
                    "Model '{}' not downloaded yet. Go to Settings → Download Model.",
                    model_name
                ));
            }

            let model_str = model_file.to_string_lossy().to_string();
            let audio = audio_data.clone();
            let lang = language.clone();

            // Run in blocking thread (Whisper inference is CPU-bound)
            tokio::task::spawn_blocking(move || {
                local_whisper::transcribe_local(&audio, &model_str, &lang)
            })
            .await
            .map_err(|e| format!("Thread error: {}", e))?
            .map_err(|e| format!("Local transcription failed: {}", e))?
        } else {
            // Cloud transcription via Whisper API
            let api_key = state.whisper_api_key.lock().unwrap().clone();

            if api_key.is_empty() {
                return Err("No API key set. Open Settings to add your OpenAI key, or enable Local Whisper.".to_string());
            }

            transcribe::whisper_api(&audio_data, &api_key, &language)
                .await
                .map_err(|e| format!("Transcription failed: {}", e))?
        };

        if text.is_empty() {
            return Ok("No speech detected.".to_string());
        }

        // Grammar correction pipeline:
        // 1. If AI rewrite enabled + Claude key → use Claude API (best quality)
        // 2. Otherwise → use local grammar engine (free, instant, offline)
        let ai_enabled = *state.ai_rewrite.lock().unwrap();
        let claude_key = state.claude_api_key.lock().unwrap().clone();

        let final_text = if ai_enabled && !claude_key.is_empty() {
            // Cloud AI rewrite (Claude API — best quality)
            grammar::rewrite(&text, &claude_key)
                .await
                .unwrap_or_else(|_| local_grammar::fix_grammar(&text))
        } else {
            // Local grammar correction (free, instant, no API)
            local_grammar::fix_grammar(&grammar::post_process(&text))
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

#[tauri::command]
fn set_use_local_whisper(state: tauri::State<'_, Arc<AppState>>, enabled: bool) {
    *state.use_local_whisper.lock().unwrap() = enabled;
}

#[tauri::command]
fn set_local_model(state: tauri::State<'_, Arc<AppState>>, model: String) {
    *state.local_model.lock().unwrap() = model;
}

#[tauri::command]
fn check_model_downloaded(model_name: String) -> bool {
    local_whisper::model_exists(&model_name)
}

#[tauri::command]
async fn download_model(model_name: String) -> Result<String, String> {
    let path = local_whisper::download_model(&model_name).await?;
    Ok(format!("Model downloaded: {:?}", path))
}

#[tauri::command]
fn get_models_dir() -> String {
    local_whisper::models_dir().to_string_lossy().to_string()
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
            set_use_local_whisper,
            set_local_model,
            check_model_downloaded,
            download_model,
            get_models_dir,
        ])
        .run(tauri::generate_context!())
        .expect("error while running 48co");
}
