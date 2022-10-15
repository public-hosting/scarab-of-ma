import { TCoords, TMaze, TItem } from './maze';
import {
  TOrientation,
  OPPOSITE_SIDE,
  getNextSide,
  TRotation,
} from './orientation';

export type TPlayer = {
  orientation: TOrientation;
  position: TCoords;
  inventory: TItem[];
};

export function createPlayer(): TPlayer {
  return {
    orientation: 'south',
    position: {
      x: 0,
      y: 0,
    },
    inventory: [],
  };
}

export function turnPlayer(player: TPlayer, direction: TRotation): TPlayer {
  return {
    ...player,
    orientation: getNextSide(player.orientation, direction),
  };
}

const FORWARD_DELTA: { [key in TOrientation]: TCoords } = {
  north: { x: 0, y: -1 },
  south: { x: 0, y: 1 },
  east: { x: 1, y: 0 },
  west: { x: -1, y: 0 },
};

export function movePlayer(
  player: TPlayer,
  maze: TMaze,
  delta: number,
): TPlayer {
  const { position, orientation } = player;

  const currentCell = maze.cells[position.y][position.x];

  if (
    (delta > 0 && currentCell.walls[orientation]) ||
    (delta < 0 && currentCell.walls[OPPOSITE_SIDE[orientation]])
  ) {
    return player;
  }

  const orientationVector = FORWARD_DELTA[orientation];

  return {
    ...player,
    position: {
      x: position.x + orientationVector.x * delta,
      y: position.y + orientationVector.y * delta,
    },
  };
}

export function pickItem(player: TPlayer, item: TItem): TPlayer {
  return {
    ...player,
    inventory: [...player.inventory, item],
  };
}
