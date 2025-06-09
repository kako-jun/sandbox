# Application messages
app-name = Rust Tool Template
app-description = A CLI tool template built with Rust

# Commands
command-add = Add a new data entry
command-list = List all data entries
command-process = Process all data
command-stats = Show statistics

# Messages
no-command-specified = No command specified. Use --help for usage information.
no-data-found = No data entries found.
data-entries = Data entries:
statistics = Statistics:
added-entry = Added entry with ID: { $id }
unknown-command = Unknown command: { $command }
error-processing = Error processing data: { $error }
name-required = Name is required for add command
value-required = Value is required for add command

# Usage help
usage-title = Usage Examples:
usage-add = Add data:    { $program } -m cli -c add -n "item1" -v 100
usage-list = List data:  { $program } -m cli -c list
usage-process = Process:   { $program } -m cli -c process
usage-stats = Statistics: { $program } -m cli -c stats
usage-tui = TUI mode:    { $program } -m tui
usage-interactive-add = Interactive: { $program } -m cli -c interactive-add [-n name] [-v value]
usage-batch-add = Batch add:   { $program } -m cli -c batch-add [-n base_name] [-v base_value]

# Interactive commands
interactive-add-title = Interactive Add Mode
batch-add-title = Batch Add Mode
interactive-added-entry = Interactive entry added - ID: { $id }, Name: { $name }, Value: { $value }
batch-add-completed = Batch add completed

# Error messages
application-error = Application error: { $error }
startup-message = Starting rust-tool-template application
finished-message = Application finished successfully

# Logging
log-rotation-info = Log rotation completed
log-file-created = Log file created: { $path }
