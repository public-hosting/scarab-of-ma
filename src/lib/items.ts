import {
  JELLY_MAX,
  JELLY_MIN,
  FORWARD_DELTA,
  TPlayer,
  createPlayer,
} from './player';
import type { TCell, TMaze } from './maze';
import { createLevel, TGame } from 'lib/game';
import { updateCell } from './maze';

export type TItemType =
  | 'exit'
  | 'key'
  | 'cake'
  | 'macaron'
  | 'treadmill'
  | 'monkey'
  | 'lion'
  | 'treasure';

type TMessageCreator = (game: TGame) => string | null;

export type TItem = {
  type: TItemType;
  message: {
    action: TMessageCreator;
    intro: TMessageCreator;
    activated: TMessageCreator;
    pass: TMessageCreator;
  };
  onActivate?: (game: TGame, itemCell: TCell | null) => TGame;
  onPass?: (game: TGame) => TGame;
};

function removeCell(maze: TMaze, cell: TCell | null): TMaze {
  return cell
    ? updateCell(cell, maze, cell => ({
        ...cell,
        item: null,
      }))
    : maze;
}

const ITEMS: { [key in TItemType]: TItem } = {
  key: {
    type: 'key',
    message: {
      action: () => 'Pick up',
      intro: () => 'You found a key',
      activated: () => 'You got the key',
      pass: () => null,
    },
    onActivate: ({ player, maze, ...rest }, itemCell) => ({
      ...rest,
      maze: removeCell(maze, itemCell),
      player: {
        ...player,
        inventory: [...player.inventory, 'key'],
      },
    }),
  },
  exit: {
    type: 'exit',
    message: {
      action: ({ player }) =>
        player.inventory.includes('key') ? 'Open' : null,
      intro: ({ player }) =>
        player.inventory.includes('key')
          ? 'Seems your key might fit this lock'
          : 'You need some key to open this door',
      activated: () =>
        'The door slowly creaks open...and slams itself shut behind you!',
      pass: () => null,
    },
    onActivate: ({ player, level }) => ({
      level: level + 1,
      maze: createLevel(level + 1),
      player: {
        ...createPlayer(),
        jellyLevel: player.jellyLevel,
      },
    }),
  },
  cake: {
    type: 'cake',
    message: {
      action: () => 'Eat',
      intro: () => 'You see a cake',
      activated: () => 'Oops you feel how jelly grows...',
      pass: () => null,
    },
    onActivate: ({ player, maze, ...rest }, itemCell) => ({
      ...rest,
      maze: removeCell(maze, itemCell),
      player: {
        ...player,
        jellyLevel: Math.min(player.jellyLevel + 30, JELLY_MAX),
      },
    }),
  },
  macaron: {
    type: 'macaron',
    message: {
      action: () => 'Consume',
      intro: () => 'You see a macaron... from Bizu',
      activated: () => 'Oops you feel how jelly grows...',
      pass: () => null,
    },
    onActivate: ({ player, maze, ...rest }, itemCell) => ({
      ...rest,
      maze: removeCell(maze, itemCell),
      player: {
        ...player,
        jellyLevel: Math.min(player.jellyLevel + 15, JELLY_MAX),
      },
    }),
  },
  treadmill: {
    type: 'treadmill',
    message: {
      action: () => 'Use',
      intro: () => 'You see a treadmill',
      activated: () => 'Feels great! Jellies clearly got smaller',
      pass: () => '',
    },
    onActivate: ({ player, ...rest }) => ({
      ...rest,
      player: {
        ...player,
        jellyLevel: Math.max(player.jellyLevel - 3, JELLY_MIN),
      },
    }),
  },
  monkey: {
    type: 'monkey',
    message: {
      action: () => 'Kagat',
      intro: () => 'You meet monkey',
      activated: () => 'Aaaaaaaaaaaaaaaaaaa',
      pass: () => 'You hear: My mommy is the best mommy...',
    },
    onActivate: ({ maze, ...rest }, itemCell) => ({
      ...rest,
      maze: removeCell(maze, itemCell),
    }),
  },
  lion: {
    type: 'lion',
    message: {
      action: () => 'Kiss',
      intro: () => 'You meet lion',
      activated: () => 'Ok lions lets you proceed to the writers club way',
      pass: () => 'Lion ordered wines again, you tried some champagne...',
    },
    onActivate: ({ maze, ...rest }, itemCell) => ({
      ...rest,
      maze: removeCell(maze, itemCell),
    }),
    onPass: ({ player, ...rest }) => ({
      ...rest,
      player: {
        ...player,
        jellyLevel: Math.min(player.jellyLevel + 15, JELLY_MAX),
      },
    }),
  },
  treasure: {
    type: 'treasure',
    message: {
      action: () => 'Open',
      intro: () => 'You see a chest',
      activated: () => null,
      pass: () => 'You probably want to return, there was a smell of gift',
    },
    onActivate: ({ player, ...rest }) => ({
      ...rest,
      player: {
        ...player,
        inventory: [...player.inventory, 'gift'],
      },
    }),
  },
};

export function getItemInFront(
  player: TPlayer,
  maze: TMaze,
): { cell: TCell | null; item: TItem | null } {
  const {
    orientation,
    position: { x, y },
  } = player;

  // kind of hack to make open button appear when user reach exit instead of one cell in advance
  const currentCell = maze.cells[y][x];
  if (currentCell.walls[orientation]?.type === 'exit') {
    return {
      cell: null,
      item: ITEMS.exit,
    };
  }

  // player looking at wall
  if (maze.cells[y][x].walls[player.orientation]) {
    return {
      cell: null,
      item: null,
    };
  }

  const frontItemDelta = FORWARD_DELTA[orientation];
  const frontCell = maze.cells[y + frontItemDelta.y]?.[x + frontItemDelta.x];
  const frontItemType = frontCell?.item;

  return {
    cell: frontCell,
    item: frontItemType ? ITEMS[frontItemType] : null,
  };
}

export function getCurrentItem(player: TPlayer, maze: TMaze): TItem | null {
  const {
    position: { x, y },
  } = player;

  const currentCell = maze.cells[y][x];
  const itemType = currentCell.item;

  return itemType ? ITEMS[itemType] : null;
}
