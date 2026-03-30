use crate::signatures::process_names::KNOWN_BAD_PROCESSES;
use crate::threat::{Severity, Threat, ThreatAction, ThreatCategory};
use std::fs;
use std::path::PathBuf;

static SCAREWARE_DISPLAY_NAMES: &[&str] = &[
    "PC Protect", "PCProtect", "Total AV", "TotalAV", "Scanguard", "ScanGuard",
    "Segurazo", "SegurazoAV", "RAV Antivirus", "RAV Endpoint Protection",
    "ByteFence", "ByteFence Anti-Malware", "SpyHunter", "SpyHunter 5",
    "WinAntiVirus", "WinFixer", "ErrorSafe", "DriveCleaner", "System Doctor",
    "MyPCBackup", "PC Keeper", "MacKeeper",
    "Norton Security Scan Free", "McAfee Total Security Free",
    "Kaspersky Free Scan", "Windows Defender Alert",
    "Restoro", "Fortect", "Outbyte PC Repair", "Outbyte Driver Updater",
    "Reimage Repair", "Reimage PC Repair", "Smart PC Fixer", "RegClean Pro",
    "Registry Mechanic", "Registry Booster", "WinZip Driver Updater",
    "Driver Updater", "DriverUpdate", "Driver Easy", "SlimCleaner",
    "SlimCleaner Plus", "MyCleanPC", "One Click PC Care", "Speed My PC",
    "Advanced SystemCare", "Systweak", "iolo System Mechanic",
    "PC Optimizer Pro", "Xtreme Speed Booster", "Super PC Cleaner",
    "Max PC Tuner", "Win Tonic", "OneSafe PC Cleaner", "Qihoo 360 Total Security",
    "Search Protect", "Conduit Search", "Ask Toolbar", "Babylon Toolbar",
    "Delta Toolbar", "MindSpark", "MyWebSearch", "SweetIM", "Snap.do",
    "Trovi", "SafeFinder",
];

pub fn scan() -> Vec<Threat> {
    let mut threats = Vec::new();
    scan_program_dirs(&mut threats);
    #[cfg(windows)] scan_installed_programs_registry(&mut threats);
    #[cfg(windows)] scan_scheduled_tasks(&mut threats);
    threats
}

fn scan_program_dirs(threats: &mut Vec<Threat>) {
    let program_dirs = get_program_directories();
    for dir in &program_dirs {
        if !dir.exists() { continue; }
        let entries = match fs::read_dir(dir) { Ok(e) => e, Err(_) => continue };
        for entry in entries.flatten() {
            if !entry.path().is_dir() { continue; }
            let folder_name = entry.file_name().to_string_lossy().to_string();
            let folder_lower = folder_name.to_lowercase();
            for scareware_name in SCAREWARE_DISPLAY_NAMES {
                if folder_lower.contains(&scareware_name.to_lowercase()) {
                    threats.push(Threat {
                        name: format!("Scareware installed: {}", folder_name),
                        severity: Severity::High, category: ThreatCategory::Scareware,
                        location: entry.path().to_string_lossy().to_string(),
                        description: format!("Program folder '{}' matches known scareware '{}'. These programs often show fake scan results to trick you into paying.", folder_name, scareware_name),
                        action: ThreatAction::QuarantineFile(entry.path().to_string_lossy().to_string()),
                    });
                    break;
                }
            }
            for bad_name in KNOWN_BAD_PROCESSES {
                if folder_lower.contains(bad_name) {
                    let already_flagged = threats.iter().any(|t| t.location == entry.path().to_string_lossy());
                    if !already_flagged {
                        threats.push(Threat {
                            name: format!("Suspicious program: {}", folder_name),
                            severity: Severity::High, category: ThreatCategory::PotentiallyUnwanted,
                            location: entry.path().to_string_lossy().to_string(),
                            description: format!("Program folder '{}' matches known threat signature '{}'", folder_name, bad_name),
                            action: ThreatAction::ManualReview,
                        });
                        break;
                    }
                }
            }
        }
    }
}

