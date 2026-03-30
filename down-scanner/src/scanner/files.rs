use crate::signatures::hashes::KNOWN_MALWARE_HASHES;
use crate::threat::{Severity, Threat, ThreatAction, ThreatCategory};
use sha2::{Digest, Sha256};
use std::fs;
use std::io::Read;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

const MAX_HASH_SIZE: u64 = 50 * 1024 * 1024;
const MAX_SCAN_DEPTH: usize = 5;

const DOUBLE_EXTENSIONS: &[(&str, &str)] = &[
    (".pdf.exe", "PDF disguised as executable"),
    (".doc.exe", "Word doc disguised as executable"),
    (".docx.exe", "Word doc disguised as executable"),
    (".xls.exe", "Excel disguised as executable"),
    (".xlsx.exe", "Excel disguised as executable"),
    (".jpg.exe", "Image disguised as executable"),
    (".jpeg.exe", "Image disguised as executable"),
    (".png.exe", "Image disguised as executable"),
    (".gif.exe", "Image disguised as executable"),
    (".mp3.exe", "Audio disguised as executable"),
    (".mp4.exe", "Video disguised as executable"),
    (".txt.exe", "Text file disguised as executable"),
    (".pdf.scr", "PDF disguised as screensaver"),
    (".doc.scr", "Word doc disguised as screensaver"),
    (".jpg.scr", "Image disguised as screensaver"),
    (".pdf.bat", "PDF disguised as batch file"),
    (".doc.bat", "Word doc disguised as batch file"),
    (".pdf.cmd", "PDF disguised as command file"),
    (".pdf.vbs", "PDF disguised as VBScript"),
    (".doc.vbs", "Word doc disguised as VBScript"),
    (".pdf.js", "PDF disguised as JavaScript"),
    (".pdf.ps1", "PDF disguised as PowerShell"),
];

const EXECUTABLE_EXTENSIONS: &[&str] = &[
    ".exe", ".scr", ".bat", ".cmd", ".vbs", ".vbe", ".js", ".jse",
    ".wsf", ".wsh", ".ps1", ".msi", ".dll", ".com", ".pif",
];

pub fn scan() -> Vec<Threat> {
    let mut threats = Vec::new();
    let scan_dirs = get_scan_directories();
    for dir in &scan_dirs {
        if !dir.exists() { continue; }
        scan_directory(dir, &mut threats);
    }
    threats
}

fn scan_directory(dir: &Path, threats: &mut Vec<Threat>) {
    let walker = WalkDir::new(dir).max_depth(MAX_SCAN_DEPTH).follow_links(false).into_iter().filter_map(|e| e.ok());
    for entry in walker {
        let path = entry.path();
        if path.is_dir() { continue; }
        let file_name = path.file_name().map(|n| n.to_string_lossy().to_string()).unwrap_or_default();
        let file_name_lower = file_name.to_lowercase();
        let path_str = path.to_string_lossy().to_string();

        for (double_ext, description) in DOUBLE_EXTENSIONS {
            if file_name_lower.ends_with(double_ext) {
                threats.push(Threat {
                    name: format!("Double extension: {}", file_name),
                    severity: Severity::Critical,
                    category: ThreatCategory::Malware,
                    location: path_str.clone(),
                    description: format!("File '{}' has a deceptive double extension \u{2014} {}. This is a common malware technique.", file_name, description),
                    action: ThreatAction::QuarantineFile(path_str.clone()),
                });
                break;
            }
        }

        let is_executable = EXECUTABLE_EXTENSIONS.iter().any(|ext| file_name_lower.ends_with(ext));
        let in_temp = path_str.to_lowercase().contains("\\temp\\") || path_str.to_lowercase().contains("/tmp/");

        if is_executable && in_temp {
            if let Some(hash) = hash_file(path) {
                for (known_hash, malware_name) in KNOWN_MALWARE_HASHES {
                    if hash == *known_hash {
                        threats.push(Threat {
                            name: format!("Known malware: {}", malware_name),
                            severity: Severity::Critical,
                            category: ThreatCategory::Malware,
                            location: path_str.clone(),
                            description: format!("File '{}' matches known malware hash for '{}'. SHA256: {}", file_name, malware_name, hash),
                            action: ThreatAction::QuarantineFile(path_str.clone()),
                        });
                        break;
                    }
                }
            }
        }

        if is_executable && !in_standard_program_location(&path_str) {
            if let Ok(metadata) = fs::metadata(path) {
                if let Ok(modified) = metadata.modified() {
                    if let Ok(age) = std::time::SystemTime::now().duration_since(modified) {
                        if age.as_secs() < 86400 {
                            let already_flagged = threats.iter().any(|t| t.location == path_str);
                            if !already_flagged {
                                threats.push(Threat {
                                    name: format!("Recently modified executable: {}", file_name),
                                    severity: Severity::Medium,
                                    category: ThreatCategory::SuspiciousFile,
                                    location: path_str.clone(),
                                    description: format!("Executable '{}' was modified in the last 24 hours and is in a non-standard location.", file_name),
                                    action: ThreatAction::ManualReview,
                                });
                            }
                        }
                    }
                }
            }
        }
    }
}

fn hash_file(path: &Path) -> Option<String> {
    let metadata = fs::metadata(path).ok()?;
    if metadata.len() > MAX_HASH_SIZE { return None; }
    let mut file = fs::File::open(path).ok()?;
    let mut hasher = Sha256::new();
    let mut buffer = [0u8; 8192];
    loop {
        let bytes_read = file.read(&mut buffer).ok()?;
        if bytes_read == 0 { break; }
        hasher.update(&buffer[..bytes_read]);
    }
    Some(format!("{:x}", hasher.finalize()))
}

fn in_standard_program_location(path: &str) -> bool {
    let p = path.to_lowercase();
    p.contains("\\program files\\") || p.contains("\\program files (x86)\\") || p.contains("\\windows\\") || p.contains("\\system32\\") || p.contains("\\syswow64\\") || p.contains("/usr/") || p.contains("/bin/") || p.contains("/sbin/")
}

fn get_scan_directories() -> Vec<PathBuf> {
    let mut dirs = Vec::new();
    if let Some(download) = dirs::download_dir() { dirs.push(download); }
    if let Some(desktop) = dirs::desktop_dir() { dirs.push(desktop); }
    dirs.push(std::env::temp_dir());
    if cfg!(windows) {
        if let Some(local) = dirs::data_local_dir() { dirs.push(local.join("Temp")); }
        if let Some(roaming) = dirs::config_dir() { dirs.push(roaming); }
        dirs.push(PathBuf::from(r"C:\Users\Public"));
    }
    dirs
}
