import { Fragment, useEffect, useState } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import { Cell } from 'components/Cell/Cell';
import { Map } from 'components/Map/Map';
import { StatusBar } from 'components/StatusBar/StatusBar';

import { useGlobalDOMEvents } from 'hooks/useGlobalDOMEvents';
import { useMessaging } from 'hooks/useMessaging';

import { getNeighbors } from 'lib/maze';
import { createPlayer, turnPlayer, movePlayer } from 'lib/player';
import { createDisplay, getViewportCells } from 'lib/viewport';
import { getCurrentItem, getItemInFront } from 'lib/items';
import { TGame, createLevel } from 'lib/game';

const display = createDisplay({ y: 4, x: 5 });

export const Root = () => {
  const [game, setGameState] = useState<TGame>(() => ({
    level: 0,
    maze: createLevel(0),
    player: createPlayer(),
  }));
  const [isMapVisible, setIsMapVisible] = useState(false);
  const { message, sendMessage } = useMessaging();
  const { player, maze } = game;
  const viewportCells = getViewportCells(player, maze, display);
  const { item, cell } = getItemInFront(player, maze);
  const currentItem = getCurrentItem(player, maze);

  useEffect(() => {
    if (item) {
      const message = item.message.intro(game);
      if (message) {
        sendMessage(message);
      }
    }
  }, [item]);

  useEffect(() => {
    if (currentItem) {
      const { onPass } = currentItem;
      if (onPass) {
        setGameState(state => onPass(state));
      }

      const message = currentItem.message.pass(game);
      if (message) {
        sendMessage(message);
      }
    }
  }, [currentItem]);

  const handleItemActivate = () => {
    const { onActivate } = item || {};
    if (item && onActivate) {
      setGameState(state => onActivate(state, cell));
      const activateMessage = item.message.activated(game);
      if (activateMessage) {
        sendMessage(activateMessage);
      }
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
                key={x}
                cell={cell}
                position={cellPosition}
                neighbors={getNeighbors({ x, y }, viewportCells)}
              />
            );
          })}
        </Fragment>
      ))}

      <TransitionGroup>
        {message && (
          <CSSTransition key={message} classNames="message" timeout={2000}>
            <div className="message">{message}</div>
          </CSSTransition>
        )}
      </TransitionGroup>

      {isMapVisible && <Map player={player} maze={maze} />}

      <StatusBar inventory={player.inventory} jellyLevel={player.jellyLevel} />

      <div className="controls controls_top">
        <button
          type="button"
          tabIndex={-1}
          className="controls__item controls__item_mini controls__item_sound_on"
        />
        <button
          type="button"
          tabIndex={-1}
          className="controls__item controls__item_mini controls__item_map"
          onClick={() => setIsMapVisible(x => !x)}
        />
      </div>

      <div className="controls">
        <div className="controls__row">
          <button
            type="button"
            tabIndex={-1}
            className="controls__item controls__item_forward"
            onClick={handleGoForward}
          />
          {item && item.message.action(game) && (
            <button
              type="button"
              tabIndex={-1}
              className="controls__item controls__item_context"
              onClick={handleItemActivate}
            >
              {item.message.action(game)}
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
