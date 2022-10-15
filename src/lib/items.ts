import { JELLY_MAX, JELLY_MIN, FORWARD_DELTA, TPlayer } from './player';
import type { TCell, TMaze } from './maze';
import { TGame } from 'lib/game';
import { updateCell } from './maze';

export type TItemType =
  | 'key'
  | 'cake'
  | 'macaron'
  | 'treadmill'
  | 'monkey'
  | 'lion'
  | 'treasure';

export type TItem = {
  type: TItemType;
  message: {
    action: string;
    intro: string;
    activated: string | null;
    pass: string | null;
  };
  onActivate?: (game: TGame, itemCell: TCell) => TGame;
  onPass?: (player: TPlayer) => TPlayer;
};

const ITEMS: { [key in TItemType]: TItem } = {
  key: {
    type: 'key',
    message: {
      action: 'Pick up',
      intro: 'You found a key',
      activated: 'You got the key',
      pass: null,
    },
    onActivate: ({ player, maze }, itemCell) => ({
      maze: updateCell(itemCell, maze, cell => ({
        ...cell,
        item: null,
      })),
      player: {
        ...player,
        inventory: [...player.inventory, 'key'],
      },
    }),
  },
  cake: {
    type: 'cake',
    message: {
      action: 'Eat',
      intro: 'You see a cake',
      activated: 'Oops you feel how jelly grows...',
      pass: null,
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
      action: 'Consume',
      intro: 'You see a macaron... from Bizu',
      activated: 'Oops you feel how jelly grows...',
      pass: null,
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
      action: 'Use',
      intro: 'You see a treadmill',
      activated: 'Feels great! Jellies clearly got smaller',
      pass: '',
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
      action: 'Kagat',
      intro: 'You meet monkey',
      activated: 'Aaaaaaaaaaaa',
      pass: 'You hear: My mommy is the best mommy...',
    },
    onActivate: game => game,
  },
  lion: {
    type: 'lion',
    message: {
      action: 'Kiss',
      intro: 'You meet lion',
      activated: 'Ok lions lets you proceed to the writers club way',
      pass: 'Lion ordered wines again, you tried some champagne...',
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
      action: 'Open',
      intro: 'You see a chest',
      activated: null,
      pass: 'You probably want to return, there was a smell of gift',
    },
  },
};

export function getItemInFront(
  player: TPlayer,
  maze: TMaze,
):
  | { cell: TCell; item: TItem }
  | { cell: TCell; item: null }
  | { cell: null; item: null } {
  const {
    orientation,
    position: { x, y },
  } = player;

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
