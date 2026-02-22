import Phaser from 'phaser';
import { generateTextures } from '../utils/textures';
import { Player } from '../entities/Player';
import { Alien } from '../entities/Alien';
import { Boss } from '../entities/Boss';
import { SHIPS } from '../config/ships';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  BOSS_SPAWN_TIME,
  ALIEN_SPAWN_INTERVAL,
  OBSTACLE_COUNT,
  OBSTACLE_MIN_SIZE,
  OBSTACLE_MAX_SIZE,
} from '../config/game';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private aliens!: Alien[];
  private boss: Boss | null = null;
  private bossSpawned = false;

  // Bullet groups (enemy)
  private alienBullets!: Phaser.Physics.Arcade.Group;
  private bossBullets!: Phaser.Physics.Arcade.Group;

  // Obstacles
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;

  // Starfield
  private stars: Phaser.GameObjects.Image[] = [];

  // HUD
  private hpText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private bossHpBar!: Phaser.GameObjects.Graphics;
  private bossWarningText!: Phaser.GameObjects.Text | null;

  private score = 0;
  private elapsed = 0;
  private alienTimer = 0;
  private gameOver = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  /* ---------------------------------------------------------------- */
  /*  CREATE                                                           */
  /* ---------------------------------------------------------------- */
  create(): void {
    // Reset state
    this.score = 0;
    this.elapsed = 0;
    this.alienTimer = 0;
    this.gameOver = false;
    this.bossSpawned = false;
    this.boss = null;
    this.aliens = [];
    this.bossWarningText = null;

    // Generate all textures (idempotent — only first time)
    if (!this.textures.exists('f35')) {
      generateTextures(this);
    }

    // Scrolling star background
    this.createStarfield();

    // Obstacles
    this.createObstacles();

    // Player — positioned on the left, flying left → right
    this.player = new Player(
      this,
      80,
      GAME_HEIGHT / 2,
      SHIPS.f35,
    );

    // Enemy bullet pools
    this.alienBullets = this.physics.add.group({
      defaultKey: 'bullet_alien',
      maxSize: 60,
    });

    this.bossBullets = this.physics.add.group({
      defaultKey: 'bullet_boss',
      maxSize: 40,
    });

    // ---- Collisions ---- //

    // Player bullets → aliens
    this.physics.add.overlap(
      this.player.bullets,
      // We'll check against aliens manually each frame since they're not in a group
      this.obstacles, // placeholder, real alien checks are in update
      undefined,
      undefined,
      this,
    );

    // Alien bullets → player
    this.physics.add.overlap(
      this.alienBullets,
      this.player,
      this.onPlayerHitByBullet as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    );

    // Boss bullets → player
    this.physics.add.overlap(
      this.bossBullets,
      this.player,
      this.onPlayerHitByBullet as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    );

    // Player → obstacles
    this.physics.add.collider(this.player, this.obstacles);

    // Player bullets → obstacles (bullets destroyed)
    this.physics.add.overlap(
      this.player.bullets,
      this.obstacles,
      this.onBulletHitObstacle as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    );

    // HUD
    this.createHUD();
  }

  /* ---------------------------------------------------------------- */
  /*  UPDATE                                                           */
  /* ---------------------------------------------------------------- */
  update(time: number, delta: number): void {
    if (this.gameOver) return;

    this.elapsed += delta;

    // Scrolling stars
    this.updateStarfield();

    // Player
    this.player.update(time, delta);

    // Spawn aliens
    this.alienTimer += delta;
    if (this.alienTimer >= ALIEN_SPAWN_INTERVAL) {
      this.alienTimer = 0;
      this.spawnAlien();
    }

    // Update aliens + check bullet collisions manually
    for (let i = this.aliens.length - 1; i >= 0; i--) {
      const alien = this.aliens[i];
      if (!alien.active) {
        this.aliens.splice(i, 1);
        continue;
      }
      alien.update(time, delta);
      alien.fire(time, this.alienBullets);

      // Check player bullets against this alien
      this.physics.overlap(
        this.player.bullets,
        alien,
        this.onBulletHitAlien as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
        undefined,
        this,
      );
    }

    // Boss spawn
    if (!this.bossSpawned && this.elapsed >= BOSS_SPAWN_TIME) {
      this.spawnBoss();
    }

    // Boss warning
    if (!this.bossSpawned && this.elapsed >= BOSS_SPAWN_TIME - 5000 && !this.bossWarningText) {
      this.bossWarningText = this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, '⚠ MOTHERSHIP INCOMING ⚠', {
          fontSize: '24px',
          color: '#ff4444',
          fontFamily: 'monospace',
        })
        .setOrigin(0.5)
        .setDepth(100);

      this.tweens.add({
        targets: this.bossWarningText,
        alpha: 0,
        yoyo: true,
        repeat: 5,
        duration: 400,
        onComplete: () => {
          this.bossWarningText?.destroy();
          this.bossWarningText = null;
        },
      });
    }

    // Update boss
    if (this.boss && this.boss.active) {
      this.boss.update(time, delta);
      this.boss.fire(time, this.bossBullets);

      // Player bullets → boss
      this.physics.overlap(
        this.player.bullets,
        this.boss,
        this.onBulletHitBoss as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
        undefined,
        this,
      );

      // Boss → obstacles (boss plows through)
      // (no collision — boss is massive)

      this.updateBossHpBar();
    }

    // Check player death
    if (this.player.isDead()) {
      this.endGame(false);
    }

    // HUD
    this.hpText.setText(`HP: ${Math.max(0, this.player.currentHp)}`);
    this.scoreText.setText(`SCORE: ${this.score}`);
    const seconds = Math.floor(this.elapsed / 1000);
    this.timerText.setText(`TIME: ${seconds}s`);
  }

  /* ---------------------------------------------------------------- */
  /*  HELPERS                                                          */
  /* ---------------------------------------------------------------- */

  private createStarfield(): void {
    this.stars = [];
    for (let i = 0; i < 80; i++) {
      const star = this.add.image(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        'star',
      );
      star.setAlpha(0.3 + Math.random() * 0.7);
      star.setDepth(0);
      (star as any)._speed = 0.5 + Math.random() * 1.5;
      this.stars.push(star);
    }
  }

  private updateStarfield(): void {
    for (const star of this.stars) {
      star.x -= (star as any)._speed;
      if (star.x < 0) {
        star.x = GAME_WIDTH;
        star.y = Phaser.Math.Between(0, GAME_HEIGHT);
      }
    }
  }

  private createObstacles(): void {
    this.obstacles = this.physics.add.staticGroup();
    for (let i = 0; i < OBSTACLE_COUNT; i++) {
      const x = Phaser.Math.Between(40, GAME_WIDTH - 40);
      const y = Phaser.Math.Between(100, GAME_HEIGHT - 150);
      const obs = this.obstacles.create(x, y, 'obstacle') as Phaser.Physics.Arcade.Sprite;
      const scale =
        (OBSTACLE_MIN_SIZE + Math.random() * (OBSTACLE_MAX_SIZE - OBSTACLE_MIN_SIZE)) / 32;
      obs.setScale(scale).refreshBody();
      obs.setDepth(3);
      obs.setAlpha(0.85);
    }
  }

  private spawnAlien(): void {
    const y = Phaser.Math.Between(40, GAME_HEIGHT - 40);
    const alien = new Alien(this, GAME_WIDTH + 30, y);
    this.aliens.push(alien);
  }

  private spawnBoss(): void {
    this.bossSpawned = true;
    this.boss = new Boss(this, GAME_WIDTH + 60, GAME_HEIGHT / 2);

    // Create boss HP bar
    this.bossHpBar = this.add.graphics().setDepth(100);
  }

  /* ---- Collision callbacks ---- */

  private onBulletHitAlien(
    objA: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    objB: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  ): void {
    // Phaser may pass the two objects in either order; figure out which is the Alien.
    let bullet: Phaser.Physics.Arcade.Sprite;
    let alien: Alien;
    if (objA instanceof Alien) {
      alien = objA;
      bullet = objB as Phaser.Physics.Arcade.Sprite;
    } else {
      alien = objB as unknown as Alien;
      bullet = objA as Phaser.Physics.Arcade.Sprite;
    }

    bullet.setActive(false).setVisible(false);
    (bullet.body as Phaser.Physics.Arcade.Body).enable = false;

    if (alien.takeDamage(this.player.stats.damage)) {
      this.spawnExplosion(alien.x, alien.y);
      alien.destroy();
      this.score += 100;
    }
  }

  private onBulletHitBoss(
    objA: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    objB: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  ): void {
    let bullet: Phaser.Physics.Arcade.Sprite;
    let boss: Boss;
    if (objA instanceof Boss) {
      boss = objA;
      bullet = objB as Phaser.Physics.Arcade.Sprite;
    } else {
      boss = objB as unknown as Boss;
      bullet = objA as Phaser.Physics.Arcade.Sprite;
    }

    bullet.setActive(false).setVisible(false);
    (bullet.body as Phaser.Physics.Arcade.Body).enable = false;

    if (boss.takeDamage(this.player.stats.damage)) {
      this.spawnExplosion(boss.x, boss.y);
      boss.destroy();
      this.boss = null;
      this.score += 2000;
      this.endGame(true);
    }
  }

  private onPlayerHitByBullet(
    objA: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    objB: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  ): void {
    // Phaser may pass the two objects in either order; figure out which is the bullet.
    const bullet = (objA instanceof Player ? objB : objA) as Phaser.Physics.Arcade.Sprite;

    bullet.setActive(false).setVisible(false);
    (bullet.body as Phaser.Physics.Arcade.Body).enable = false;

    this.player.takeDamage(8);
  }

  private onBulletHitObstacle(
    bulletObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    _obstacleObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  ): void {
    const bullet = bulletObj as Phaser.Physics.Arcade.Sprite;
    bullet.setActive(false).setVisible(false);
    (bullet.body as Phaser.Physics.Arcade.Body).enable = false;
  }

  private spawnExplosion(x: number, y: number): void {
    const exp = this.add.image(x, y, 'explosion').setDepth(20);
    this.tweens.add({
      targets: exp,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 400,
      onComplete: () => exp.destroy(),
    });
  }

  private createHUD(): void {
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
    };

    this.hpText = this.add.text(10, 10, `HP: ${this.player.currentHp}`, style).setDepth(100);
    this.scoreText = this.add.text(10, 30, 'SCORE: 0', style).setDepth(100);
    this.timerText = this.add
      .text(GAME_WIDTH - 10, 10, 'TIME: 0s', { ...style, align: 'right' })
      .setOrigin(1, 0)
      .setDepth(100);
  }

  private updateBossHpBar(): void {
    if (!this.boss || !this.bossHpBar) return;
    this.bossHpBar.clear();

    const barW = 200;
    const barH = 12;
    const x = (GAME_WIDTH - barW) / 2;
    const y = GAME_HEIGHT - 30;
    const ratio = Math.max(0, this.boss.hp / this.boss.maxHp);

    // Background
    this.bossHpBar.fillStyle(0x333333);
    this.bossHpBar.fillRect(x, y, barW, barH);
    // Foreground
    this.bossHpBar.fillStyle(ratio > 0.3 ? 0xff3333 : 0xff0000);
    this.bossHpBar.fillRect(x, y, barW * ratio, barH);
    // Border
    this.bossHpBar.lineStyle(1, 0xffffff);
    this.bossHpBar.strokeRect(x, y, barW, barH);
  }

  /* ---- End game ---- */
  private endGame(won: boolean): void {
    if (this.gameOver) return;
    this.gameOver = true;

    this.physics.pause();

    const msg = won ? 'YOU WIN!' : 'GAME OVER';
    const color = won ? '#44ff44' : '#ff4444';

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 30, msg, {
        fontSize: '48px',
        color,
        fontFamily: 'monospace',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(200);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, `Score: ${this.score}`, {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setDepth(200);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 70, 'Press R or tap to restart', {
        fontSize: '18px',
        color: '#aaaaaa',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setDepth(200);

    // Restart on R key (once to avoid stacking listeners across restarts)
    this.input.keyboard?.once('keydown-R', () => {
      this.scene.restart();
    });

    // Restart on tap / click
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }
}
