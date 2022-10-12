import { TCoords, TMaze, TOrientation, OPPOSITE_LOCATION } from './maze';

export type TPlayer = {
  orientation: TOrientation;
  position: TCoords;
};

export function createPlayer(): TPlayer {
  return {
    orientation: 'south',
    position: {
      x: 0,
      y: 0,
    },
  };
}

const TURN_ORDER: TOrientation[] = ['north', 'east', 'south', 'west'];

export function turnPlayer(player: TPlayer, delta: number): TPlayer {
  let nextSideIndex = TURN_ORDER.indexOf(player.orientation) + delta;
  if (nextSideIndex >= TURN_ORDER.length) {
    nextSideIndex = nextSideIndex % TURN_ORDER.length;
  } else if (nextSideIndex < 0) {
    nextSideIndex = TURN_ORDER.length + (nextSideIndex % TURN_ORDER.length);
  }

  return {
    ...player,
    orientation: TURN_ORDER[nextSideIndex],
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

  // const currentCell = orientCell(maze.cells[position.y][position.x], orientation);
  const currentCell = maze.cells[position.y][position.x];

  if (
    (delta > 0 && currentCell.walls[orientation]) ||
    (delta < 0 && currentCell.walls[OPPOSITE_LOCATION[orientation]])
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
