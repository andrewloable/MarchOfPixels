# MarchOfPixels Requirements

A mobile game inspired by "Count Masters" - a number progression shooter where players grow stronger by collecting numbers and defeating enemies.

## 1. Core Gameplay Loop

### Number-Based Progression
- Player character or group travels forward down a path
- Numbered gates/objects/obstacles appear along the path (e.g., 23, 145, 266)
- Colliding with numbers adds to the player's count/strength
- Numbers determine damage output and unit count
- Strategic choice of which gates to hit drives gameplay

## 2. Player Character and Actions

### Player Control
- Simple movement system (auto-forward with lane switching)
- Automatic firing ahead (no complex aiming required)

### Input Methods (Priority Order)
1. **Gamepad (Xbox/PlayStation)**
   - Left stick or D-pad: Move left/right between lanes
   - Auto-detected via Gamepad API
   - Support for Xbox, PlayStation, and generic USB controllers

2. **Keyboard**
   - Arrow keys (Left/Right) or A/D: Switch lanes
   - Movement is automatic forward

3. **Mouse**
   - Click and drag left/right to switch lanes
   - Or click on left/center/right of screen to select lane

4. **Touch (Mobile)**
   - Tap and drag left/right to switch lanes
   - Tap on left/center/right of screen to select lane

*Note: Shooting is always automatic - no fire button needed*

### Character Upgrades
- Collect power-ups, weapons, or additional shooters/followers
- Optional inventory system for progression

## 3. Enemies and Obstacles

### Enemy Waves
- Enemies march forward toward the player
- Increasing difficulty over time (speed, number, variety)

### Numbered Objects
- Barrels, crates, and obstacles with numbers that:
  - Change player strength when destroyed
  - Grant additional shooters or increased firepower

## 4. Combat and Damage Calculation

### Number-Based Combat
- Player damage output is tied to current number/count
- Destroying numbered objects increases overall strength
- Example calculation:
  - Initial firepower: 10
  - Destroy +23 gate → new firepower: 33
- Higher numbered enemies/barrels require higher firepower to defeat

## 5. Growth and Scaling

### Numerical Growth Mechanic
- **Collect Numbers** — add to score or strength
- **Multiply or Upgrade** — use upgrades to boost stats
- Dynamic difficulty scaling as player count increases
- Core loop: collect → grow → survive longer

## 6. Level Progression

### Game Mode: Endless Survival (Primary)
- Continuous waves until player fails
- No level end, progressive difficulty
- Score-based gameplay

*Note: Linear Stages mode (levels with checkpoints and boss waves) is deferred for future implementation.*

## 7. Player Feedback & UI

### Numeric UI
- Large numbers that update in real time
- Visible counters over objects showing their value
- Player strength displayed prominently

### Progress Indicators
- Wave/distance progress bar at top of screen
- Player strength counter (large, centered)

### Menu Screens

**Start Screen**
- Game title "MARCH OF PIXELS" prominently displayed
- "TAP TO START" or "PRESS START" button
- Background: Blurred or dimmed game scene
- Menu music plays

**Game Over Screen**
- "GAME OVER" title
- Final score display
- Coins/currency earned this run
- "PLAY AGAIN" button
- "UPGRADES" button (to upgrade menu)
- Menu music plays

**Upgrade Menu**
- List of available upgrades with costs
- Current currency balance displayed
- Back button to return to start screen

## 8. Reward and Upgrade Systems

### In-Game Currency
- Earn coins/tokens after completing levels
- Spend on upgrades, weapons, or numerical boosts

### Progression Trees
- Skill upgrades (faster firing, larger count bonuses)
- Character skins or customization options

## 9. Monetization

### In-App Purchases
- Premium currency
- Boost packs
- Time-savers

## 10. Visual Style & Art Direction

### Camera
- 3/4 isometric view from behind and above the player
- Fixed camera angle looking down the road ahead
- Player positioned at bottom-center of screen

