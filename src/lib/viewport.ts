import { TCell, TMaze, TOrientation } from './maze';
import { TPlayer } from './player';

const ROTATION: {
  [key in TOrientation]: { [key in TOrientation]: TOrientation };
} = {
  north: {
    north: 'south',
    south: 'north',
    west: 'east',
    east: 'west',
  },
  south: {
    north: 'north',
    south: 'south',
    west: 'west',
    east: 'east',
  },
  west: {
    north: 'east',
    south: 'west',
    west: 'north',
    east: 'south',
  },
  east: {
    north: 'west',
    south: 'east',
    west: 'south',
    east: 'north',
  },
};

export function orientCell(cell: TCell, orientation: TOrientation): TCell {
  return {
    ...cell,
    walls: {
      [ROTATION[orientation].north]: cell.walls.north,
      [ROTATION[orientation].south]: cell.walls.south,
      [ROTATION[orientation].east]: cell.walls.east,
      [ROTATION[orientation].west]: cell.walls.west,
    },
  };
}

export function getViewportCells(player: TPlayer, maze: TMaze): (TCell | null)[][] {
  const {
    position: { x: playerX, y: playerY },
    orientation,
  } = player;

  function getCell(dY: number, dX: number): TCell | null {
    const yIndex = playerY + dY;
    const xIndex = playerX + dX;
    if (
      yIndex < 0 ||
      xIndex < 0 ||
      yIndex >= maze.size ||
      xIndex >= maze.size
    ) {
      return null;
    }

    return orientCell(maze.cells[yIndex][xIndex], orientation);
  }

  if (orientation === 'north') {
    return [
      [getCell(2, 1), getCell(2, 0), getCell(2, -1)],
      [getCell(1, 1), getCell(1, 0), getCell(1, -1)],
      [getCell(0, 1), getCell(0, 0), getCell(0, -1)],
    ];
  }

  if (orientation === 'south') {
    return [
      [getCell(-2, -1), getCell(-2, 0), getCell(-2, 1)],
      [getCell(-1, -1), getCell(-1, 0), getCell(-1, 1)],
      [getCell(0, -1), getCell(0, 0), getCell(0, 1)],
    ];
  }

  if (orientation === 'east') {
    return [
      [getCell(-1, -2), getCell(0, -2), getCell(1, -2)],
      [getCell(-1, -1), getCell(0, -1), getCell(1, -1)],
      [getCell(-1, 0), getCell(0, 0), getCell(1, 0)],
    ];
  }

  if (orientation === 'west') {
    return [
      [getCell(-1, 2), getCell(0, 2), getCell(1, 2)],
      [getCell(-1, 1), getCell(0, 1), getCell(1, 1)],
      [getCell(-1, 0), getCell(0, 0), getCell(1, 0)],
    ];
  }

  throw new Error('Unknown orientation');
}
