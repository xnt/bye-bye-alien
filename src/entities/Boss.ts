import Phaser from 'phaser';
import {
  BOSS_HP,
  BOSS_SPEED,
  BOSS_DAMAGE,
  BOSS_FIRE_RATE,
  BOSS_BULLET_SPEED,
  GAME_HEIGHT,
} from '../config/game';

export class Boss extends Phaser.Physics.Arcade.Sprite {
  public hp: number;
  public maxHp: number;
  public damage: number;
  private lastFired = 0;
  private fireInterval: number;
  private moveDir = 1;
  private arrived = false;
  private targetX = 680; // stop near the right side of the screen

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'boss');
    this.hp = BOSS_HP;
    this.maxHp = BOSS_HP;
    this.damage = BOSS_DAMAGE;
    this.fireInterval = 1000 / BOSS_FIRE_RATE;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(6);

    // Entrance: slide in from the right
    this.setVelocityX(-BOSS_SPEED);
  }

  update(time: number, _delta: number): void {
    // Slide left until reaching target X
    if (!this.arrived && this.x <= this.targetX) {
      this.arrived = true;
      this.setVelocityX(0);
      this.setVelocityY(BOSS_SPEED * this.moveDir);
    }

    if (this.arrived) {
      // Patrol up/down
      if (this.y < 80) {
        this.moveDir = 1;
        this.setVelocityY(BOSS_SPEED);
      } else if (this.y > GAME_HEIGHT - 80) {
        this.moveDir = -1;
        this.setVelocityY(-BOSS_SPEED);
      }
    }
  }

  fire(
    time: number,
    bulletGroup: Phaser.Physics.Arcade.Group,
  ): void {
    if (!this.arrived) return;
    if (time < this.lastFired + this.fireInterval) return;

    // Fire spread of 3 bullets to the left
    const offsets = [-20, 0, 20];
    for (const oy of offsets) {
      const bullet = bulletGroup.get(this.x - 40, this.y + oy) as Phaser.Physics.Arcade.Sprite | null;
      if (bullet) {
        bullet.setActive(true).setVisible(true);
        (bullet.body as Phaser.Physics.Arcade.Body).enable = true;
        bullet.setPosition(this.x - 40, this.y + oy);
        bullet.setVelocity(-BOSS_BULLET_SPEED, oy * 2);
        this.scene.time.delayedCall(4000, () => {
          if (bullet.active) {
            bullet.setActive(false).setVisible(false);
            (bullet.body as Phaser.Physics.Arcade.Body).enable = false;
          }
        });
      }
    }
    this.lastFired = time;
  }

  takeDamage(amount: number): boolean {
    this.hp -= amount;
    this.setTint(0xff0000);
    this.scene.time.delayedCall(60, () => this.clearTint());
    return this.hp <= 0;
  }
}
