mod quarantine;
mod report;
mod scanner;
mod signatures;
mod threat;

use clap::Parser;
use colored::*;
use std::time::Instant;
use sysinfo::System;

#[derive(Parser)]
#[command(
    name = "down",
    about = "DOWN \u{2014} Personal AI-powered Windows Security Scanner",
    long_about = "Scans your Windows PC for malware, scareware, and potentially unwanted programs.\nBuilt in Rust for speed and safety. No telemetry, no cloud dependency.",
    version
)]
struct Cli {
    /// Run a full scan (all modules)
    #[arg(long, default_value_t = false)]
    scan: bool,

    /// Run a quick scan (processes + startup only)
    #[arg(long, default_value_t = false)]
    quick: bool,

    /// Quarantine all detected threats from the last scan
    #[arg(long, default_value_t = false)]
    quarantine: bool,

    /// Restore a quarantined file by ID
    #[arg(long, value_name = "ID")]
    restore: Option<usize>,

    /// List all quarantined items
    #[arg(long, default_value_t = false)]
    list_quarantine: bool,
}

fn main() {
    let cli = Cli::parse();

    if let Some(id) = cli.restore {
        report::print_banner();
        println!(
            "{} Restoring quarantined item #{}...\n",
            "[*]".cyan().bold(),
            id
        );
        match quarantine::restore_file(id) {
            Ok(_) => println!("\n  {} Done.", "[\u{2713}]".green().bold()),
            Err(e) => println!("\n  {} {}", "[\u{2717}]".red().bold(), e),
        }
        return;
    }

    if cli.list_quarantine {
        report::print_banner();
        quarantine::list_quarantine();
        return;
    }

    let is_full = cli.scan || (!cli.quick && !cli.quarantine);
    let is_quick = cli.quick;

    report::print_banner();

    if is_full {
        let threats = run_full_scan();
        handle_results(&threats, cli.quarantine);
    } else if is_quick {
        let threats = run_quick_scan();
        handle_results(&threats, cli.quarantine);
    } else if cli.quarantine {
        println!(
            "  {} Running scan before quarantine...\n",
            "[i]".blue()
        );
        let threats = run_full_scan();
        handle_results(&threats, true);
    }
}

fn run_full_scan() -> Vec<threat::Threat> {
    report::print_scan_start("Full System Scan");
    let start = Instant::now();
    let mut all_threats = Vec::new();

    report::print_module_start("Scanning running processes...");
    let mut system = System::new_all();
    system.refresh_all();
    let proc_threats = scanner::processes::scan(&system);
    if proc_threats.is_empty() {
        report::print_module_clean("Processes");
    } else {
        for t in &proc_threats {
            report::print_threat(t);
        }
    }
    all_threats.extend(proc_threats);

    report::print_module_start("Scanning startup entries...");
    let startup_threats = scanner::startup::scan();
    if startup_threats.is_empty() {
        report::print_module_clean("Startup entries");
    } else {
        for t in &startup_threats {
            report::print_threat(t);
        }
    }
    all_threats.extend(startup_threats);

    report::print_module_start("Scanning file system...");
    let file_threats = scanner::files::scan();
    if file_threats.is_empty() {
        report::print_module_clean("File system");
    } else {
        for t in &file_threats {
            report::print_threat(t);
        }
    }
    all_threats.extend(file_threats);

    report::print_module_start("Auditing browser extensions...");
    let browser_threats = scanner::browser::scan();
    if browser_threats.is_empty() {
        report::print_module_clean("Browser extensions");
    } else {
        for t in &browser_threats {
            report::print_threat(t);
        }
    }
    all_threats.extend(browser_threats);

    report::print_module_start("Checking network configuration...");
    let net_threats = scanner::network::scan();
    if net_threats.is_empty() {
        report::print_module_clean("Network configuration");
    } else {
        for t in &net_threats {
            report::print_threat(t);
        }
    }
    all_threats.extend(net_threats);

    report::print_module_start("Scanning for scareware & PUPs...");
    let scare_threats = scanner::scareware::scan();
    if scare_threats.is_empty() {
        report::print_module_clean("Scareware / PUPs");
    } else {
        for t in &scare_threats {
            report::print_threat(t);
        }
    }
    all_threats.extend(scare_threats);

    let elapsed = start.elapsed();
    println!(
        "\n  {} Scan completed in {:.1}s",
        "[i]".blue(),
        elapsed.as_secs_f64()
    );

    all_threats
}

fn run_quick_scan() -> Vec<threat::Threat> {
    report::print_scan_start("Quick Scan (Processes + Startup)");
    let start = Instant::now();
    let mut all_threats = Vec::new();

    report::print_module_start("Scanning running processes...");
    let mut system = System::new_all();
    system.refresh_all();
    let proc_threats = scanner::processes::scan(&system);
    if proc_threats.is_empty() {
        report::print_module_clean("Processes");
    } else {
        for t in &proc_threats {
            report::print_threat(t);
        }
    }
    all_threats.extend(proc_threats);

    report::print_module_start("Scanning startup entries...");
    let startup_threats = scanner::startup::scan();
    if startup_threats.is_empty() {
        report::print_module_clean("Startup entries");
    } else {
        for t in &startup_threats {
            report::print_threat(t);
        }
    }
    all_threats.extend(startup_threats);

    let elapsed = start.elapsed();
    println!(
        "\n  {} Quick scan completed in {:.1}s",
        "[i]".blue(),
        elapsed.as_secs_f64()
    );

    all_threats
}

fn handle_results(threats: &[threat::Threat], do_quarantine: bool) {
    let mut sorted = threats.to_vec();
    sorted.sort_by(|a, b| b.severity.cmp(&a.severity));

    report::print_summary(&sorted);

    if let Err(e) = report::write_log(&sorted) {
        println!("  {} Failed to write log: {}", "[!]".red(), e);
    }

    if do_quarantine && !sorted.is_empty() {
        println!(
            "\n{} {}",
            "[*]".cyan().bold(),
            "Quarantining threats...".yellow().bold()
        );

        match quarantine::quarantine_threats(&sorted) {
            Ok(count) => {
                println!(
                    "\n  {} Successfully quarantined {} items.",
                    "[\u{2713}]".green().bold(),
                    count
                );
                println!(
                    "  {} Use {} to see quarantined items.",
                    "[i]".blue(),
                    "down --list-quarantine".yellow()
                );
            }
            Err(e) => {
                println!("\n  {} Quarantine error: {}", "[\u{2717}]".red().bold(), e);
            }
        }
    }
}