#[cfg(windows)]
fn scan_installed_programs_registry(threats: &mut Vec<Threat>) {
    use winreg::enums::*;
    use winreg::RegKey;
    let uninstall_paths = [
        (HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"),
        (HKEY_LOCAL_MACHINE, r"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"),
        (HKEY_CURRENT_USER, r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall"),
    ];
    for (hive_key, path) in &uninstall_paths {
        let hive = RegKey::predef(*hive_key);
        let key = match hive.open_subkey(path) { Ok(k) => k, Err(_) => continue };
        for subkey_name in key.enum_keys().flatten() {
            let subkey = match key.open_subkey(&subkey_name) { Ok(k) => k, Err(_) => continue };
            let display_name: String = subkey.get_value("DisplayName").unwrap_or_default();
            if display_name.is_empty() { continue; }
            let display_lower = display_name.to_lowercase();
            for scareware_name in SCAREWARE_DISPLAY_NAMES {
                if display_lower.contains(&scareware_name.to_lowercase()) {
                    let install_location: String = subkey.get_value("InstallLocation").unwrap_or_default();
                    let uninstall_string: String = subkey.get_value("UninstallString").unwrap_or_default();
                    threats.push(Threat {
                        name: format!("Installed scareware: {}", display_name),
                        severity: Severity::High, category: ThreatCategory::Scareware,
                        location: if install_location.is_empty() { format!("Registry: {}\\{}", path, subkey_name) } else { install_location },
                        description: format!("Installed program '{}' matches known scareware '{}'. Uninstall command: {}", display_name, scareware_name, if uninstall_string.is_empty() { "Not available".to_string() } else { uninstall_string }),
                        action: ThreatAction::ManualReview,
                    });
                    break;
                }
            }
        }
    }
}

#[cfg(windows)]
fn scan_scheduled_tasks(threats: &mut Vec<Threat>) {
    let output = match std::process::Command::new("schtasks").args(["/query", "/fo", "CSV", "/v"]).output() { Ok(o) => o, Err(_) => return };
    let stdout = String::from_utf8_lossy(&output.stdout);
    for line in stdout.lines().skip(1) {
        let lower = line.to_lowercase();
        for bad_name in KNOWN_BAD_PROCESSES {
            if lower.contains(bad_name) {
                threats.push(Threat {
                    name: format!("Suspicious scheduled task matching '{}'", bad_name),
                    severity: Severity::High, category: ThreatCategory::SuspiciousStartup,
                    location: "Windows Task Scheduler".to_string(),
                    description: format!("Scheduled task matches known threat '{}'. Task details: {}", bad_name, line.chars().take(200).collect::<String>()),
                    action: ThreatAction::ManualReview,
                });
                break;
            }
        }
        for scareware_name in SCAREWARE_DISPLAY_NAMES {
            if lower.contains(&scareware_name.to_lowercase()) {
                let already = threats.iter().any(|t| t.location == "Windows Task Scheduler" && t.description.contains(scareware_name));
                if !already {
                    threats.push(Threat {
                        name: format!("Scareware scheduled task: {}", scareware_name),
                        severity: Severity::High, category: ThreatCategory::Scareware,
                        location: "Windows Task Scheduler".to_string(),
                        description: format!("Scheduled task for known scareware '{}' found. This keeps the scareware running.", scareware_name),
                        action: ThreatAction::ManualReview,
                    });
                }
                break;
            }
        }
    }
}

fn get_program_directories() -> Vec<PathBuf> {
    let mut dirs = Vec::new();
    if cfg!(windows) {
        dirs.push(PathBuf::from(r"C:\Program Files"));
        dirs.push(PathBuf::from(r"C:\Program Files (x86)"));
        if let Some(local) = dirs::data_local_dir() { dirs.push(local.join("Programs")); }
    } else {
        dirs.push(PathBuf::from("/usr/local/bin"));
        dirs.push(PathBuf::from("/opt"));
    }
    dirs
}
