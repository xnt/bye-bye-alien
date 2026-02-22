import { describe, it, expect } from 'vitest';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  BOSS_SPAWN_TIME,
  ALIEN_SPAWN_INTERVAL,
  ALIEN_HP,
  ALIEN_SPEED,
  ALIEN_DAMAGE,
  BOSS_HP,
  BOSS_SPEED,
  BOSS_DAMAGE,
  OBSTACLE_COUNT,
  OBSTACLE_MIN_SIZE,
  OBSTACLE_MAX_SIZE,
} from './game';

describe('Game constants', () => {
  it('should have reasonable canvas dimensions', () => {
    expect(GAME_WIDTH).toBeGreaterThanOrEqual(640);
    expect(GAME_HEIGHT).toBeGreaterThanOrEqual(480);
  });

  it('boss should spawn around 30 seconds', () => {
    expect(BOSS_SPAWN_TIME).toBe(30_000);
  });

  it('alien spawn interval should be positive', () => {
    expect(ALIEN_SPAWN_INTERVAL).toBeGreaterThan(0);
  });

  it('alien stats should be positive', () => {
    expect(ALIEN_HP).toBeGreaterThan(0);
    expect(ALIEN_SPEED).toBeGreaterThan(0);
    expect(ALIEN_DAMAGE).toBeGreaterThan(0);
  });

  it('boss should be tougher than regular aliens', () => {
    expect(BOSS_HP).toBeGreaterThan(ALIEN_HP);
    expect(BOSS_DAMAGE).toBeGreaterThan(ALIEN_DAMAGE);
  });

  it('obstacle sizes should be valid range', () => {
    expect(OBSTACLE_MIN_SIZE).toBeLessThan(OBSTACLE_MAX_SIZE);
    expect(OBSTACLE_COUNT).toBeGreaterThan(0);
  });
});
