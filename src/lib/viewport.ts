import { TCell, TMaze, TOrientation } from './maze';
import { TPlayer } from './player';

const ROTATION: {
  [key in TOrientation]: { [key in TOrientation]: TOrientation };
} = {
  north: {
    north: 'north',
    south: 'south',
    west: 'west',
    east: 'east',
  },
  south: {
    north: 'south',
    south: 'north',
    west: 'east',
    east: 'west',
  },
  west: {
    north: 'west',
    south: 'east',
    west: 'south',
    east: 'north',
  },
  east: {
    north: 'east',
    south: 'west',
    west: 'north',
    east: 'south',
  },
};

export function orientCell(cell: TCell, orientation: TOrientation): TCell {
  return {
    ...cell,
    walls: {
      north: cell.walls[ROTATION[orientation].north],
      south: cell.walls[ROTATION[orientation].south],
      west: cell.walls[ROTATION[orientation].west],
      east: cell.walls[ROTATION[orientation].east],
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
    // return maze.cells[yIndex][xIndex]
  }

  if (orientation === 'north') {
    return [
      [getCell(-2, -1), getCell(-2, 0), getCell(-2, 1)],
      [getCell(-1, -1), getCell(-1, 0), getCell(-1, 1)],
      [getCell(0, -1), getCell(0, 0), getCell(0, 1)],
    ];
  }

  if (orientation === 'south') {
    return [
      [getCell(2, 1), getCell(2, 0), getCell(2, -1)],
      [getCell(1, 1), getCell(1, 0), getCell(1, -1)],
      [getCell(0, 1), getCell(0, 0), getCell(0, -1)],
    ];
  }

  if (orientation === 'east') {
    return [
      [getCell(-1, 2), getCell(0, 2), getCell(1, 2)],
      [getCell(-1, 1), getCell(0, 1), getCell(1, 1)],
      [getCell(-1, 0), getCell(0, 0), getCell(1, 0)],
    ];
  }

  if (orientation === 'west') {
    return [
      [getCell(1, -2), getCell(0, -2), getCell(-1, -2)],
      [getCell(1, -1), getCell(0, -1), getCell(-1, -1)],
      [getCell(1, 0), getCell(0, 0), getCell(-1, 0)],
    ];
  }

  throw new Error('Unknown orientation');
}
