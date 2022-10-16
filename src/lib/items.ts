import {
  JELLY_MAX,
  JELLY_MIN,
  FORWARD_DELTA,
  TPlayer,
  createPlayer,
} from './player';
import type { TCell, TMaze } from './maze';
import { TGame } from 'lib/game';
import { createMaze, updateCell } from './maze';

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
  onPass?: (player: TPlayer) => TPlayer;
};

const ITEMS: { [key in TItemType]: TItem } = {
  key: {
    type: 'key',
    message: {
      action: () => 'Pick up',
      intro: () => 'You found a key',
      activated: () => 'You got the key',
      pass: () => null,
    },
    onActivate: ({ player, maze }, itemCell) => ({
      maze: itemCell
        ? updateCell(itemCell, maze, cell => ({
            ...cell,
            item: null,
          }))
        : maze,
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
    onActivate: ({ player, maze }) => ({
      maze: createMaze(maze.size + 1),
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
    onActivate: ({ player, ...rest }) => ({
      ...rest,
      player: {
        ...player,
        jellyLevel: Math.max(player.jellyLevel + 25, JELLY_MAX),
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
    onActivate: ({ player, ...rest }) => ({
      ...rest,
      player: {
        ...player,
        jellyLevel: Math.max(player.jellyLevel + 15, JELLY_MAX),
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
        jellyLevel: Math.min(player.jellyLevel - 5, JELLY_MIN),
      },
    }),
  },
  monkey: {
    type: 'monkey',
    message: {
      action: () => 'Kagat',
      intro: () => 'You meet monkey',
      activated: () => 'Aaaaaaaaaaaa',
      pass: () => 'You hear: My mommy is the best mommy...',
    },
    onActivate: game => game,
  },
  lion: {
    type: 'lion',
    message: {
      action: () => 'Kiss',
      intro: () => 'You meet lion',
      activated: () => 'Ok lions lets you proceed to the writers club way',
      pass: () => 'Lion ordered wines again, you tried some champagne...',
    },
    onActivate: ({ player, ...rest }) => ({
      ...rest,
      player: {
        ...player,
        jellyLevel: Math.max(player.jellyLevel + 15, JELLY_MAX),
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

  // kind of hack to make open button appear properly
  const maxCoord = maze.size - 1;
  if (x === maxCoord && y === maxCoord && orientation === 'south') {
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
