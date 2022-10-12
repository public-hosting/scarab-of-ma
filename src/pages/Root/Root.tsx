import { Fragment, KeyboardEvent, useState } from 'react';
import { Cell } from 'components/Cell/Cell';
import { Map } from 'components/Map/Map';
import { createMaze, TCoords } from 'lib/maze';
import { createPlayer, turnPlayer, movePlayer } from 'lib/player';
import { getViewportCells } from 'lib/viewport';

const maze = createMaze(4);
const initialPlayer = createPlayer();

// prettier-ignore
const DISPLAY: TCoords[][] = [
  [{ x: -1, y: -2 }, { x: 0, y: -2 }, { x: 1, y: -2 }],
  [{ x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 }],
  [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }],
];

export const Root = () => {
  const [player, setPlayer] = useState(initialPlayer);
  const viewportCells = getViewportCells(player, maze);

  const handleTurnLeft = () => {
    setPlayer(turnPlayer(player, -1));
  };

  const handleTurnRight = () => {
    setPlayer(turnPlayer(player, 1));
  };

  const handleGoForward = () => {
    setPlayer(movePlayer(player, maze, 1));
  };

  const handleGoBackward = () => {
    setPlayer(movePlayer(player, maze, -1));
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    event.preventDefault();

    if (event.key === 'ArrowLeft') {
      handleTurnLeft();
    } else if (event.key === 'ArrowRight') {
      handleTurnRight();
    } else if (event.key === 'ArrowUp') {
      handleGoForward();
    } else if (event.key === 'ArrowDown') {
      handleGoBackward();
    }
  };

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
      <Map player={player} maze={maze} />
      <div className="controls">
        <input
          className="controls__capture"
          onKeyDown={handleKeyPress}
          tabIndex={-1}
          autoFocus={true}
        />
        <button
          type="button"
          className="controls__item"
          onClick={handleTurnLeft}
        >
          {'<'}
        </button>
        <button
          type="button"
          className="controls__item"
          onClick={handleGoForward}
        >
          ^
        </button>
        <button
          type="button"
          className="controls__item"
          onClick={handleTurnRight}
        >
          {'>'}
        </button>
      </div>
    </>
  );
};
