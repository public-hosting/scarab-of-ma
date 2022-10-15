import { Fragment, useState } from 'react';
import { Cell } from 'components/Cell/Cell';
import { Map } from 'components/Map/Map';
import { useGlobalDOMEvents } from 'hooks/useGlobalDOMEvents';
import { createMaze, TMaze } from 'lib/maze';
import { createPlayer, turnPlayer, movePlayer, TPlayer } from 'lib/player';
import { createDisplay, getViewportCells } from 'lib/viewport';
import { getItemInFront } from 'lib/items';
import { TGame } from 'lib/game';

const display = createDisplay({ y: 4, x: 5 });

export const Root = () => {
  const [{ player, maze }, setGameState] = useState<TGame>(() => ({
    maze: createMaze(2),
    player: createPlayer(),
  }));
  const viewportCells = getViewportCells(player, maze, display);
  const { item, cell } = getItemInFront(player, maze);

  const handleItemActivate = () => {
    const { onActivate } = item || {};
    if (item && onActivate) {
      setGameState(state => onActivate(state, cell));
    }
  };

  const handleTurnLeft = () => {
    setGameState(state => ({
      ...state,
      player: turnPlayer(player, 'ccw'),
    }));
  };

  const handleTurnRight = () => {
    setGameState(state => ({
      ...state,
      player: turnPlayer(player, 'cw'),
    }));
  };

  const handleGoForward = () => {
    setGameState(state => ({
      ...state,
      player: movePlayer(player, maze, 1),
    }));
  };

  const handleGoBackward = () => {
    setGameState(state => ({
      ...state,
      player: movePlayer(player, maze, -1),
    }));
  };

  useGlobalDOMEvents({
    keydown: event => {
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
          {row.map((cellPosition, x) => {
            const cell = viewportCells[y][x];
            if (!cell) {
              return null;
            }

            return (
              <Cell
                key={`global(${cell.y},${cell.x})`}
                cell={cell}
                position={cellPosition}
                neighbors={{
                  north: viewportCells[y - 1]?.[x] || null,
                  south: viewportCells[y + 1]?.[x] || null,
                  east: viewportCells[y]?.[x + 1] || null,
                  west: viewportCells[y]?.[x - 1] || null,
                }}
              />
            );
          })}
        </Fragment>
      ))}
      <Map player={player} maze={maze} />

      <div className="controls">
        <div className="controls__row">
          <button
            type="button"
            tabIndex={-1}
            className="controls__item controls__item_forward"
            onClick={handleGoForward}
          />
          {item && (
            <button
              type="button"
              tabIndex={-1}
              className="controls__item controls__item_context"
              onClick={handleItemActivate}
            >
              {item.message.action}
            </button>
          )}
        </div>
        <div className="controls__row">
          <button
            type="button"
            className="controls__item controls__item_left"
            onClick={handleTurnLeft}
            tabIndex={-1}
          />
          <button
            type="button"
            tabIndex={-1}
            className="controls__item controls__item_backward"
            onClick={handleGoBackward}
          />
          <button
            type="button"
            tabIndex={-1}
            className="controls__item controls__item_right"
            onClick={handleTurnRight}
          />
        </div>
      </div>
    </>
  );
};
