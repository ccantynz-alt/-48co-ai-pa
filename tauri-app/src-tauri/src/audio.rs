// Audio capture using cpal (Cross-Platform Audio Library)
// Records from the default microphone, outputs WAV bytes for Whisper API

use std::sync::{Arc, Mutex, atomic::{AtomicBool, Ordering}};
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};

static RECORDING: AtomicBool = AtomicBool::new(false);
static AUDIO_BUFFER: once_cell::sync::Lazy<Arc<Mutex<Vec<f32>>>> =
    once_cell::sync::Lazy::new(|| Arc::new(Mutex::new(Vec::new())));

pub fn start_recording() -> Result<(), String> {
    let host = cpal::default_host();
    let device = host.default_input_device()
        .ok_or("No microphone found. Check your audio settings.")?;

    let config = cpal::StreamConfig {
        channels: 1,
        sample_rate: cpal::SampleRate(16000), // Whisper expects 16kHz
        buffer_size: cpal::BufferSize::Default,
    };

    // Clear previous recording
    AUDIO_BUFFER.lock().unwrap().clear();
    RECORDING.store(true, Ordering::Relaxed);

    let buffer = AUDIO_BUFFER.clone();

    let stream = device.build_input_stream(
        &config,
        move |data: &[f32], _: &cpal::InputCallbackInfo| {
            if RECORDING.load(Ordering::Relaxed) {
                buffer.lock().unwrap().extend_from_slice(data);
            }
        },
        |err| eprintln!("[48co] Audio error: {}", err),
        None,
    ).map_err(|e| format!("Mic stream failed: {}", e))?;

    stream.play().map_err(|e| format!("Mic play failed: {}", e))?;

    // Keep stream alive in a background thread
    std::thread::spawn(move || {
        while RECORDING.load(Ordering::Relaxed) {
            std::thread::sleep(std::time::Duration::from_millis(100));
        }
        drop(stream);
    });

    Ok(())
}

pub fn stop_recording() -> Vec<u8> {
    RECORDING.store(false, Ordering::Relaxed);

    // Give the stream a moment to finish
    std::thread::sleep(std::time::Duration::from_millis(200));

    let samples = AUDIO_BUFFER.lock().unwrap().clone();

    if samples.is_empty() {
        return Vec::new();
    }

    // Encode as WAV (Whisper API accepts WAV)
    encode_wav(&samples, 16000)
}

fn encode_wav(samples: &[f32], sample_rate: u32) -> Vec<u8> {
    let mut cursor = std::io::Cursor::new(Vec::new());

    let spec = hound::WavSpec {
        channels: 1,
        sample_rate,
        bits_per_sample: 16,
        sample_format: hound::SampleFormat::Int,
    };

    let mut writer = hound::WavWriter::new(&mut cursor, spec).unwrap();
    for &sample in samples {
        let amplitude = (sample * 32767.0).clamp(-32768.0, 32767.0) as i16;
        writer.write_sample(amplitude).unwrap();
    }
    writer.finalize().unwrap();

    cursor.into_inner()
}
