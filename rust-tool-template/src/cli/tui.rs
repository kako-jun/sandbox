use crate::core::AppLogic;
use anyhow::Result;
use std::io;
use std::sync::{Arc, Mutex};

pub fn run_tui(app_logic: Arc<Mutex<AppLogic>>) -> Result<()> {
    println!("=== Rust Tool Template TUI ===");
    println!("Simple TUI interface for demonstration");
    println!("(Full TUI implementation with ratatui can be added later)");

    loop {
        println!("\nChoose an option:");
        println!("1. Add data");
        println!("2. List data");
        println!("3. Process data");
        println!("4. Show statistics");
        println!("5. Exit");
        print!("Enter choice (1-5): ");

        let mut input = String::new();
        io::stdin().read_line(&mut input)?;

        match input.trim() {
            "1" => add_data_interactive(&app_logic)?,
            "2" => list_data(&app_logic)?,
            "3" => process_data(&app_logic)?,
            "4" => show_statistics(&app_logic)?,
            "5" => {
                println!("Goodbye!");
                break;
            }
            _ => println!("Invalid choice. Please enter 1-5."),
        }
    }

    Ok(())
}

fn add_data_interactive(app_logic: &Arc<Mutex<AppLogic>>) -> Result<()> {
    print!("Enter name: ");
    let mut name = String::new();
    io::stdin().read_line(&mut name)?;
    let name = name.trim().to_string();

    print!("Enter value: ");
    let mut value_input = String::new();
    io::stdin().read_line(&mut value_input)?;
    let value: i32 = value_input
        .trim()
        .parse()
        .map_err(|_| anyhow::anyhow!("Invalid number"))?;

    let mut logic = app_logic.lock().unwrap();
    let id = logic.add_data(name, value);
    println!("Added entry with ID: {}", id);

    Ok(())
}

fn list_data(app_logic: &Arc<Mutex<AppLogic>>) -> Result<()> {
    let logic = app_logic.lock().unwrap();
    let data = logic.get_all_data();

    if data.is_empty() {
        println!("No data entries found.");
    } else {
        println!("\nData entries:");
        println!("ID | Name | Value");
        println!("---|------|------");
        for entry in data {
            println!("{:2} | {:10} | {:5}", entry.id, entry.name, entry.value);
        }
    }

    Ok(())
}

fn process_data(app_logic: &Arc<Mutex<AppLogic>>) -> Result<()> {
    let mut logic = app_logic.lock().unwrap();
    match logic.process_data() {
        Ok(result) => println!("Processing result: {}", result),
        Err(e) => println!("Error processing data: {}", e),
    }
    Ok(())
}

fn show_statistics(app_logic: &Arc<Mutex<AppLogic>>) -> Result<()> {
    let logic = app_logic.lock().unwrap();
    let stats = logic.get_statistics();

    println!("\nStatistics:");
    for (key, value) in stats {
        println!("  {}: {}", key, value);
    }

    Ok(())
}
