import { TCell, TCoords, TMaze } from './maze';
import { TOrientation } from './orientation';
import { TPlayer } from './player';
import { times } from './utils';

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

// function transpose<T>(matrix: T[][]): T[][] {
//   const rows = matrix.length;
//   const cols = matrix[0].length;
//   const grid = [];
//
//   for (let j = 0; j < cols; j++) {
//     grid[j] = Array(rows);
//   }
//
//   for (let i = 0; i < rows; i++) {
//     for (let j = 0; j < cols; j++) {
//       grid[j][i] = matrix[i][j];
//     }
//   }
//
//   return grid;
// }
//
// function reverseEachRow<T>(matrix: T[][]): T[][] {
//   return matrix.map(row => row.reverse());
// }
//
// function reverseEachCol<T>(matrix: T[][]): T[][] {
//   return matrix.reverse();
// }
//
// function pickMatrix<T>(start: TCoords, size: TCoords, source: T[][]): (T | null)[][] {
//   return times(size.y, y =>
//     times(size.x, x => source[start.y + y]?.[start.x + x]) || null,
//   );
// }

export function getViewportCells(
  player: TPlayer,
  maze: TMaze,
  _display: TDisplay,
): (TCell | null)[][] {
  const {
    position: { x: playerX, y: playerY },
    orientation,
  } = player;

  // const displaySizeY = display.length;
  // const displaySizeX = display[0].length;

  function getCell(dY: number, dX: number): TCell | null {
    const yIndex = playerY + dY;
    const xIndex = playerX + dX;
    const cell = maze.cells[yIndex]?.[xIndex];
    if (!cell) {
      return null;
    }

    return orientCell(cell, orientation);
  }

  if (orientation === 'north') {
    // prettier-ignore
    return [
      [getCell(-3, -2), getCell(-3, -1), getCell(-3, 0), getCell(-3, 1), getCell(-3, 2)],
      [getCell(-2, -2), getCell(-2, -1), getCell(-2, 0), getCell(-2, 1), getCell(-2, 2)],
      [getCell(-1, -2), getCell(-1, -1), getCell(-1, 0), getCell(-1, 1), getCell(-1, 2)],
      [getCell(0, -2),  getCell(0, -1), getCell(0, 0), getCell(0, 1), getCell(0, 2)],
    ];
  }

  if (orientation === 'south') {
    // prettier-ignore
    return [
      [getCell(3, 2), getCell(3, 1), getCell(3, 0), getCell(3, -1), getCell(3, -2)],
      [getCell(2, 2), getCell(2, 1), getCell(2, 0), getCell(2, -1), getCell(2, -2)],
      [getCell(1, 2), getCell(1, 1), getCell(1, 0), getCell(1, -1), getCell(1, -2)],
      [getCell(0, 2), getCell(0, 1), getCell(0, 0), getCell(0, -1), getCell(0, -2)],
    ];
  }

  if (orientation === 'east') {
    // prettier-ignore
    return [
      [getCell(-2, 3), getCell(-1, 3), getCell(0, 3), getCell(1, 3), getCell(2, 3)],
      [getCell(-2, 2), getCell(-1, 2), getCell(0, 2), getCell(1, 2), getCell(2, 2)],
      [getCell(-2, 1), getCell(-1, 1), getCell(0, 1), getCell(1, 1), getCell(2, 1)],
      [getCell(-2, 0), getCell(-1, 0), getCell(0, 0), getCell(1, 0), getCell(2, 0)],
    ];
  }

  if (orientation === 'west') {
    // prettier-ignore
    return [
      [getCell(2, -3), getCell(1, -3), getCell(0, -3), getCell(-1, -3), getCell(-2, -3)],
      [getCell(2, -2), getCell(1, -2), getCell(0, -2), getCell(-1, -2), getCell(-2, -2)],
      [getCell(2, -1), getCell(1, -1), getCell(0, -1), getCell(-1, -1), getCell(-2, -1)],
      [getCell(2, 0),  getCell(1, 0), getCell(0, 0), getCell(-1, 0), getCell(-2, 0)],
    ];
  }

  throw new Error('Unknown orientation');
}

type TDisplay = TCoords[][];

/**
 * @example for size 3x3
 *
 * [{ x: -1, y: -2 }, { x: 0, y: -2 }, { x: 1, y: -2 }],
 * [{ x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 }],
 * [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }],
 *
 * TODO
 * Display should be specified like this to avoid rendering always invisible cells
 * [
 *   [0, 1, 1, 1, 0]
 *   [1, 1, 1, 1, 1]
 *   [0, 0, 1, 0, 0]
 * ]
 */
export function createDisplay(size: TCoords): TDisplay {
  if (size.x % 2 !== 1) {
    throw new Error('only uneven display width supported');
  }

  const cellsOnSide = (size.x - 1) / 2;

  return times(size.y, y =>
    times(size.x, x => ({
      y: y - (size.y - 1),
      x: x - cellsOnSide,
    })),
  );
}
