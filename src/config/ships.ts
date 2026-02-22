/**
 * Ship definitions — easy to extend with new ships in the future.
 */
export interface ShipStats {
  name: string;
  speed: number;        // pixels / second
  handling: number;     // turning responsiveness multiplier
  damage: number;       // per bullet
  hp: number;
  fireRate: number;     // shots per second
  bulletSpeed: number;  // pixels / second
}

export const SHIPS: Record<string, ShipStats> = {
  f35: {
    name: 'F-35',
    speed: 300,
    handling: 1.0,
    damage: 10,
    hp: 100,
    fireRate: 5,
    bulletSpeed: 500,
  },
  // future ships go here
};
