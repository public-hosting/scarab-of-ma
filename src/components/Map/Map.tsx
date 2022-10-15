import { useEffect, useRef } from 'react';
import { TCoords, TMaze } from 'lib/maze';
import { TOrientation } from 'lib/orientation';
import { TPlayer } from 'lib/player';

type TMapProps = {
  maze: TMaze;
  player: TPlayer;
};

const CELL_SIZE = 40;
const WALL_WIDTH = 2;

const ORIENTATION_VECTOR: { [key in TOrientation]: TCoords } = {
  north: { x: 0, y: -1 },
  south: { x: 0, y: 1 },
  east: { x: 1, y: 0 },
  west: { x: -1, y: 0 },
};

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

        const playerCenterX = player.position.x * CELL_SIZE + CELL_SIZE / 2;
        const playerCenterY = player.position.y * CELL_SIZE + CELL_SIZE / 2;

        ctx.fillRect(
          playerCenterX - WALL_WIDTH,
          playerCenterY - WALL_WIDTH,
          WALL_WIDTH * 2,
          WALL_WIDTH * 2,
        );

        const orientationVector = ORIENTATION_VECTOR[player.orientation];
        ctx.beginPath();
        ctx.arc(
          playerCenterX + (orientationVector.x * CELL_SIZE) / 3,
          playerCenterY + (orientationVector.y * CELL_SIZE) / 3,
          WALL_WIDTH * 2,
          0,
          2 * Math.PI,
        );
        ctx.fillStyle = 'green';
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.closePath();
      }
    }
  }, [maze, player]);

  return (
    <canvas className="map" width={sidePx} height={sidePx} ref={canvasRef} />
  );
};
