# Markdown Reader

A lightweight, open-source desktop Markdown reader built with [Tauri](https://tauri.app) and Vue 3.

## Features

- Open a folder or single `.md` file
- Beautiful Markdown rendering: tables, code highlighting, math (KaTeX), images
- Auto-generated Table of Contents with scroll spy
- Edit mode with CodeMirror 6 and `Ctrl+S` save
- Light / Dark theme (follows system or manual toggle)
- Adjustable font size
- Recent files list
- File search within loaded folder

## Download

Download the latest installer from the [Releases](../../releases) page.

| Platform | File |
|---|---|
| Windows | `.exe` installer |
| macOS | `.dmg` |
| Linux | `.deb` or `.AppImage` |

## Development

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [Rust](https://rustup.rs) (stable toolchain)

### Getting Started

```bash
git clone https://github.com/<your-username>/markdown-reader
cd markdown-reader
npm install
npm run tauri dev
```

### Run Tests

```bash
npm test
```

### Build for Production

```bash
npm run tauri build
```

Installers are output to `src-tauri/target/release/bundle/`.

## License

MIT — see [LICENSE](./LICENSE).
