import { times } from './utils';
import { TOrientation, OPPOSITE_SIDE } from './orientation';
import { TItemType } from './items';

export type TCoords = {
  x: number;
  y: number;
};

export type TWallType = 'plain' | 'exit' | 'start';

export type TWall = {
  type: TWallType;
};

export type TCell = TCoords & {
  walls: {
    [key in TOrientation]: TWall | null;
  };
  item: TItemType | null;
};

export type TMaze = {
  size: number;
  cells: TCell[][];
};

function createWall(type: TWallType = 'plain'): TWall {
  return {
    type,
  };
}

function getNeighbor(cell: TCell, maze: TMaze, delta: TCoords): TCell | null {
  const neighborX = cell.x + delta.x;
  const neighborY = cell.y + delta.y;

  return maze.cells[neighborY]?.[neighborX] || null;
}

function getNeighborNorth(cell: TCell, maze: TMaze): TCell | null {
  return getNeighbor(cell, maze, { x: 0, y: -1 });
}

function getNeighborSouth(cell: TCell, maze: TMaze): TCell | null {
  return getNeighbor(cell, maze, { x: 0, y: 1 });
}

function getNeighborWest(cell: TCell, maze: TMaze): TCell | null {
  return getNeighbor(cell, maze, { x: -1, y: 0 });
}

function getNeighborEast(cell: TCell, maze: TMaze): TCell | null {
  return getNeighbor(cell, maze, { x: 1, y: 0 });
}

function createCell(coords: { x: number; y: number }): TCell {
  return {
    ...coords,
    walls: {
      west: createWall(),
      east: createWall(),
      north: createWall(),
      south: createWall(),
    },
    item: null,
  };
}

function fillCells(size: number): TMaze {
  return {
    size,
    cells: times(size, y => times(size, x => createCell({ x, y }))),
  };
}

export function createMazePaths(maze: TMaze): TMaze {
  const startCell: TCell = maze.cells[0][0];
  const visitedCells = new Set<TCell>([startCell]);
  const stack: TCell[] = [startCell];

  while (stack.length > 0) {
    const currentCell = stack.pop()!;

    const neighbors = Object.entries({
      north: getNeighborNorth(currentCell, maze),
      south: getNeighborSouth(currentCell, maze),
      east: getNeighborEast(currentCell, maze),
      west: getNeighborWest(currentCell, maze),
    }) as [TOrientation, TCell | null][];
    const nonVisitedNeighbors = neighbors.flatMap(([side, cell]) =>
      cell && !visitedCells.has(cell) ? [{ side, cell }] : [],
    );

    if (nonVisitedNeighbors.length === 0) {
      continue;
    }

    stack.push(currentCell);

    const randomNeighborIndex = Math.round(
      Math.random() * (nonVisitedNeighbors.length - 1),
    );
    const randomNeighbor = nonVisitedNeighbors[randomNeighborIndex];

    currentCell.walls[randomNeighbor.side] = null;
    randomNeighbor.cell.walls[OPPOSITE_SIDE[randomNeighbor.side]] = null;
    visitedCells.add(randomNeighbor.cell);

    stack.push(randomNeighbor.cell);
  }

  return maze;
}

function getFirstExistingWall(cell: TCell): TWall {
  const existingWalls = Object.values(cell.walls).flatMap(maybeWall =>
    maybeWall ? [maybeWall] : [],
  );
  if (existingWalls.length === 0) {
    throw new Error('Cell has no walls');
  }

  return existingWalls[0];
}

function placeItems(maze: TMaze): TMaze {
  const maxCoord = maze.size - 1;

  // start
  getFirstExistingWall(maze.cells[0][0]).type = 'start';

  // exit
  getFirstExistingWall(maze.cells[maxCoord][maxCoord]).type = 'exit';

  // key
  const keyX = Math.round(Math.random() * (maxCoord - 2)) + 1;
  const keyY = Math.round(Math.random() * (maxCoord - 2)) + 1;
  maze.cells[keyY][keyX].item = 'key';

  return maze;
}

export function createMaze(size: number): TMaze {
  return placeItems(createMazePaths(fillCells(size)));
}

export function updateCell(
  coords: TCoords,
  maze: TMaze,
  updater: (cell: TCell) => TCell,
): TMaze {
  return {
    ...maze,
    cells: maze.cells.map((row, y) =>
      y === coords.y
        ? row.map((cell, x) => (x === coords.x ? updater(cell) : cell))
        : row,
    ),
  };
}