### Color Palette
- **Road**: Gray asphalt (#8B8B8B)
- **Lane markers**: White dashed lines
- **Barriers**: Light gray concrete with pillars
- **Environment**: Sandy/desert tan (#D4A574) on both sides of road
- **Player**: Blue helmet, beige shirt, blue pants (worker/soldier style)
- **Enemies**: Red helmets, beige uniforms (marching soldiers)
- **Projectile**: Bright glowing blue/white laser beam with glow effect

### Player Character
- Cartoon-style 3D worker/soldier with blue hard hat
- Beige/tan shirt, blue pants, gray boots
- Fires continuous laser beam forward
- Simple low-poly style with soft shading

### Enemies
- Red-helmeted soldiers marching in formation
- Groups spawn together (formations of 10-30 soldiers)
- Number displayed above each group showing total count
- March toward player in rows

### Obstacles
- **Wooden Barrels**: Cylindrical with metal bands, breakable
- **Crates**: Wooden boxes with numbers
- **Bonus Items**: Motorcycles, tires, vehicles on top of barrels
- Numbers float above obstacles showing their value (e.g., "38")

### Road & Environment
- Three-lane gray road with white dashed dividers
- Concrete barriers with vertical pillars on both sides
- Sandy desert terrain visible beyond barriers
- Clean, bright lighting with soft shadows

### UI Elements
- Large white bold numbers floating above enemies/obstacles
- Numbers have subtle glow/outline for visibility
- Minimal HUD - player strength shown prominently
- Mute button in corner

### Art Style Summary
- Casual/cartoon 3D aesthetic
- Soft colors, not too saturated
- Clean geometric shapes
- Mobile-friendly visibility (large numbers, clear silhouettes)

### App Icon & Social Media Images

**App Icon** (`public/image/march-of-pixels-icon.jpg`)
- Used as PWA icon (192x192, 512x512 versions)
- Favicon for browser tab
- Pixel art style showing blue soldier, gate with "+100", red enemy

**Social Media Cover** (`public/image/march-of-pixels-cover.jpg`)
- Open Graph (og:image) meta tag for social sharing
- Twitter Card image
- Shows blue army marching through gate toward red enemies
- Landscape format for optimal social media display

**Meta Tags Required**
```html
<meta property="og:title" content="March of Pixels">
<meta property="og:description" content="A number progression shooter game">
<meta property="og:image" content="https://march-of-pixels.repetitive.games/image/march-of-pixels-cover.jpg">
<meta property="og:url" content="https://march-of-pixels.repetitive.games">
<meta name="twitter:card" content="summary_large_image">
```

---

## 11. Audio & Music

### Menu Music
Play randomly when on any menu/UI screen (start screen, game over, upgrade menu):
- `/music/Victory Parade.mp3`
- `/music/Victory Parade (1).mp3`

### Gameplay Music
Play randomly during active gameplay (loop until game over):
- `/music/Marching Forward.mp3`
- `/music/March of Pixels.mp3`
- `/music/March of Pixels (1).mp3`
- `/music/March of Pixels (Cover).mp3`

*Note: Music files located in `public/music/` directory*

### Audio Behavior
- Music should loop continuously
- Random track selection on each screen/game start
- Smooth transition between menu and gameplay music
- Mute button to toggle all audio
- Remember mute preference in localStorage

---

## 12. Hosting & Backend

### Domain
- **URL**: https://march-of-pixels.repetitive.games

### Backend Infrastructure
- **Platform**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Purpose**: High score leaderboard storage

### High Score / Leaderboard System

**Features**
- Store top scores globally
- Player name/alias input on game over (if high score)
- Country detection from browser (via Cloudflare headers or geolocation API)
- Display country flag emoji next to player name
- Show top 10/20/50 scores

**Player Name Validation**
- Maximum 5 characters
- Unicode characters allowed (emoji, non-Latin scripts, etc.)
- Profanity filter for offensive words in multiple languages:
  - English, Spanish, French, German, Portuguese
  - Filipino/Tagalog, Japanese, Korean, Chinese
  - Other common languages
- Use server-side validation (Cloudflare Worker)
- Reject submission if name fails validation
- Display friendly error message to user

**Leaderboard Data Structure**
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key |
| player_name | TEXT | Player's display name |
| score | INTEGER | Final score |
| strength | INTEGER | Final strength at game over |
| country_code | TEXT | ISO 2-letter country code (e.g., "US", "PH") |
| created_at | TIMESTAMP | When score was submitted |

**API Endpoints (Cloudflare Workers)**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/scores` | GET | Fetch top scores (with pagination) |
| `/api/scores` | POST | Submit new score |
| `/api/scores/rank` | GET | Get rank for a specific score |

**Country Detection**
- Primary: Use `CF-IPCountry` header from Cloudflare
- Fallback: Browser Geolocation API
- Display: Country flag emoji (e.g., 🇺🇸 🇵🇭 🇯🇵)

---

## 13. Technical Implementation

### Platform
- **Web-only** (browser-based game)
- Mobile browsers supported via responsive design and touch controls
- No native app deployment required

### Technology Stack
- **3D Rendering**: Three.js (free, open-source WebGL library)
- **Build Tool**: Vite
- **Language**: JavaScript (ES6+)
- **Deployment**: PWA for installability
- **Backend**: Cloudflare Workers + D1

### Alternative 3D Libraries (Open Source)
- Babylon.js - Full game engine with physics
- PlayCanvas - WebGL game engine
- A-Frame - VR/AR focused, simpler API
- PixiJS - 2D alternative if 3D is too complex

### Core Systems Required

| System | Description |
|--------|-------------|
| Movement System | Lane or path navigation |
| Collision Handling | Numbers, enemies, obstacles |
| Number Arithmetic | Adding/multiplying player stats |
| Projectile System | Automated firing mechanics |
| Enemy Spawner & AI | Path following behavior |
| UI System | Dynamic number updates |

## Feature Checklist

| Feature | Description | Priority |
|---------|-------------|----------|
| Number Gates | Objects with numeric values affecting player stats | High |
| Player Movement | Controlled forward progression with lane switching | High |
| Auto Shooter | Player fires automatically at enemies | High |
| Enemy Waves | Progressive enemy spawn patterns | High |
| Growth Mechanic | Player strength increases via numbers | High |
| Endless Mode | Continuous waves until player fails | High |
| Collision System | Detect hits between player, projectiles, enemies, gates | High |
| Floating Numbers | 3D text above entities showing values | High |
| Dynamic Difficulty | Game gets harder as player score increases | High |
| HUD | Score and strength display | High |
| Gamepad Support | Xbox/PlayStation controller input | Medium |
| Keyboard Controls | Arrow keys and A/D for movement | Medium |
| Audio System | Menu and gameplay music with mute toggle | Medium |
| Mute Button | Toggle audio on/off, persist preference | Medium |
| Upgrade Menu | Spend currency on permanent upgrades | Medium |
| Currency System | Earn and spend coins/tokens | Medium |
| Progress Bar | Wave/distance indicator | Medium |
| Barrel Obstacles | Wooden barrels with numbers | Medium |
| Crate Obstacles | Wooden crates with numbers | Medium |
| Skill Tree | Permanent progression upgrades | Low |
| Bonus Items | Motorcycles, tires on obstacles | Low |
| PWA | Installable web app with offline support | Low |
| Monetization | IAPs for premium content | Low |
| Leaderboard UI | Display high scores with country flags | Medium |
| Cloudflare Workers API | Backend for score submission and retrieval | Medium |
| D1 Database | Store high scores in Cloudflare D1 | Medium |
| Country Detection | Detect player country and show flag emoji | Medium |
| Name Input | Player name entry on high score | Medium |
