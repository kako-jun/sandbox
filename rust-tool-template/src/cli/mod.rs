/// CLIモジュール（TUI/コマンドライン両対応）
pub mod tui;

use crate::core::AppLogic;
use crate::utils::{
    explain_log_directories, get_log_directory, get_log_directory_info, get_platform_info, I18n,
};
use anyhow::Result;
use clap::{Arg, Command};
use fluent_bundle::FluentArgs;
use std::io::{self, Write};
use std::sync::{Arc, Mutex};
use tracing::{error, info, warn};

/// CLIエントリーポイント関数
pub async fn run() -> Result<()> {
    // Initialize internationalization
    let mut i18n = I18n::new();

    // Check for language environment variable
    if let Ok(lang) = std::env::var("RUST_TOOL_LANG") {
        i18n.set_language(&lang);
    } else if let Ok(lang) = std::env::var("LANG") {
        if lang.starts_with("ja") {
            i18n.set_language("ja");
        }
    }

    let matches = Command::new("rust-tool-template")
        .version("0.1.0")
        .author("kako-jun")
        .about(&i18n.get("app-description"))
        .arg(
            Arg::new("mode")
                .short('m')
                .long("mode")
                .help("Execution mode")
                .value_parser(["cli", "tui"])
                .default_value("tui"),
        )
        .arg(
            Arg::new("command")
                .short('c')
                .long("command")
                .help("Command to execute")
                .value_parser([
                    "add",
                    "list",
                    "process",
                    "stats",
                    "interactive-add",
                    "batch-add",
                    "log-info",
                    "platform-info",
                ]),
        )
        .arg(
            Arg::new("name")
                .short('n')
                .long("name")
                .help("Name for the data entry"),
        )
        .arg(
            Arg::new("value")
                .short('v')
                .long("value")
                .help("Value for the data entry")
                .value_parser(clap::value_parser!(i32)),
        )
        .arg(
            Arg::new("lang")
                .short('l')
                .long("lang")
                .help("Language (en/ja)")
                .value_parser(["en", "ja"]),
        )
        .get_matches();

    // Update language if specified via command line
    if let Some(lang) = matches.get_one::<String>("lang") {
        i18n.set_language(lang);
    }

    info!("Language set to: {}", i18n.current_language());
    info!("Log directory: {}", get_log_directory().display());
    info!("Embedded API server will be available on http://localhost:3030-3034");

    let app_logic = Arc::new(Mutex::new(AppLogic::new()));

    match matches.get_one::<String>("mode").unwrap().as_str() {
        "tui" => {
            info!("Starting TUI mode");
            tui::run_tui(app_logic)?;
        }
        "cli" => {
            info!("Starting CLI mode");
            run_cli_mode(&matches, app_logic, &i18n)?;
        }
        _ => unreachable!(),
    }

    Ok(())
}

fn run_cli_mode(
    matches: &clap::ArgMatches,
    app_logic: Arc<Mutex<AppLogic>>,
    i18n: &I18n,
) -> Result<()> {
    match matches.get_one::<String>("command") {
        Some(cmd) => match cmd.as_str() {
            "add" => {
                let name = matches
                    .get_one::<String>("name")
                    .ok_or_else(|| anyhow::anyhow!("{}", i18n.get("name-required")))?;
                let value = matches
                    .get_one::<i32>("value")
                    .ok_or_else(|| anyhow::anyhow!("{}", i18n.get("value-required")))?;

                let mut logic = app_logic.lock().unwrap();
                let id = logic.add_data(name.clone(), *value);

                let mut args = FluentArgs::new();
                args.set("id", id);
                println!("{}", i18n.get_with_args("added-entry", Some(&args)));

                info!(
                    "Added data entry: name={}, value={}, id={}",
                    name, value, id
                );
            }
            "list" => {
                let logic = app_logic.lock().unwrap();
                let data = logic.get_all_data();
                if data.is_empty() {
                    println!("{}", i18n.get("no-data-found"));
                } else {
                    println!("{}:", i18n.get("data-entries"));
                    for entry in data {
                        println!(
                            "  ID: {}, Name: {}, Value: {}",
                            entry.id, entry.name, entry.value
                        );
                    }
                }
                info!("Listed {} data entries", logic.get_all_data().len());
            }
            "process" => {
                let mut logic = app_logic.lock().unwrap();
                match logic.process_data() {
                    Ok(result) => {
                        println!("{}", result);
                        info!("Data processing completed successfully");
                    }
                    Err(e) => {
                        let mut args = FluentArgs::new();
                        args.set("error", e.to_string());
                        eprintln!("{}", i18n.get_with_args("error-processing", Some(&args)));
                        error!("Data processing failed: {}", e);
                    }
                }
            }
            "stats" => {
                let logic = app_logic.lock().unwrap();
                let stats = logic.get_statistics();
                println!("{}:", i18n.get("statistics"));
                for (key, value) in stats {
                    println!("  {}: {}", key, value);
                }
                info!("Displayed statistics");
            }
            "interactive-add" => {
                handle_interactive_add(&matches, app_logic, i18n)?;
            }
            "batch-add" => {
                handle_batch_add(&matches, app_logic, i18n)?;
            }
            "log-info" => {
                println!("Log Directory Information");
                println!("========================");
                println!();
                println!("{}", get_log_directory_info());
                println!();
                println!("{}", explain_log_directories());
                info!("Displayed log directory information");
            }
            "platform-info" => {
                let platform = get_platform_info();
                println!("{}", platform.detailed_info());
                println!();
                println!("Recommended Locations:");
                println!("  Log Directory: {}", platform.recommended_log_location());
                println!("  Config Directory: {}", platform.config_location());
                println!();
                println!("Platform-specific Details:");
                println!(
                    "  Executable Extension: {}",
                    if platform.executable_extension().is_empty() {
                        "none"
                    } else {
                        platform.executable_extension()
                    }
                );
                println!("  Path Separator: {}", platform.path_separator());
                info!("Displayed platform information");
            }
            _ => {
                let mut args = FluentArgs::new();
                args.set("command", cmd);
                eprintln!("{}", i18n.get_with_args("unknown-command", Some(&args)));
                warn!("Unknown command attempted: {}", cmd);
            }
        },
        None => {
            // Show usage examples when no command is specified
            println!("{}", i18n.get("no-command-specified"));
            println!();
            println!("{}", i18n.get("usage-title"));

            let program = "rust-tool-template";
            let mut args = FluentArgs::new();
            args.set("program", program);

            println!("  {}", i18n.get_with_args("usage-add", Some(&args)));
            println!("  {}", i18n.get_with_args("usage-list", Some(&args)));
            println!("  {}", i18n.get_with_args("usage-process", Some(&args)));
            println!("  {}", i18n.get_with_args("usage-stats", Some(&args)));
            println!("  {}", i18n.get_with_args("usage-tui", Some(&args)));
            println!(
                "  {}",
                i18n.get_with_args("usage-interactive-add", Some(&args))
            );
            println!("  {}", i18n.get_with_args("usage-batch-add", Some(&args)));

            warn!("No command specified by user");
        }
    }

    Ok(())
}

