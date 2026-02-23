# AGENTS.md — Bye Bye Alien

## Project overview

Side-scrolling 2D space shooter built with **Phaser 3** + **TypeScript** + **Vite**.
The player flies an F-35 from left to right, fighting alien saucers and a boss mothership.
All textures are procedurally generated — there are zero image assets.

## Tech stack

- **Runtime:** Phaser 3 (Arcade Physics)
- **Language:** TypeScript (strict mode)
- **Bundler:** Vite 7
- **Tests:** Vitest 4 with `@vitest/coverage-v8`
- **Deploy:** GitHub Pages via `.github/workflows/deploy.yml`

## Project structure

```
src/
├── main.ts              # Phaser game bootstrap (parent: #game div)
├── config/
│   ├── game.ts          # Central numeric constants (dimensions, speeds, HP, etc.)
│   ├── game.test.ts     # Tests for game constants
│   ├── ships.ts         # ShipStats interface + ship definitions
│   └── ships.test.ts    # Tests for ship definitions
├── entities/
│   ├── Player.ts        # Player ship (extends Arcade.Sprite)
│   ├── Alien.ts         # Regular alien enemy (extends Arcade.Sprite)
│   └── Boss.ts          # Boss mothership (extends Arcade.Sprite)
├── scenes/
│   └── GameScene.ts     # Main (and only) game scene — spawning, collisions, HUD, game over
└── utils/
    └── textures.ts      # Procedural texture generation for all sprites
```

## Commands

| Command                | Description                       |
|------------------------|-----------------------------------|
| `npm run dev`          | Start Vite dev server (port 3000) |
| `npm run build`        | Type-check + production build     |
| `npm test`             | Run tests once                    |
| `npm run test:watch`   | Run tests in watch mode           |
| `npm run test:coverage`| Run tests with coverage report    |
| `npm run preview`      | Preview production build          |

## Key conventions

### Game orientation

The game scrolls **left-to-right**:
- Player is on the **left**, facing right, shoots rightward (+X velocity).
- Enemies spawn from the **right** edge and move leftward (-X velocity).
- Stars scroll right-to-left.
- Boss enters from the right and patrols vertically.

### Phaser collision callbacks

Phaser's `physics.overlap()` can pass callback arguments in **either order**.
Always use `instanceof` checks to identify which object is which.
Never assume `objA` is the bullet and `objB` is the target.

```typescript
// ✅ Correct
if (objA instanceof Alien) {
  alien = objA;
  bullet = objB as Phaser.Physics.Arcade.Sprite;
} else {
  alien = objB as unknown as Alien;
  bullet = objA as Phaser.Physics.Arcade.Sprite;
}

// ❌ Wrong — will crash when Phaser swaps argument order
const bullet = objA as Phaser.Physics.Arcade.Sprite;
const alien = objB as unknown as Alien;
```

### Bullet pools

Bullets use Phaser's `Arcade.Group` with `maxSize` for object pooling.
When recycling a bullet from the pool, **always unconditionally re-enable** the physics body:

```typescript
// ✅ Correct
(bullet.body as Phaser.Physics.Arcade.Body).enable = true;

// ❌ Wrong — short-circuit prevents re-enabling disabled bodies
bullet.body?.enable && ((bullet.body as Phaser.Physics.Arcade.Body).enable = true);
```

### Textures

All sprites are procedurally generated in `src/utils/textures.ts`.
No PNG/image files exist. The `generateTextures()` function is idempotent
(guarded by `this.textures.exists('f35')` in `GameScene.create()`).
When adding new entities, add a texture generator function there.

### Entity pattern

Every entity (Player, Alien, Boss) extends `Phaser.Physics.Arcade.Sprite` and:
1. Calls `scene.add.existing(this)` and `scene.physics.add.existing(this)` in the constructor.
2. Implements `update(time, delta)` for per-frame logic.
3. Has a `takeDamage(amount): boolean` method (returns `true` if killed).
4. Manages its own firing via a `fire(time, bulletGroup)` method (enemies) or private `fire(time)` (player).

### Tests

- Test files are co-located: `foo.ts` → `foo.test.ts` in the same directory.
- Use `describe` / `it` / `expect` from Vitest.
- Entity and scene code depends on Phaser's runtime and is currently **not unit-tested**.
  Config modules (`config/game.ts`, `config/ships.ts`) are tested.

### Build & deploy

- `npm run build` runs `tsc --noEmit` then `vite build` → outputs to `dist/`.
- Vite `base` is set conditionally: `/bye-bye-alien/` in GitHub Actions, `/` locally.
- The GitHub Actions workflow (`.github/workflows/deploy.yml`) deploys `dist/` to GitHub Pages on push to `main`.

### HTML structure

The game canvas is rendered inside `<div id="game">` (set via `parent: 'game'` in the Phaser config).
A `<footer>` inside that div is absolutely positioned at the bottom, overlaying the canvas.

## Path aliases

`@/` maps to `src/` (configured in both `tsconfig.json` and `vite.config.ts`).

```typescript
import { Player } from '@/entities/Player';
```
