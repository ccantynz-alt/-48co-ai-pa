use crate::signatures::extension_ids::{KNOWN_BAD_EXTENSIONS, SUSPICIOUS_PERMISSIONS, SUSPICIOUS_PERMISSION_THRESHOLD};
use crate::threat::{Severity, Threat, ThreatAction, ThreatCategory};
use std::fs;
use std::path::{Path, PathBuf};

pub fn scan() -> Vec<Threat> {
    let mut threats = Vec::new();
    for profile_dir in get_chrome_extension_dirs() { scan_chromium_extensions(&profile_dir, "Chrome", &mut threats); }
    for profile_dir in get_edge_extension_dirs() { scan_chromium_extensions(&profile_dir, "Edge", &mut threats); }
    for profile_dir in get_firefox_extension_dirs() { scan_firefox_extensions(&profile_dir, &mut threats); }
    threats
}

fn scan_chromium_extensions(extensions_dir: &Path, browser: &str, threats: &mut Vec<Threat>) {
    if !extensions_dir.exists() { return; }
    let entries = match fs::read_dir(extensions_dir) { Ok(e) => e, Err(_) => return };
    for entry in entries.flatten() {
        if !entry.path().is_dir() { continue; }
        let ext_id = entry.file_name().to_string_lossy().to_string();
        for (bad_id, name, reason) in KNOWN_BAD_EXTENSIONS {
            if ext_id == *bad_id {
                threats.push(Threat {
                    name: format!("{}: {}", browser, name),
                    severity: Severity::Critical,
                    category: ThreatCategory::BrowserHijacker,
                    location: entry.path().to_string_lossy().to_string(),
                    description: format!("Known malicious {} extension '{}' (ID: {}). Reason: {}", browser, name, ext_id, reason),
                    action: ThreatAction::QuarantineFile(entry.path().to_string_lossy().to_string()),
                });
                break;
            }
        }
        if let Some(manifest) = find_manifest(&entry.path()) {
            check_extension_permissions(&manifest, &ext_id, browser, &entry.path(), threats);
        }
    }
}

fn find_manifest(ext_dir: &Path) -> Option<serde_json::Value> {
    let entries: Vec<_> = fs::read_dir(ext_dir).ok()?.flatten().collect();
    let direct = ext_dir.join("manifest.json");
    if direct.exists() {
        let content = fs::read_to_string(&direct).ok()?;
        return serde_json::from_str(&content).ok();
    }
    for entry in entries.iter().rev() {
        let manifest_path = entry.path().join("manifest.json");
        if manifest_path.exists() {
            let content = fs::read_to_string(&manifest_path).ok()?;
            return serde_json::from_str(&content).ok();
        }
    }
    None
}

fn check_extension_permissions(manifest: &serde_json::Value, ext_id: &str, browser: &str, ext_path: &Path, threats: &mut Vec<Threat>) {
    let ext_name = manifest.get("name").and_then(|n| n.as_str()).unwrap_or("Unknown Extension");
    let mut all_permissions = Vec::new();
    for key in &["permissions", "optional_permissions", "host_permissions"] {
        if let Some(perms) = manifest.get(*key).and_then(|p| p.as_array()) {
            for p in perms { if let Some(s) = p.as_str() { all_permissions.push(s.to_string()); } }
        }
    }
    let suspicious_count = all_permissions.iter().filter(|p| SUSPICIOUS_PERMISSIONS.iter().any(|sp| p.to_lowercase().contains(&sp.to_lowercase()))).count();
    if suspicious_count >= SUSPICIOUS_PERMISSION_THRESHOLD {
        let already_flagged = threats.iter().any(|t| t.location == ext_path.to_string_lossy());
        if !already_flagged {
            let perm_list: Vec<&str> = all_permissions.iter().filter(|p| SUSPICIOUS_PERMISSIONS.iter().any(|sp| p.to_lowercase().contains(&sp.to_lowercase()))).map(|s| s.as_str()).collect();
            threats.push(Threat {
                name: format!("{}: Excessive permissions \u{2014} {}", browser, ext_name),
                severity: Severity::High,
                category: ThreatCategory::PotentiallyUnwanted,
                location: ext_path.to_string_lossy().to_string(),
                description: format!("Extension '{}' (ID: {}) requests {} suspicious permissions: {}", ext_name, ext_id, suspicious_count, perm_list.join(", ")),
                action: ThreatAction::ManualReview,
            });
        }
    }
}

fn scan_firefox_extensions(profile_dir: &Path, threats: &mut Vec<Threat>) {
    let extensions_dir = profile_dir.join("extensions");
    if !extensions_dir.exists() { return; }
    let entries = match fs::read_dir(&extensions_dir) { Ok(e) => e, Err(_) => return };
    for entry in entries.flatten() {
        let file_name = entry.file_name().to_string_lossy().to_string();
        for (bad_id, name, reason) in KNOWN_BAD_EXTENSIONS {
            if file_name.contains(bad_id) {
                threats.push(Threat {
                    name: format!("Firefox: {}", name),
                    severity: Severity::Critical,
                    category: ThreatCategory::BrowserHijacker,
                    location: entry.path().to_string_lossy().to_string(),
                    description: format!("Known malicious Firefox extension '{}'. Reason: {}", name, reason),
                    action: ThreatAction::QuarantineFile(entry.path().to_string_lossy().to_string()),
                });
                break;
            }
        }
    }
}

fn get_chrome_extension_dirs() -> Vec<PathBuf> {
    let mut dirs = Vec::new();
    if let Some(local) = dirs::data_local_dir() {
        let base = local.join("Google").join("Chrome").join("User Data");
        dirs.push(base.join("Default").join("Extensions"));
        if let Ok(entries) = fs::read_dir(&base) {
            for entry in entries.flatten() {
                let name = entry.file_name().to_string_lossy().to_string();
                if name.starts_with("Profile ") { dirs.push(entry.path().join("Extensions")); }
            }
        }
    }
    dirs
}

fn get_edge_extension_dirs() -> Vec<PathBuf> {
    let mut dirs = Vec::new();
    if let Some(local) = dirs::data_local_dir() {
        let base = local.join("Microsoft").join("Edge").join("User Data");
        dirs.push(base.join("Default").join("Extensions"));
        if let Ok(entries) = fs::read_dir(&base) {
            for entry in entries.flatten() {
                let name = entry.file_name().to_string_lossy().to_string();
                if name.starts_with("Profile ") { dirs.push(entry.path().join("Extensions")); }
            }
        }
    }
    dirs
}

fn get_firefox_extension_dirs() -> Vec<PathBuf> {
    let mut dirs = Vec::new();
    if let Some(roaming) = dirs::config_dir() {
        let profiles_dir = roaming.join("Mozilla").join("Firefox").join("Profiles");
        if let Ok(entries) = fs::read_dir(&profiles_dir) {
            for entry in entries.flatten() { if entry.path().is_dir() { dirs.push(entry.path()); } }
        }
    }
    dirs
}
