import { describe, it, expect } from 'vitest';
import { SHIPS, ShipStats } from './ships';

describe('Ship definitions', () => {
  it('should export the f35 ship', () => {
    expect(SHIPS.f35).toBeDefined();
  });

  it('f35 should have all required stats', () => {
    const requiredKeys: (keyof ShipStats)[] = [
      'name',
      'speed',
      'handling',
      'damage',
      'hp',
      'fireRate',
      'bulletSpeed',
    ];
    for (const key of requiredKeys) {
      expect(SHIPS.f35).toHaveProperty(key);
    }
  });

  it('f35 stats should have positive numeric values', () => {
    const { speed, handling, damage, hp, fireRate, bulletSpeed } = SHIPS.f35;
    expect(speed).toBeGreaterThan(0);
    expect(handling).toBeGreaterThan(0);
    expect(damage).toBeGreaterThan(0);
    expect(hp).toBeGreaterThan(0);
    expect(fireRate).toBeGreaterThan(0);
    expect(bulletSpeed).toBeGreaterThan(0);
  });

  it('f35 should be named "F-35"', () => {
    expect(SHIPS.f35.name).toBe('F-35');
  });
});
