import { Fragment, useState } from 'react';
import { Cell } from 'components/Cell/Cell';
import { Map } from 'components/Map/Map';
import { useGlobalDOMEvents } from 'hooks/useGlobalDOMEvents';
import { createMaze } from 'lib/maze';
import { createPlayer, turnPlayer, movePlayer } from 'lib/player';
import { createDisplay, getViewportCells } from 'lib/viewport';

const maze = createMaze(2);
const initialPlayer = createPlayer();
const display = createDisplay({ y: 4, x: 5 });

export const Root = () => {
  const [player, setPlayer] = useState(initialPlayer);
  const viewportCells = getViewportCells(player, maze, display);

  const handleTurnLeft = () => {
    setPlayer(turnPlayer(player, 'ccw'));
  };

  const handleTurnRight = () => {
    setPlayer(turnPlayer(player, 'cw'));
  };

  const handleGoForward = () => {
    setPlayer(movePlayer(player, maze, 1));
  };

  const handleGoBackward = () => {
    setPlayer(movePlayer(player, maze, -1));
  };

  useGlobalDOMEvents({
    keydown: event => {
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
    },
  });

  return (
    <>
      {display.map((row, y) => (
        <Fragment key={y}>
          {row.map((cellPosition, x) => (
            <Cell
              key={x}
              cell={viewportCells[y][x]}
              position={cellPosition}
              neighbors={{
                north: viewportCells[y - 1]?.[x] || null,
                south: viewportCells[y + 1]?.[x] || null,
                east: viewportCells[y]?.[x + 1] || null,
                west: viewportCells[y]?.[x - 1] || null,
              }}
            />
          ))}
        </Fragment>
      ))}
      <Map player={player} maze={maze} />
      <div className="controls">
        <button
          type="button"
          className="controls__item"
          onClick={handleTurnLeft}
          tabIndex={-1}
        >
          {'<'}
        </button>
        <button
          type="button"
          className="controls__item"
          onClick={handleGoForward}
          tabIndex={-1}
        >
          ^
        </button>
        <button
          type="button"
          className="controls__item"
          onClick={handleTurnRight}
          tabIndex={-1}
        >
          {'>'}
        </button>
      </div>
    </>
  );
};
