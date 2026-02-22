import Phaser from 'phaser';

/** Create an off-screen graphics context for texture generation. */
function gfx(scene: Phaser.Scene): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.setVisible(false);
  return g;
}

/**
 * Procedurally generate all game textures (pixel art) so we don't need PNGs.
 * Each function draws onto a Phaser Graphics object, then saves as a texture.
 */
export function generateTextures(scene: Phaser.Scene): void {
  generateF35(scene);
  generatePlayerBullet(scene);
  generateAlien(scene);
  generateAlienBullet(scene);
  generateBoss(scene);
  generateBossBullet(scene);
  generateObstacle(scene);
  generateStar(scene);
  generateExplosionFrame(scene);
}

/* ------------------------------------------------------------------ */
/*  F-35 — top-down stealth fighter silhouette, 32×32                 */
/* ------------------------------------------------------------------ */
function generateF35(scene: Phaser.Scene): void {
  const g = gfx(scene);
  const s = 2; // pixel scale

  // Fuselage (dark grey)
  g.fillStyle(0x708090);
  g.fillRect(14 * s, 2 * s, 4 * s, 26 * s);

  // Nose cone
  g.fillStyle(0x556677);
  g.fillRect(15 * s, 0, 2 * s, 3 * s);

  // Main swept wings
  g.fillStyle(0x607080);
  g.fillRect(6 * s, 12 * s, 20 * s, 3 * s);
  // wing taper left
  g.fillRect(4 * s, 13 * s, 4 * s, 2 * s);
  g.fillRect(2 * s, 14 * s, 3 * s, 1 * s);
  // wing taper right
  g.fillRect(24 * s, 13 * s, 4 * s, 2 * s);
  g.fillRect(27 * s, 14 * s, 3 * s, 1 * s);

  // Tail wings
  g.fillStyle(0x556070);
  g.fillRect(10 * s, 24 * s, 12 * s, 2 * s);
  g.fillRect(8 * s, 25 * s, 4 * s, 2 * s);
  g.fillRect(20 * s, 25 * s, 4 * s, 2 * s);

  // Engine glow
  g.fillStyle(0x44aaff);
  g.fillRect(14 * s, 27 * s, 4 * s, 2 * s);

  // Cockpit canopy
  g.fillStyle(0x99ccff);
  g.fillRect(15 * s, 5 * s, 2 * s, 3 * s);

  g.generateTexture('f35', 32 * s, 32 * s);
  g.destroy();
}

/* ------------------------------------------------------------------ */
/*  Player bullet — small bright horizontal projectile, 10×4          */
/* ------------------------------------------------------------------ */
function generatePlayerBullet(scene: Phaser.Scene): void {
  const g = gfx(scene);
  g.fillStyle(0x44eeff);
  g.fillRect(0, 1, 10, 2);
  g.fillStyle(0xffffff);
  g.fillRect(7, 1, 3, 2);
  g.generateTexture('bullet_player', 10, 4);
  g.destroy();
}

/* ------------------------------------------------------------------ */
/*  Alien ship — Independence-Day-style saucer, 28×28                 */
/* ------------------------------------------------------------------ */
function generateAlien(scene: Phaser.Scene): void {
  const g = gfx(scene);
  const s = 2;

  // Main disc body
  g.fillStyle(0x445566);
  g.fillRect(4 * s, 6 * s, 20 * s, 8 * s);

  // Wider middle rim
  g.fillStyle(0x556677);
  g.fillRect(2 * s, 8 * s, 24 * s, 4 * s);

  // Dome on top
  g.fillStyle(0x66ddaa);
  g.fillRect(10 * s, 4 * s, 8 * s, 4 * s);
  g.fillStyle(0x88ffcc);
  g.fillRect(12 * s, 3 * s, 4 * s, 2 * s);

  // Glowing underside lights
  g.fillStyle(0xff4444);
  g.fillRect(6 * s, 13 * s, 2 * s, 1 * s);
  g.fillRect(12 * s, 14 * s, 4 * s, 1 * s);
  g.fillRect(20 * s, 13 * s, 2 * s, 1 * s);

  // Side prongs (Independence Day style arms)
  g.fillStyle(0x334455);
  g.fillRect(0, 9 * s, 3 * s, 2 * s);
  g.fillRect(25 * s, 9 * s, 3 * s, 2 * s);

  g.generateTexture('alien', 28 * s, 18 * s);
  g.destroy();
}

