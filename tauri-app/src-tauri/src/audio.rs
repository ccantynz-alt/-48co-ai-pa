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
        |err| eprintln!("[AlecRae Voice] Audio error: {}", err),
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

// pub(crate) so tests can exercise this without exposing it publicly
pub(crate) fn encode_wav(samples: &[f32], sample_rate: u32) -> Vec<u8> {
    let mut cursor = std::io::Cursor::new(Vec::new());

    let spec = hound::WavSpec {
        channels: 1,
        sample_rate,
        bits_per_sample: 16,
        sample_format: hound::SampleFormat::Int,
    };

    // Use if-let to handle errors gracefully instead of panicking
    if let Ok(mut writer) = hound::WavWriter::new(&mut cursor, spec) {
        for &sample in samples {
            let amplitude = (sample * 32767.0).clamp(-32768.0, 32767.0) as i16;
            if writer.write_sample(amplitude).is_err() {
                break;
            }
        }
        let _ = writer.finalize();
    }

    cursor.into_inner()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encode_wav_produces_valid_header() {
        let samples = vec![0.0f32; 16000]; // 1 second of silence
        let wav = encode_wav(&samples, 16000);

        // WAV files start with "RIFF"
        assert_eq!(&wav[0..4], b"RIFF");
        // Followed by file size - 8, then "WAVE"
        assert_eq!(&wav[8..12], b"WAVE");
    }

    #[test]
    fn test_encode_wav_correct_sample_rate() {
        let samples = vec![0.0f32; 100];
        let wav = encode_wav(&samples, 16000);

        // Sample rate is at bytes 24-27 (little-endian)
        let rate = u32::from_le_bytes([wav[24], wav[25], wav[26], wav[27]]);
        assert_eq!(rate, 16000);
    }

    #[test]
    fn test_encode_wav_mono_channel() {
        let samples = vec![0.0f32; 100];
        let wav = encode_wav(&samples, 16000);

        // Number of channels is at bytes 22-23 (little-endian)
        let channels = u16::from_le_bytes([wav[22], wav[23]]);
        assert_eq!(channels, 1);
    }

    #[test]
    fn test_encode_wav_16bit() {
        let samples = vec![0.0f32; 100];
        let wav = encode_wav(&samples, 16000);

        // Bits per sample is at bytes 34-35 (little-endian)
        let bits = u16::from_le_bytes([wav[34], wav[35]]);
        assert_eq!(bits, 16);
    }

    #[test]
    fn test_encode_wav_correct_data_size() {
        let num_samples = 500;
        let samples = vec![0.0f32; num_samples];
        let wav = encode_wav(&samples, 16000);

        // Data chunk size = num_samples * 2 bytes (16-bit samples)
        // "data" marker at offset 36, size at 40
        assert_eq!(&wav[36..40], b"data");
        let data_size = u32::from_le_bytes([wav[40], wav[41], wav[42], wav[43]]);
        assert_eq!(data_size, (num_samples * 2) as u32);
    }

    #[test]
    fn test_encode_wav_sample_clamping() {
        // Values > 1.0 should be clamped to i16::MAX (32767)
        let samples = vec![2.0f32, -2.0f32, 0.5f32];
        let wav = encode_wav(&samples, 16000);

        // Data starts at offset 44 for standard WAV
        let s1 = i16::from_le_bytes([wav[44], wav[45]]);
        let s2 = i16::from_le_bytes([wav[46], wav[47]]);
        let s3 = i16::from_le_bytes([wav[48], wav[49]]);

        assert_eq!(s1, 32767);   // clamped max
        assert_eq!(s2, -32768);  // clamped min
        assert_eq!(s3, 16383);   // 0.5 * 32767 ≈ 16383
    }

    #[test]
    fn test_encode_wav_empty_input() {
        let samples: Vec<f32> = vec![];
        let wav = encode_wav(&samples, 16000);

        // Should still produce a valid WAV header (44 bytes for PCM)
        assert!(wav.len() >= 44);
        assert_eq!(&wav[0..4], b"RIFF");
    }

    #[test]
    fn test_encode_wav_silence() {
        let samples = vec![0.0f32; 1000];
        let wav = encode_wav(&samples, 16000);

        // All data samples should be 0
        for i in (44..wav.len()).step_by(2) {
            let sample = i16::from_le_bytes([wav[i], wav[i + 1]]);
            assert_eq!(sample, 0, "Expected silence at byte offset {}", i);
        }
    }
}
