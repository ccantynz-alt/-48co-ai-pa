// 48co — Tauri 2.0 Backend
//
// System tray app with global hotkey. Records voice, transcribes via Whisper,
// types text into any focused application using OS-level keyboard simulation.
//
// Built by Claude. Designed for humans.
// Architecture: Pure Rust + React. No Electron. No Node.js.
// Size: ~5MB. No antivirus warnings. No native compilation issues.

mod audio;
mod keyboard;
mod transcribe;
mod grammar;
mod local_whisper;
mod local_grammar;

use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Manager};
use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;

// App state shared across commands
pub struct AppState {
    pub is_recording: Mutex<bool>,
    pub whisper_api_key: Mutex<String>,
    pub claude_api_key: Mutex<String>,
    pub language: Mutex<String>,
    pub ai_rewrite: Mutex<bool>,
    pub use_local_whisper: Mutex<bool>,
    pub local_model: Mutex<String>,
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

#[tauri::command]
async fn toggle_recording(app: AppHandle) -> Result<String, String> {
    let state = app.state::<Arc<AppState>>();
    let mut recording = state.is_recording.lock().unwrap();

    if *recording {
        *recording = false;
        drop(recording);

        let audio_data = audio::stop_recording();
        let use_local = *state.use_local_whisper.lock().unwrap();
        let language = state.language.lock().unwrap().clone();

        let text = if use_local {
            let model_name = state.local_model.lock().unwrap().clone();
            let model_file = local_whisper::model_path(&model_name);

            if !model_file.exists() {
                return Err(format!("Model '{}' not downloaded. Go to Settings → Download Model.", model_name));
            }

            let model_str = model_file.to_string_lossy().to_string();
            let audio = audio_data.clone();
            let lang = language.clone();

            tokio::task::spawn_blocking(move || {
                local_whisper::transcribe_local(&audio, &model_str, &lang)
            })
            .await
            .map_err(|e| format!("Thread error: {}", e))?
            .map_err(|e| format!("Local transcription failed: {}", e))?
        } else {
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

        // Grammar pipeline: post-process first, then either AI rewrite or local grammar
        let ai_enabled = *state.ai_rewrite.lock().unwrap();
        let claude_key = state.claude_api_key.lock().unwrap().clone();
        let processed = grammar::post_process(&text);

        let final_text = if ai_enabled && !claude_key.is_empty() {
            grammar::rewrite(&processed, &claude_key)
                .await
                .unwrap_or_else(|_| local_grammar::fix_grammar(&processed))
        } else {
            local_grammar::fix_grammar(&processed)
        };

        keyboard::type_text(&final_text)
            .map_err(|e| format!("Typing failed: {}", e))?;

        update_tray(&app, false);
        Ok(final_text)
    } else {
        // Start recording — check we have either local model or API key
        let use_local = *state.use_local_whisper.lock().unwrap();
        let api_key = state.whisper_api_key.lock().unwrap().clone();

        if !use_local && api_key.is_empty() {
            return Err("No API key set. Open Settings to add your key, or enable Local Whisper.".to_string());
        }

        *recording = true;
        drop(recording);

        audio::start_recording().map_err(|e| format!("Mic error: {}", e))?;
        update_tray(&app, true);
        Ok("Recording started".to_string())
    }
}

#[tauri::command]
fn set_api_key(app: AppHandle, key: String) {
    app.state::<Arc<AppState>>().whisper_api_key.lock().unwrap().clone_from(&key);
}

#[tauri::command]
fn set_claude_key(app: AppHandle, key: String) {
    app.state::<Arc<AppState>>().claude_api_key.lock().unwrap().clone_from(&key);
}

#[tauri::command]
fn set_language(app: AppHandle, lang: String) {
    app.state::<Arc<AppState>>().language.lock().unwrap().clone_from(&lang);
}

#[tauri::command]
fn set_ai_rewrite(app: AppHandle, enabled: bool) {
    *app.state::<Arc<AppState>>().ai_rewrite.lock().unwrap() = enabled;
}

#[tauri::command]
fn set_use_local_whisper(app: AppHandle, enabled: bool) {
    *app.state::<Arc<AppState>>().use_local_whisper.lock().unwrap() = enabled;
}

#[tauri::command]
fn set_local_model(app: AppHandle, model: String) {
    app.state::<Arc<AppState>>().local_model.lock().unwrap().clone_from(&model);
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
        .manage(state)
        .setup(|app| {
            // Build tray menu (Tauri 2.0 API)
            let toggle_item = MenuItem::with_id(app, "toggle", "Start Recording", true, None::<&str>)?;
            let settings_item = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit 48co", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&toggle_item, &settings_item, &quit_item])?;

            let _tray = TrayIconBuilder::with_id("main")
                .tooltip("48co — Ready")
                .menu(&menu)
                .on_menu_event(move |app, event| {
                    match event.id.as_ref() {
                        "toggle" => {
                            let handle = app.clone();
                            tauri::async_runtime::spawn(async move {
                                match toggle_recording(handle).await {
                                    Ok(msg) => println!("[48co] {}", msg),
                                    Err(e) => eprintln!("[48co] Error: {}", e),
                                }
                            });
                        }
                        "settings" => {
                            if let Some(window) = app.get_webview_window("settings") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        "quit" => { app.exit(0); }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let tauri::tray::TrayIconEvent::Click { .. } = event {
                        let handle = tray.app_handle().clone();
                        tauri::async_runtime::spawn(async move {
                            match toggle_recording(handle).await {
                                Ok(msg) => println!("[48co] {}", msg),
                                Err(e) => eprintln!("[48co] Error: {}", e),
                            }
                        });
                    }
                })
                .build(app)?;

            // Register global shortcut
            use tauri_plugin_global_shortcut::ShortcutState;
            let app_handle = app.handle().clone();
            app.global_shortcut().on_shortcut("CmdOrCtrl+Shift+Space", move |_app, _shortcut, event| {
                if event.state == ShortcutState::Pressed {
                    let h = app_handle.clone();
                    tauri::async_runtime::spawn(async move {
                        match toggle_recording(h).await {
                            Ok(msg) => println!("[48co] {}", msg),
                            Err(e) => eprintln!("[48co] Error: {}", e),
                        }
                    });
                }
            })?;

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
