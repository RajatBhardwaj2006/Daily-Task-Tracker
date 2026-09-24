# Daily Task Tracker

A Windows-first, offline daily task tracker inspired by the GitHub contribution graph.

## What it does
- Add unlimited **Must** and **Optional** tasks.
- Every task has a start and end date.
- A day is **red** when any active Must task is incomplete.
- A day is **green** when all active Must tasks are complete.
- A day is **bright green** when all Must and all Optional tasks are complete.
- Automatically uses the current date; each new day gets its own completion state.
- Shows daily progress, current streak, total followed days, and a contribution-style consistency grid.
- Data is stored locally on the PC; no account and no internet are needed after installation.
- Export/import JSON backups.
- Windows installer creates a Start Menu shortcut and uses the included **T** icon.

## Run from source
1. Install Node.js LTS.
2. Open this folder in PowerShell/Command Prompt.
3. Run `npm install` once.
4. Run `npm start`.

## Build Windows installer
Run:
`npm run dist`

The installer will be created inside `release/`. It creates a Start Menu shortcut and desktop shortcut.
