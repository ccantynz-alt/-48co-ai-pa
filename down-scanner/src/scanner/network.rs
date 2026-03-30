use crate::signatures::ip_blocklist::{KNOWN_BAD_DOMAINS, KNOWN_BAD_DNS, KNOWN_BAD_IP_PREFIXES, LEGITIMATE_HOSTS_ENTRIES};
use crate::threat::{Severity, Threat, ThreatAction, ThreatCategory};
use std::fs;
use std::path::Path;

pub fn scan() -> Vec<Threat> {
    let mut threats = Vec::new();
    check_hosts_file(&mut threats);
    #[cfg(windows)] check_network_connections(&mut threats);
    #[cfg(windows)] check_dns_settings(&mut threats);
    #[cfg(not(windows))] check_resolv_conf(&mut threats);
    threats
}

fn check_hosts_file(threats: &mut Vec<Threat>) {
    let hosts_path = if cfg!(windows) { Path::new(r"C:\Windows\System32\drivers\etc\hosts") } else { Path::new("/etc/hosts") };
    let content = match fs::read_to_string(hosts_path) { Ok(c) => c, Err(_) => return };
    let mut suspicious_entries = Vec::new();
    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') { continue; }
        let parts: Vec<&str> = trimmed.split_whitespace().collect();
        if parts.len() < 2 { continue; }
        let ip = parts[0];
        let hostnames: Vec<&str> = parts[1..].to_vec();
        for hostname in &hostnames {
            let is_legitimate = LEGITIMATE_HOSTS_ENTRIES.iter().any(|legit| hostname.eq_ignore_ascii_case(legit));
            if !is_legitimate {
                let is_redirect = ip != "127.0.0.1" && ip != "::1" && ip != "0.0.0.0";
                let is_blocking = ip == "127.0.0.1" || ip == "0.0.0.0";
                if is_redirect {
                    suspicious_entries.push(format!("{} -> {} (REDIRECT)", hostname, ip));
                } else if is_blocking {
                    let important_domains = ["windowsupdate", "microsoft.com", "google.com", "chrome.google.com", "update.googleapis.com"];
                    if important_domains.iter().any(|d| hostname.to_lowercase().contains(d)) {
                        suspicious_entries.push(format!("{} BLOCKED by hosts file (could prevent updates)", hostname));
                    }
                }
            }
        }
        for (bad_prefix, description) in KNOWN_BAD_IP_PREFIXES {
            if ip.starts_with(bad_prefix) {
                threats.push(Threat {
                    name: "Hosts file points to malicious IP".to_string(),
                    severity: Severity::Critical, category: ThreatCategory::HostsTampering,
                    location: hosts_path.to_string_lossy().to_string(),
                    description: format!("Hosts entry '{}' redirects to suspicious IP {} \u{2014} {}", hostnames.join(", "), ip, description),
                    action: ThreatAction::ManualReview,
                });
            }
        }
        for (bad_domain, description) in KNOWN_BAD_DOMAINS {
            for hostname in &hostnames {
                if hostname.to_lowercase().contains(bad_domain) {
                    threats.push(Threat {
                        name: format!("Known bad domain in hosts: {}", hostname),
                        severity: Severity::High, category: ThreatCategory::HostsTampering,
                        location: hosts_path.to_string_lossy().to_string(),
                        description: format!("Hosts file references known malicious domain pattern '{}' \u{2014} {}", bad_domain, description),
                        action: ThreatAction::ManualReview,
                    });
                }
            }
        }
    }
    if !suspicious_entries.is_empty() {
        threats.push(Threat {
            name: "Hosts file modifications detected".to_string(),
            severity: Severity::High, category: ThreatCategory::HostsTampering,
            location: hosts_path.to_string_lossy().to_string(),
            description: format!("Found {} suspicious entries in hosts file:\n      {}", suspicious_entries.len(), suspicious_entries.join("\n      ")),
            action: ThreatAction::ManualReview,
        });
    }
}

#[cfg(windows)]
fn check_network_connections(threats: &mut Vec<Threat>) {
    let output = match std::process::Command::new("netstat").args(["-an"]).output() { Ok(o) => o, Err(_) => return };
    let stdout = String::from_utf8_lossy(&output.stdout);
    for line in stdout.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 3 { continue; }
        let remote = parts.get(2).unwrap_or(&"");
        for (bad_prefix, description) in KNOWN_BAD_IP_PREFIXES {
            if remote.starts_with(bad_prefix) {
                threats.push(Threat {
                    name: format!("Connection to suspicious IP: {}", remote),
                    severity: Severity::Critical, category: ThreatCategory::SuspiciousNetwork,
                    location: format!("Active connection: {} -> {}", parts.get(1).unwrap_or(&"?"), remote),
                    description: format!("Active network connection to known suspicious IP range \u{2014} {}", description),
                    action: ThreatAction::ManualReview,
                });
            }
        }
    }
}

#[cfg(windows)]
fn check_dns_settings(threats: &mut Vec<Threat>) {
    let output = match std::process::Command::new("ipconfig").args(["/all"]).output() { Ok(o) => o, Err(_) => return };
    let stdout = String::from_utf8_lossy(&output.stdout);
    for line in stdout.lines() {
        let trimmed = line.trim();
        if trimmed.contains("DNS Servers") || trimmed.contains("DNS-Server") {
            if let Some(ip_part) = trimmed.split(':').nth(1) {
                let ip = ip_part.trim();
                for (bad_dns, description) in KNOWN_BAD_DNS {
                    if ip.starts_with(bad_dns) {
                        threats.push(Threat {
                            name: format!("Malicious DNS server: {}", ip),
                            severity: Severity::Critical, category: ThreatCategory::DnsTampering,
                            location: "Network adapter DNS settings".to_string(),
                            description: format!("DNS server {} is known malicious \u{2014} {}. Your DNS queries may be intercepted.", ip, description),
                            action: ThreatAction::ManualReview,
                        });
                    }
                }
            }
        }
    }
}

#[cfg(not(windows))]
fn check_resolv_conf(threats: &mut Vec<Threat>) {
    let content = match fs::read_to_string("/etc/resolv.conf") { Ok(c) => c, Err(_) => return };
    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("nameserver") {
            if let Some(ip) = trimmed.split_whitespace().nth(1) {
                for (bad_dns, description) in KNOWN_BAD_DNS {
                    if ip.starts_with(bad_dns) {
                        threats.push(Threat {
                            name: format!("Malicious DNS server: {}", ip),
                            severity: Severity::Critical, category: ThreatCategory::DnsTampering,
                            location: "/etc/resolv.conf".to_string(),
                            description: format!("DNS server {} is known malicious \u{2014} {}", ip, description),
                            action: ThreatAction::ManualReview,
                        });
                    }
                }
            }
        }
    }
}
