import { useEffect, useRef } from 'react';
import { TMaze } from 'lib/maze';
import { TPlayer } from 'lib/player';

type TMapProps = {
  maze: TMaze;
  player: TPlayer;
};

const CELL_SIZE = 40;
const WALL_WIDTH = 2;

export const Map = (props: TMapProps) => {
  const { maze, player } = props;
  const sidePx = CELL_SIZE * maze.size;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.clearRect(0, 0, sidePx, sidePx);

        maze.cells.forEach(row => {
          row.forEach(cell => {
            Object.entries(cell.walls).forEach(([side, wall]) => {
              if (wall) {
                if (side === 'north') {
                  ctx.fillRect(
                    cell.x * CELL_SIZE,
                    cell.y * CELL_SIZE,
                    CELL_SIZE,
                    WALL_WIDTH,
                  );
                } else if (side === 'south') {
                  ctx.fillRect(
                    cell.x * CELL_SIZE,
                    cell.y * CELL_SIZE + (CELL_SIZE - WALL_WIDTH),
                    CELL_SIZE,
                    WALL_WIDTH,
                  );
                } else if (side === 'east') {
                  ctx.fillRect(
                    cell.x * CELL_SIZE + (CELL_SIZE - WALL_WIDTH),
                    cell.y * CELL_SIZE,
                    WALL_WIDTH,
                    CELL_SIZE,
                  );
                } else if (side === 'west') {
                  ctx.fillRect(
                    cell.x * CELL_SIZE,
                    cell.y * CELL_SIZE,
                    WALL_WIDTH,
                    CELL_SIZE,
                  );
                }
              }
            });
          });
        });

        ctx.fillRect(
          player.position.x * CELL_SIZE + (CELL_SIZE / 2 - WALL_WIDTH),
          player.position.y * CELL_SIZE + (CELL_SIZE / 2 - WALL_WIDTH),
          WALL_WIDTH * 2,
          WALL_WIDTH * 2,
        );
      }
    }
  }, [maze, player]);

  return (
    <canvas className="map" width={sidePx} height={sidePx} ref={canvasRef} />
  );
};
