import { Fragment } from 'react';
import { Cell } from 'components/Cell/Cell';
import { createMaze, TCell, TCoords, TMaze, TOrientation } from 'lib/maze';
import { createPlayer, TPlayer } from 'lib/player';

const maze = createMaze(4);
const player = createPlayer();

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

function orientCell(cell: TCell, orientation: TOrientation): TCell {
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

/**
 *
 *
 *
 */
function getViewportCells(player: TPlayer, maze: TMaze): (TCell | null)[][] {
  const {
    position: { x: playerX, y: playerY },
  } = player;

  const centralCell = maze.cells[playerY][playerX];

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

    return orientCell(maze.cells[yIndex][xIndex], player.orientation);
  }

  return [
    [getCell(2, 1), getCell(2, 0), getCell(2, -1)],
    [getCell(1, 1), getCell(1, 0), getCell(1, -1)],
    [getCell(0, 1), getCell(0, 0), getCell(0, -1)],
  ];
}

// prettier-ignore
const DISPLAY: TCoords[][] = [
  [{ x: -1, y: -2 }, { x: 0, y: -2 }, { x: 1, y: -2 }],
  [{ x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 }],
  [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }],
];

export const Root = () => {
  const viewportCells = getViewportCells(player, maze);

  return (
    <>
      {DISPLAY.map((row, rowIndex) => (
        <Fragment key={rowIndex}>
          {row.map((cellPosition, cellIndex) => (
            <Cell
              key={cellIndex}
              cell={viewportCells[rowIndex][cellIndex]}
              position={cellPosition}
            />
          ))}
        </Fragment>
      ))}
    </>
  );
};
