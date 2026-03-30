// Local on-device transcription using whisper.cpp (via whisper-rs)
//
// No API key needed. No internet needed. No cost per use.
// Runs the Whisper model directly on the user's CPU/GPU.
//
// Model files are downloaded once and stored in the app data directory:
//   Windows: %APPDATA%/alecrae-voice/models/
//   macOS:   ~/Library/Application Support/alecrae-voice/models/
//   Linux:   ~/.local/share/alecrae-voice/models/

use std::path::PathBuf;

/// Get the models directory
pub fn models_dir() -> PathBuf {
    let base = dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("alecrae-voice")
        .join("models");
    std::fs::create_dir_all(&base).ok();
    base
}

/// Check if a model is downloaded
pub fn model_exists(model_name: &str) -> bool {
    models_dir().join(model_name).exists()
}

/// Get the path to a model file
pub fn model_path(model_name: &str) -> PathBuf {
    models_dir().join(model_name)
}

/// Download a Whisper model from Hugging Face
/// Models available:
///   - ggml-tiny.bin     (~75MB, fastest, least accurate)
///   - ggml-base.bin     (~142MB, good balance)
///   - ggml-small.bin    (~466MB, good accuracy)
///   - ggml-medium.bin   (~1.5GB, very good accuracy)
///   - ggml-large-v3.bin (~3GB, best accuracy)
///   - ggml-large-v3-turbo.bin (~1.6GB, fast + accurate — RECOMMENDED)
pub async fn download_model(model_name: &str) -> Result<PathBuf, String> {
    let path = model_path(model_name);
    if path.exists() {
        return Ok(path);
    }

    let url = format!(
        "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/{}",
        model_name
    );

    println!("[AlecRae Voice] Downloading model: {} ...", model_name);

    let client = reqwest::Client::new();
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Download failed: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("Download failed: HTTP {}", response.status()));
    }

    let bytes = response
        .bytes()
        .await
        .map_err(|e| format!("Download read failed: {}", e))?;

    std::fs::write(&path, &bytes)
        .map_err(|e| format!("Save failed: {}", e))?;

    println!("[AlecRae Voice] Model saved: {:?} ({:.1}MB)", path, bytes.len() as f64 / 1_048_576.0);

    Ok(path)
}

/// Transcribe audio using local Whisper model
/// Takes WAV audio data (16kHz mono) and returns text
pub fn transcribe_local(audio_wav: &[u8], model_path: &str, language: &str) -> Result<String, String> {
    use whisper_rs::{WhisperContext, WhisperContextParameters, FullParams, SamplingStrategy};

    if audio_wav.is_empty() {
        return Ok(String::new());
    }

    // Load the model
    let ctx = WhisperContext::new_with_params(
        model_path,
        WhisperContextParameters::default(),
    ).map_err(|e| format!("Model load failed: {}", e))?;

    // Decode WAV to f32 samples
    let samples = decode_wav_to_f32(audio_wav)?;

    if samples.is_empty() {
        return Ok(String::new());
    }

    // Set up transcription parameters
    let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });
    params.set_language(Some(language));
    params.set_print_special(false);
    params.set_print_progress(false);
    params.set_print_realtime(false);
    params.set_print_timestamps(false);
    params.set_suppress_blank(true);
    params.set_single_segment(false);

    // Run transcription
    let mut state = ctx.create_state()
        .map_err(|e| format!("State creation failed: {}", e))?;

    state.full(params, &samples)
        .map_err(|e| format!("Transcription failed: {}", e))?;

    // Collect results
    let num_segments = state.full_n_segments()
        .map_err(|e| format!("Segment count failed: {}", e))?;

    let mut text = String::new();
    for i in 0..num_segments {
        if let Ok(segment) = state.full_get_segment_text(i) {
            text.push_str(&segment);
        }
    }

    Ok(text.trim().to_string())
}

/// Decode WAV bytes to f32 samples (16kHz mono expected by Whisper)
fn decode_wav_to_f32(wav_data: &[u8]) -> Result<Vec<f32>, String> {
    let cursor = std::io::Cursor::new(wav_data);
    let reader = hound::WavReader::new(cursor)
        .map_err(|e| format!("WAV decode failed: {}", e))?;

    let spec = reader.spec();
    let samples: Vec<f32> = match spec.sample_format {
        hound::SampleFormat::Int => {
            let max = (1 << (spec.bits_per_sample - 1)) as f32;
            reader.into_samples::<i32>()
                .filter_map(|s| s.ok())
                .map(|s| s as f32 / max)
                .collect()
        }
        hound::SampleFormat::Float => {
            reader.into_samples::<f32>()
                .filter_map(|s| s.ok())
                .collect()
        }
    };

    // If stereo, convert to mono by averaging channels
    if spec.channels == 2 {
        let mono: Vec<f32> = samples
            .chunks(2)
            .map(|chunk| (chunk[0] + chunk.get(1).copied().unwrap_or(0.0)) / 2.0)
            .collect();
        Ok(mono)
    } else {
        Ok(samples)
    }
}
