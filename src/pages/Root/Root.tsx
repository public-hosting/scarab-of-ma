import { Fragment, useEffect, useState } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import { Cell } from 'components/Cell/Cell';
import { Map } from 'components/Map/Map';
import { StatusBar } from 'components/StatusBar/StatusBar';
import { Raffle } from 'components/Raffle/Raffle';

import { useGlobalDOMEvents } from 'hooks/useGlobalDOMEvents';
import { useMessaging } from 'hooks/useMessaging';
import {
  useStatePersist,
  getPersistedState,
  clearPersistedState,
} from 'hooks/useStatePersist';

import { getNeighbors } from 'lib/maze';
import { createPlayer, turnPlayer, movePlayer } from 'lib/player';
import { createDisplay, getViewportCells } from 'lib/viewport';
import { getCurrentItem, getItemInFront } from 'lib/items';
import { TGame, createLevel } from 'lib/game';
import { classNames } from 'lib/classNames';

const display = createDisplay({ y: 3, x: 5 });

export const Root = () => {
  const [game, setGameState] = useState<TGame>(
    () =>
      getPersistedState() || {
        level: 0,
        maze: createLevel(0),
        player: createPlayer(),
        isStarted: false,
      },
  );
  const [isMapVisible, setIsMapVisible] = useState(false);
  const { message, sendMessage } = useMessaging();
  const [audio] = useState(() => new Audio('./audio.mp3'));
  const [isPlaying, setIsPlaying] = useState(false);
  const { player, maze, isStarted } = game;
  const viewportCells = getViewportCells(player, maze, display);
  const { item, cell } = getItemInFront(player, maze);
  const currentItem = getCurrentItem(player, maze);
  const hasGift = player.inventory.includes('gift');

  useStatePersist(game);

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

  const handleGiftReturn = () => {
    setGameState(game => ({
      ...game,
      player: {
        ...game.player,
        inventory: game.player.inventory.filter(x => x !== 'gift'),
      },
    }));
  };

  const handleSoundToggle = () => {
    audio.paused ? audio.play() : audio.pause();
    setIsPlaying(x => !x);
  };

  const handlePoemOpen = () => {
    audio.pause();
    setIsPlaying(false);
    clearPersistedState();
  };

  const handleStart = () => {
    setGameState(game => ({
      ...game,
      isStarted: true,
    }));
  };

  return (
    <>
      {display.map((row, y) => (
        <Fragment key={y}>
          {row.map((cellPosition, x) => {
            const cell = viewportCells[y][x];
            if (!cell) {
              return null;
            }

            // if (y === ) {
            //   return null;
            // }

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

      {isStarted && (
        <>
          <TransitionGroup>
            {message && (
              <CSSTransition key={message} classNames="message" timeout={2000}>
                <div className="message">{message}</div>
              </CSSTransition>
            )}
          </TransitionGroup>

          {isMapVisible && <Map player={player} maze={maze} />}

          <StatusBar
            inventory={player.inventory}
            jellyLevel={player.jellyLevel}
          />

          {hasGift && (
            <Raffle
              onGiftReturn={handleGiftReturn}
              onPoemOpen={handlePoemOpen}
            />
          )}

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
      )}

      {!isStarted && (
        <div className="intro">
          <div className="intro__flying">
            <h1 className="intro__title">Scarab of Ma</h1>
            <p className="intro__description">Birthday edition</p>
          </div>
          <button className="controls__item" onClick={handleStart}>
            Start
          </button>
        </div>
      )}

      <div className="controls controls_top">
        <button
          type="button"
          tabIndex={-1}
          className={classNames({
            controls__item: true,
            controls__item_mini: true,
            controls__item_sound_on: isPlaying,
            controls__item_sound_off: !isPlaying,
          })}
          onClick={handleSoundToggle}
        />
        {isStarted && (
          <button
            type="button"
            tabIndex={-1}
            className="controls__item controls__item_mini controls__item_map"
            onClick={() => setIsMapVisible(x => !x)}
          />
        )}
      </div>
    </>
  );
};
