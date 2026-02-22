# Bye Bye Alien 👾🛩️

A 2D space-shooter built with **Phaser 3**, **TypeScript**, **Vite** and **Vitest**.

![Gameplay Screenshot](./bba_screenshot.png)

Fly an F-35 stealth fighter against waves of Independence-Day-style alien saucers,
dodge procedurally generated asteroid obstacles, and survive long enough to face the
**Mothership** boss that appears after 30 seconds.

All graphics are procedurally generated pixel art — no external image assets required.

---

## Quick Start

```bash
npm install
npm run dev        # starts Vite dev server on http://localhost:3000
```

## Controls

| Key | Action |
|-----|--------|
| **W / ↑** | Move up |
| **A / ←** | Move left |
| **S / ↓** | Move down |
| **D / →** | Move right |
| **Space** | Fire (also auto-fires) |
| **R** | Restart (after game over) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run unit tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
src/
├── main.ts                 # Phaser game bootstrap
├── config/
│   ├── game.ts             # Game-wide constants
│   ├── game.test.ts        # Tests for game constants
│   ├── ships.ts            # Ship stat definitions (F-35, future ships)
│   └── ships.test.ts       # Tests for ship definitions
├── entities/
│   ├── Player.ts           # Player (F-35) class
│   ├── Alien.ts            # Alien enemy class
│   └── Boss.ts             # Mothership boss class
├── scenes/
│   └── GameScene.ts        # Main gameplay scene
└── utils/
    └── textures.ts         # Procedural pixel-art texture generator
```

## Adding New Ships

Edit `src/config/ships.ts` and add a new entry to the `SHIPS` record:

```ts
export const SHIPS: Record<string, ShipStats> = {
  f35: { /* ... */ },
  raptor: {
    name: 'F-22 Raptor',
    speed: 350,
    handling: 1.2,
    damage: 8,
    hp: 80,
    fireRate: 7,
    bulletSpeed: 550,
  },
};
```

## License

ISC
