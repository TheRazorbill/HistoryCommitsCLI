# GitHub Date Editor

A powerful CLI tool to create and modify Git commits with custom dates. Perfect for backfilling your GitHub contribution graph or correcting commit timestamps.

```
This tool is intended for correcting Git metadata such as commits created
with incorrect system clocks, imported repositories, or historical work.
```

It should not be used to fabricate contribution activity.

## Features

-  Create empty commits with custom dates
-  Amend existing commits with new timestamps
-  Interactive prompts or command-line arguments
-  Flexible date input (full datetime, date only, or time only)
-  Future date validation
-  Cross-platform support (macOS, Linux, Windows)

## Installation

### One-time use (recommended)

```bash
npx github-date-editor
```

### Global installation

```bash
npm install -g github-date-editor
```

## Usage

### Interactive Mode

Simply run the command without arguments to enter interactive mode:

```bash
github-date-editor
```

You'll be prompted to:
1. Choose input type (date+time, date only, or time only)
2. Enter the date/time
3. Select action (create empty commit or amend last commit)
4. Enter commit message (optional for amend)

### CLI Mode

Pass arguments directly for automation or scripting:

```bash
# Create empty commit with custom date
github-date-editor --date "2024-12-25 10:00:00" --message "Holiday commit"

# Amend last commit with new date (keeps original message)
github-date-editor --date "2024-12-25" --amend

# Using short flags
github-date-editor -d "10:30:00" -m "Morning work"

# Amend with new message
github-date-editor -d "2023-01-01 00:00:00" --amend -m "New year commit"
```

## Arguments

| Argument | Short | Type | Description |
|----------|-------|------|-------------|
| `--date` | `-d` | string | Date/time in format: `YYYY-MM-DD HH:MM:SS`, `YYYY-MM-DD`, or `HH:MM:SS` |
| `--message` | `-m` | string | Commit message (required for new commits) |
| `--action` | `-a` | string | Action type: `allow-empty` or `amend` |
| `--amend` | | boolean | Shortcut for `--action amend` |

## Date Format Examples

- **Full date and time**: `2024-12-25 10:30:00`
- **Date only** (current time used): `2024-12-25`
- **Time only** (current date used): `10:30:00` or `10:30`

> **Note**: Future dates are not allowed. The tool validates that all timestamps are in the past.

## Use Cases

### Backfill GitHub Contributions

Create commits for past dates to fill your contribution graph:

```bash
github-date-editor -d "2024-01-15 09:00:00" -m "Initial project setup"
github-date-editor -d "2024-01-16 14:30:00" -m "Add core features"
github-date-editor -d "2024-01-17 11:00:00" -m "Documentation update"
```

### Fix Commit Timestamps

Amend the last commit to correct its date:

```bash
# Keep original message, just change date
github-date-editor -d "2024-06-15 16:45:00" --amend

# Change both date and message
github-date-editor -d "2024-06-15" --amend -m "Corrected commit"
```

### Automated Scripts

Use in shell scripts for batch operations:

```bash
#!/bin/bash
dates=("2024-01-01" "2024-01-08" "2024-01-15")
for date in "${dates[@]}"; do
  github-date-editor -d "$date 10:00:00" -m "Weekly update"
done
```

## How It Works

The tool uses Git's `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE` environment variables to set custom timestamps. This approach:

- Works across all platforms (macOS, Linux, Windows)
- Modifies both author and committer dates
- Uses `--allow-empty` flag to create commits without file changes
- Applies `--reset-author` on amend to update author information

## Requirements

- Node.js 16+ 
- Git installed and configured
- A Git repository (initialized with `git init`)

## License

ISC

## Author

Built with TypeScript, Inquirer.js, and Node.js native modules.
