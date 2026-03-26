// Keyboard simulation using enigo
// Types text into whatever application is currently focused
// Works on Windows, Mac, Linux — no nut-tree, no Node.js, no native compilation issues

use enigo::{Enigo, Keyboard, Settings};

pub fn type_text(text: &str) -> Result<(), String> {
    let mut enigo = Enigo::new(&Settings::default())
        .map_err(|e| format!("Keyboard init failed: {}", e))?;

    // Use clipboard paste for speed and reliability (same approach as WhisperTyping)
    // 1. Save current clipboard
    // 2. Set clipboard to our text
    // 3. Simulate Ctrl+V / Cmd+V
    // 4. Restore clipboard

    // For now, use direct text entry which works across all platforms
    enigo.text(text)
        .map_err(|e| format!("Typing failed: {}", e))?;

    Ok(())
}
