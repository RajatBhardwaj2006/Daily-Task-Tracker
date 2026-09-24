# Daily Task Tracker

An offline-first Windows daily task tracker designed to keep daily routines simple, visible, and consistent.

## Features

- Add unlimited daily tasks
- Create **Must-do** and **Optional** tasks
- Set a start date and end date for every task
- Automatically refresh the active task list for each day
- Track daily task completion
- **Red** day → one or more Must-do tasks were missed
- **Green** day → all Must-do tasks were completed
- **Bright Green / Perfect** day → all Must-do and Optional tasks were completed
- Track your **current streak**
- Track total **successful days**
- View long-term consistency using a contribution-style calendar
- Filter tasks by **All, Must, or Optional**
- Backup local task data
- Works offline and keeps task data locally

## Screenshots

### Dashboard

![Daily Task Tracker Dashboard](doc/Main_page.png)

### Add Task

![Add Task](doc/Add_task.png)

## Task Types

### Must-do

Must-do tasks determine whether the day is successful.

If all Must-do tasks are completed:

**Day = Green**

If any Must-do task is missed:

**Day = Red**

### Optional

Optional tasks are not required for a successful day.

If all Must-do tasks **and** all Optional tasks are completed:

**Day = Bright Green / Perfect**

## Date-Based Tasks

Every task can have its own active date range.

Each task contains:

- Task name
- Task type
- Start date
- End date

A task is displayed as an active task only during its configured date range.

Example:

```text
DSA Practice
Start: Sep 24, 2026
End: Dec 31, 2027
