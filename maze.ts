/**
 * UTILS
 * --------------------------------------------------------------------------
 */

export function times<T>(n: number, act: (i: number) => T): T[] {
  const result = [];

  for (let i = 0; i < n; i++) {
    result.push(act(i));
  }

  return result;
}

/**
 * MAZE
 * --------------------------------------------------------------------------
 */

type TWallType = 'plain' | 'exit';

type TWall = {
  type: TWallType;
};

type TWallLocation = 'left' | 'right' | 'top' | 'bottom';

type TCoords = {
  x: number;
  y: number;
};

type TCell = TCoords & {
  walls: {
    [key in TWallLocation]: TWall | null;
  };
};

type TMaze = {
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

function getNeighborTop(cell: TCell, maze: TMaze): TCell | null {
  return getNeighbor(cell, maze, { x: 0, y: -1 });
}

function getNeighborBottom(cell: TCell, maze: TMaze): TCell | null {
  return getNeighbor(cell, maze, { x: 0, y: 1 });
}

function getNeighborLeft(cell: TCell, maze: TMaze): TCell | null {
  return getNeighbor(cell, maze, { x: -1, y: 0 });
}

function getNeighborRight(cell: TCell, maze: TMaze): TCell | null {
  return getNeighbor(cell, maze, { x: 1, y: 0 });
}

function createCell(coords: { x: number; y: number }): TCell {
  return {
    ...coords,
    walls: {
      left: createWall(),
      right: createWall(),
      top: createWall(),
      bottom: createWall(),
    },
  };
}

function fillCells(size: number): TMaze {
  return {
    size,
    cells: times(size, y => times(size, x => createCell({ x, y }))),
  };
}

const OPPOSITE_LOCATION: { [key in TWallLocation]: TWallLocation } = {
  top: 'bottom',
  bottom: 'top',
  right: 'left',
  left: 'right',
};

function createMaze(maze: TMaze): TMaze {
  const startCell: TCell = maze.cells[0][0];
  const visitedCells = new Set<TCell>([startCell]);
  const stack: TCell[] = [startCell];

  while (stack.length > 0) {
    const currentCell = stack.pop()!;

    const neighbors = Object.entries({
      top: getNeighborTop(currentCell, maze),
      bottom: getNeighborBottom(currentCell, maze),
      right: getNeighborRight(currentCell, maze),
      left: getNeighborLeft(currentCell, maze),
    }) as [TWallLocation, TCell | null][];
    const nonVisitedNeighbors = neighbors.flatMap(([side, cell]) =>
      (cell && !visitedCells.has(cell)) ? [{ side, cell }] : [],
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
    randomNeighbor.cell.walls[OPPOSITE_LOCATION[randomNeighbor.side]] = null;
    visitedCells.add(randomNeighbor.cell);

    stack.push(randomNeighbor.cell);
  }

  return maze;
}

/**
 * UI
 * ----------------------------------------------------------------------------
 */

function renderLine(row: TCell[], type: 'start' | 'middle' | 'end'): string {
  if (type === 'start') {
    return row.map(cell => (cell.walls.top ? ' – ' : ' • ')).join('');
  } else if (type === 'middle') {
    return row
      .map(
        cell =>
          `${cell.walls.left ? '|' : '•'}■${cell.walls.right ? '|' : '•'}`,
      )
      .join('');
  } else if (type === 'end') {
    return row.map(cell => (cell.walls.bottom ? ' - ' : ' • ')).join('');
  } else {
    throw new Error('Unknown line type');
  }
}

function renderMaze(maze: TMaze): string {
  return maze.cells
    .map(row => {
      return `${renderLine(row, 'start')}\n${renderLine(
        row,
        'middle',
      )}\n${renderLine(row, 'end')}\n`;
    })
    .join('');
}

console.log(renderMaze(createMaze(fillCells(6))));
