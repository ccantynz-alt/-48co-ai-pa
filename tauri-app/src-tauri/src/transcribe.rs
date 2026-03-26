// Whisper API transcription
// Sends recorded audio to OpenAI's Whisper API and returns text

use reqwest::multipart;

pub async fn whisper_api(audio_wav: &[u8], api_key: &str, language: &str) -> Result<String, String> {
    if audio_wav.is_empty() {
        return Ok(String::new());
    }

    let client = reqwest::Client::new();

    let part = multipart::Part::bytes(audio_wav.to_vec())
        .file_name("recording.wav")
        .mime_str("audio/wav")
        .unwrap();

    let form = multipart::Form::new()
        .part("file", part)
        .text("model", "whisper-1")
        .text("language", language.split('-').next().unwrap_or("en").to_string())
        .text("response_format", "json");

    let response = client
        .post("https://api.openai.com/v1/audio/transcriptions")
        .header("Authorization", format!("Bearer {}", api_key))
        .multipart(form)
        .timeout(std::time::Duration::from_secs(30))
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();

        return match status.as_u16() {
            401 => Err("Invalid API key. Check your OpenAI key in Settings.".to_string()),
            429 => Err("Rate limited. Wait a moment and try again.".to_string()),
            _ => Err(format!("Whisper API error ({}): {}", status, body)),
        };
    }

    let data: serde_json::Value = response.json().await
        .map_err(|e| format!("Response parse error: {}", e))?;

    Ok(data["text"].as_str().unwrap_or("").to_string())
}
