import { TCoords, TOrientation } from './maze';

export type TPlayer = {
  orientation: TOrientation
  position: TCoords;
}

export function createPlayer(): TPlayer {
  return {
    orientation: 'north',
    position: {
      x: 0,
      y: 0,
    }
  }
}