/* ------------------------------------------------------------------ */
/*  Alien bullet                                                      */
/* ------------------------------------------------------------------ */
function generateAlienBullet(scene: Phaser.Scene): void {
  const g = gfx(scene);
  g.fillStyle(0xff4466);
  g.fillRect(1, 0, 3, 8);
  g.fillStyle(0xff8888);
  g.fillRect(1, 6, 3, 2);
  g.generateTexture('bullet_alien', 5, 8);
  g.destroy();
}

/* ------------------------------------------------------------------ */
/*  Boss mothership — large imposing vessel, 120×80                   */
/* ------------------------------------------------------------------ */
function generateBoss(scene: Phaser.Scene): void {
  const g = gfx(scene);

  // Main hull — dark metallic
  g.fillStyle(0x333d47);
  g.fillRect(20, 20, 80, 45);

  // Wider middle section
  g.fillStyle(0x2a333d);
  g.fillRect(10, 30, 100, 25);

  // Extended wing pylons
  g.fillStyle(0x252e38);
  g.fillRect(0, 35, 15, 15);
  g.fillRect(105, 35, 15, 15);

  // Top superstructure / bridge
  g.fillStyle(0x445566);
  g.fillRect(40, 10, 40, 15);
  g.fillStyle(0x556b7a);
  g.fillRect(50, 5, 20, 8);

  // Dome / command centre glow
  g.fillStyle(0x66ffaa);
  g.fillRect(55, 6, 10, 5);

  // Undercarriage detail rows
  g.fillStyle(0x44556a);
  for (let x = 20; x < 100; x += 8) {
    g.fillRect(x, 60, 5, 3);
  }

  // Glowing weapon ports
  g.fillStyle(0xff3333);
  g.fillRect(25, 62, 4, 4);
  g.fillRect(55, 65, 6, 4);
  g.fillRect(91, 62, 4, 4);

  // Engine glow at rear
  g.fillStyle(0xaa44ff);
  g.fillRect(30, 66, 60, 5);
  g.fillStyle(0xcc66ff);
  g.fillRect(40, 68, 40, 4);

  // Panel line details
  g.fillStyle(0x1e262f);
  g.fillRect(20, 40, 80, 1);
  g.fillRect(60, 20, 1, 45);

  g.generateTexture('boss', 120, 80);
  g.destroy();
}

/* ------------------------------------------------------------------ */
/*  Boss bullet                                                       */
/* ------------------------------------------------------------------ */
function generateBossBullet(scene: Phaser.Scene): void {
  const g = gfx(scene);
  g.fillStyle(0xff2266);
  g.fillRect(0, 0, 6, 12);
  g.fillStyle(0xff6699);
  g.fillRect(1, 9, 4, 3);
  g.generateTexture('bullet_boss', 6, 12);
  g.destroy();
}

/* ------------------------------------------------------------------ */
/*  Obstacle — asteroid-style jagged rock                             */
/* ------------------------------------------------------------------ */
function generateObstacle(scene: Phaser.Scene): void {
  const g = gfx(scene);
  const size = 32;

  // Base rock shape
  g.fillStyle(0x665544);
  g.fillRect(6, 2, 20, 28);
  g.fillRect(2, 6, 28, 20);
  g.fillRect(4, 4, 24, 24);

  // Shading
  g.fillStyle(0x554433);
  g.fillRect(8, 4, 8, 10);
  g.fillRect(18, 14, 8, 8);

  // Highlight spots
  g.fillStyle(0x887766);
  g.fillRect(12, 12, 4, 4);
  g.fillRect(6, 20, 3, 3);

  g.generateTexture('obstacle', size, size);
  g.destroy();
}

/* ------------------------------------------------------------------ */
/*  Background star                                                   */
/* ------------------------------------------------------------------ */
function generateStar(scene: Phaser.Scene): void {
  const g = gfx(scene);
  g.fillStyle(0xffffff);
  g.fillRect(0, 0, 2, 2);
  g.generateTexture('star', 2, 2);
  g.destroy();
}

/* ------------------------------------------------------------------ */
/*  Simple explosion frame (single orange/yellow burst)               */
/* ------------------------------------------------------------------ */
function generateExplosionFrame(scene: Phaser.Scene): void {
  const g = gfx(scene);
  const cx = 16, cy = 16;

  g.fillStyle(0xff6600);
  g.fillRect(cx - 10, cy - 10, 20, 20);
  g.fillStyle(0xffaa00);
  g.fillRect(cx - 6, cy - 6, 12, 12);
  g.fillStyle(0xffff44);
  g.fillRect(cx - 3, cy - 3, 6, 6);
  g.fillStyle(0xffffff);
  g.fillRect(cx - 1, cy - 1, 2, 2);

  g.generateTexture('explosion', 32, 32);
  g.destroy();
}
