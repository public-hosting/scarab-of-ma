import { TPlayer } from './player';
import { TMaze, createMaze, TCell, TWall } from './maze';
import type { TItemType } from './items';
import { times } from './utils';

export type TGame = {
  player: TPlayer;
  maze: TMaze;
  level: number;
};

type TLevelItemCount = {
  [key in TItemType]?: number;
};

type TLevel = {
  size: number;
  itemsCount: TLevelItemCount;
};

export const LEVELS: TLevel[] = [
  {
    size: 3,
    itemsCount: {
      key: 1,
      exit: 1,
      macaron: 1,
    },
  },
  {
    size: 4,
    itemsCount: {
      key: 1,
      exit: 1,
      cake: 1,
      treadmill: 1,
      monkey: 1,
    },
  },
  {
    size: 5,
    itemsCount: {
      cake: 1,
      macaron: 2,
      treadmill: 1,
      monkey: 2,
      lion: 1,
      treasure: 1,
    },
  },
];

function getFirstExistingWall(cell: TCell): TWall {
  const existingWalls = Object.values(cell.walls).flatMap(maybeWall =>
    maybeWall ? [maybeWall] : [],
  );
  if (existingWalls.length === 0) {
    throw new Error('Cell has no walls');
  }

  return existingWalls[0];
}

// mutates `maze`
function placeItem(maze: TMaze, type: TItemType): void {
  const maxCoord = maze.size - 1;

  // workaround for exit
  if (type === 'exit') {
    maze.cells[maxCoord]![maxCoord]!.walls.south!.type = 'exit';

    return;
  }

  // hardcode treasure to furthest coord
  if (type === 'treasure') {
    maze.cells[maxCoord]![maxCoord].item = type;

    return;
  }

  const itemX = Math.round(Math.random() * maxCoord);
  const itemY = Math.round(Math.random() * maxCoord);

  const randomCell = maze.cells[itemY][itemX];
  const wallTypes = Object.values(randomCell.walls).flatMap(x =>
    x ? [x.type] : [],
  );

  if (
    wallTypes.includes('start') ||
    wallTypes.includes('exit') ||
    randomCell.item
  ) {
    placeItem(maze, type);
  } else {
    randomCell.item = type;
  }
}

function placeItems(maze: TMaze, itemsCount: TLevelItemCount): TMaze {
  // mark start
  getFirstExistingWall(maze.cells[0][0]).type = 'start';

  (Object.entries(itemsCount) as [TItemType, number][]).forEach(
    ([type, count]) => {
      times(count, () => {
        placeItem(maze, type);
      });
    },
  );

  return maze;
}

export function createLevel(level: number): TMaze {
  const levelInfo = LEVELS[level];
  if (!levelInfo) {
    throw new Error(`Level ${level} is not defined`);
  }

  const maze = createMaze(levelInfo.size);

  return placeItems(maze, levelInfo.itemsCount);
}
