# Lab 7.1

A local assignment desk. Node serves the page, handles the forms, and writes tasks to `data/tasks.json`. The same list is available as JSON at `/api/tasks`.

## Chosen IDE: Cursor

Cursor is a code editor built on Visual Studio Code, with an AI chat built in. This lab uses the desktop app on Windows.

Useful pieces for this lab:

- **Open the project:** File → Open Folder, then choose the `lab 7.1` folder.
- **Edit:** `index.js` is the app. The editor shows errors as you type and offers completions.
- **Terminal:** View → Terminal, or `` Ctrl+` ``. Commands below are run from this folder.
- **AI chat:** Ask Cursor to explain the file, suggest a change, or help with a Git error. Review what it writes before you keep it.
- **Git:** The Source Control panel (branch icon) shows changed files. Commit and push from there, or use the Git commands in the terminal.
- **Extensions:** Cursor uses the same extension marketplace as VS Code. The built-in JavaScript support is enough for this app.

## Run locally

Node.js 22 is installed. From this folder:

```bash
npm start
```

Then open http://localhost:3000. Add an assignment, mark one done, and remove one. Stop the server with Ctrl+C. Restart `npm start` after code changes, because this app does not reload itself.

You can also run the file directly:

```bash
node index.js
```