// Interactive add: arguments can be provided or asked interactively
fn handle_interactive_add(
    matches: &clap::ArgMatches,
    app_logic: Arc<Mutex<AppLogic>>,
    i18n: &I18n,
) -> Result<()> {
    println!("{}", i18n.get("interactive-add-title"));

    // Get name from argument or ask interactively
    let name = match matches.get_one::<String>("name") {
        Some(name) => {
            println!("Using provided name: {}", name);
            name.clone()
        }
        None => {
            print!("Enter name: ");
            io::stdout().flush()?;
            let mut input = String::new();
            io::stdin().read_line(&mut input)?;
            input.trim().to_string()
        }
    };

    // Get value from argument or ask interactively with default
    let value = match matches.get_one::<i32>("value") {
        Some(value) => {
            println!("Using provided value: {}", value);
            *value
        }
        None => {
            print!("Enter value (default: 100): ");
            io::stdout().flush()?;
            let mut input = String::new();
            io::stdin().read_line(&mut input)?;
            let trimmed = input.trim();
            if trimmed.is_empty() {
                100 // Default value
            } else {
                trimmed.parse::<i32>().unwrap_or_else(|_| {
                    println!("Invalid number, using default: 100");
                    100
                })
            }
        }
    };

    // Ask for optional metadata
    print!("Enter category (optional): ");
    io::stdout().flush()?;
    let mut category = String::new();
    io::stdin().read_line(&mut category)?;
    let category = category.trim();

    let mut logic = app_logic.lock().unwrap();
    let id = logic.add_data(name.clone(), value);

    // Add metadata if provided
    if !category.is_empty() {
        if let Some(data) = logic.get_all_data().iter().find(|d| d.id == id) {
            let mut data = data.clone();
            data.add_metadata("category".to_string(), category.to_string());
        }
    }

    let mut args = FluentArgs::new();
    args.set("id", id);
    args.set("name", name.as_str());
    args.set("value", value);
    println!(
        "{}",
        i18n.get_with_args("interactive-added-entry", Some(&args))
    );

    info!(
        "Interactive add completed: name={}, value={}, id={}",
        name, value, id
    );
    Ok(())
}

// Batch add: uses arguments with defaults for missing values
fn handle_batch_add(
    matches: &clap::ArgMatches,
    app_logic: Arc<Mutex<AppLogic>>,
    i18n: &I18n,
) -> Result<()> {
    println!("{}", i18n.get("batch-add-title"));

    // Use provided name or generate default
    let base_name = matches
        .get_one::<String>("name")
        .cloned()
        .unwrap_or_else(|| "item".to_string());

    // Use provided value or default
    let base_value = matches.get_one::<i32>("value").copied().unwrap_or(10);

    println!(
        "Adding batch entries with base name '{}' and base value {}",
        base_name, base_value
    );

    let mut logic = app_logic.lock().unwrap();
    let mut added_ids = Vec::new();

    // Add 5 entries with incrementing names and values
    for i in 1..=5 {
        let name = format!("{}-{}", base_name, i);
        let value = base_value * i;
        let id = logic.add_data(name.clone(), value);
        added_ids.push((id, name.clone(), value));
        info!(
            "Batch add entry {}: name={}, value={}, id={}",
            i, name, value, id
        );
    }

    println!("{}", i18n.get("batch-add-completed"));
    for (id, name, value) in added_ids {
        println!("  ID: {}, Name: {}, Value: {}", id, name, value);
    }

    Ok(())
}

// Helper function to read user input with prompt
#[allow(dead_code)]
fn prompt_input(prompt: &str) -> Result<String> {
    print!("{}", prompt);
    io::stdout().flush()?;
    let mut input = String::new();
    io::stdin().read_line(&mut input)?;
    Ok(input.trim().to_string())
}
