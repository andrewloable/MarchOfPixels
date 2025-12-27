# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MarchOfPixels is a **web-only** number progression shooter game inspired by "Count Masters". Players travel forward, collect numbers to grow stronger, and automatically shoot enemies. See `Requirements.md` for full game design specification.

## Technology Stack

- **3D Rendering**: Three.js (WebGL)
- **Build Tool**: Vite
- **Language**: JavaScript (ES6+)
- **Deployment**: PWA (Progressive Web App)

## Build and Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
```

## Architecture

```
src/
├── main.js              # Entry point
├── core/
│   ├── Game.js          # Main game loop
│   ├── Scene.js         # Three.js scene setup
│   └── Input.js         # Touch/mouse handling
├── entities/
│   ├── Player.js        # Player controller
│   ├── Enemy.js         # Enemy behavior
│   ├── Projectile.js    # Auto-fire bullets
│   └── Gate.js          # Number gates
├── systems/
│   ├── Collision.js     # Hit detection
│   └── Spawner.js       # Wave generation
└── ui/
    └── HUD.js           # Score display
```

## Task Tracking

Uses `bd` (beads) for issue tracking:
```bash
bd list              # List all tasks
bd create "title"    # Create new task
bd close <id>        # Close a task
```
