import { useEffect, useRef, useState } from 'react';

import { getNeighbors, TCell, TCoords, TNeighborCells } from 'lib/maze';
import { TDisplay } from 'lib/viewport';
import { times } from 'lib/utils';
import { getNextSide, TOrientation } from 'lib/orientation';
import { TAsset, TLoadedAssets } from 'hooks/useAssetsLoad';

type TMazeRenderProps = {
  display: TDisplay;
  viewportCells: (TCell | null)[][];
  assets: TLoadedAssets;
};

const DP = 1024;

function getRenderOrderFromEdges<T>(arr: T[]): number[] {
  const lastIndex = arr.length - 1;
  const centerIndex = lastIndex / 2;
  const renderingOrder = [];
  times(centerIndex, prevIndex => {
    renderingOrder.push(prevIndex, lastIndex - prevIndex);
  });
  renderingOrder.push(centerIndex);

  return renderingOrder;
}

type TFaceCorner = TCoords;
type TFaceCorners = [TFaceCorner, TFaceCorner, TFaceCorner, TFaceCorner];

type T3dPointInfo = {
  faceSizePx: number;
  // in maze coords system
  position: TCoords;
};

/**
 * Source curves to compute intersection
 *
 * function y1(x: number, cellX: number): number {
 *   return (1 / (1 + 2 * cellX)) * x;
 * }
 *
 * function y2(x: number): number {
 *   return (x - DP) / (1 - (2 * z) / faceSizePx - (2 * DP) / faceSizePx + 2 * position.x);
 * }
 *
 * function esX(cellX: number): number {
 *   return (faceSizePx * DP * (1 + 2 * cellX)) / (2 * z + 2 * DP);
 * }
 */
function project3dPoint(options: T3dPointInfo): TCoords {
  const { faceSizePx, position } = options;
  // const cameraDistance = faceSizePx / 2;
  const cameraDistance = 0;

  const z = -1 * (position.y * faceSizePx) + cameraDistance;
  const x = (faceSizePx * DP * (1 + 2 * position.x)) / (2 * z + 2 * DP);
  const y = (1 / (1 + 2 * position.x)) * x;

  return { x, y };
}

function getFaceCorners(
  cell: TCell,
  position: TCoords,
  side: TOrientation,
  faceSizePx: number,
): TFaceCorners {
  if (side === 'north') {
    const a = project3dPoint({
      faceSizePx,
      position: {
        x: position.x,
        y: position.y - 1,
      },
    });
    const b = project3dPoint({
      faceSizePx,
      position: {
        x: position.x - 1,
        y: position.y - 1,
      },
    });

    return [a, b, { x: b.x, y: -b.y }, { x: a.x, y: -a.y }];
  } else if (side === 'east') {
    const a = project3dPoint({
      faceSizePx,
      position: {
        x: position.x,
        y: position.y - 1,
      },
    });
    const b = project3dPoint({
      faceSizePx,
      position: {
        x: position.x,
        y: position.y,
      },
    });

    return [b, a, { x: a.x, y: -a.y }, { x: b.x, y: -b.y }];
  } else if (side === 'west') {
    const a = project3dPoint({
      faceSizePx,
      position: {
        x: position.x - 1,
        y: position.y - 1,
      },
    });
    const b = project3dPoint({
      faceSizePx,
      position: {
        x: position.x - 1,
        y: position.y,
      },
    });

    return [a, b, { x: b.x, y: -b.y }, { x: a.x, y: -a.y }];
  } else if (side === 'south') {
    const a = project3dPoint({
      faceSizePx,
      position: {
        x: position.x,
        y: position.y,
      },
    });
    const b = project3dPoint({
      faceSizePx,
      position: {
        x: position.x - 1,
        y: position.y,
      },
    });

    return [a, b, { x: b.x, y: -b.y }, { x: a.x, y: -a.y }];
  }

  throw new Error(`Unsupported side "${side}"`);
}

function fillFace(ctx: CanvasRenderingContext2D, corners: TFaceCorners): void {
  const [a, b, c, d] = corners;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(c.x, c.y);
  ctx.lineTo(d.x, d.y);
  ctx.lineTo(a.x, a.y);
  ctx.fillStyle = '#fff';
  ctx.fill();
  // todo replace with inner stroke
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 6;
  ctx.stroke();
}

function drawEdge(ctx: CanvasRenderingContext2D, a: TCoords, b: TCoords): void {
  ctx.beginPath();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 6;
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.closePath();
  ctx.stroke();
}

function getFaceEdges(
  cell: TCell,
  face: TOrientation,
  neighbors: TNeighborCells,
): { east: boolean; west: boolean } {
  const { walls } = cell;
  const prevSide = getNextSide(face, 'ccw');
  const nextSide = getNextSide(face, 'cw');

  return {
    east: !(!walls[nextSide] && neighbors[nextSide]?.walls[face]),
    west: !(!walls[prevSide] && neighbors[prevSide]?.walls[face]),
  };
}

function renderCell(
  ctx: CanvasRenderingContext2D,
  cell: TCell,
  position: TCoords,
  faceSizePx: number,
  viewport: TCoords,
  neighbors: TNeighborCells,
  assets: TLoadedAssets,
): void {
  (Object.keys(cell.walls) as TOrientation[]).forEach(side => {
    if (side === 'south' || !cell.walls[side]) {
      return;
    }

    const [a, b, c, d] = getFaceCorners(cell, position, side, faceSizePx).map(
      coords => ({
        x: coords.x + viewport.x / 2,
        y: coords.y + viewport.y / 2,
      }),
    );

    fillFace(ctx, [a, b, c, d]);

    const faceType = cell.walls[side]?.type;
    if (faceType && faceType !== 'plain') {
      if (side === 'north') {
        drawItem(ctx, faceType, [a, b, c, d], assets);
      } else if (!(position.x === 0 && position.y === 0)) {
        drawItem(
          ctx,
          `${faceType}-${side}`,
          side === 'east'
            ? [a, { x: b.x, y: a.y }, { x: c.x, y: d.y }, d]
            : [{ x: a.x, y: b.y }, b, c, { x: a.x, y: c.y }],
          assets,
        );
      }
    }

    drawEdge(ctx, a, b);
    drawEdge(ctx, c, d);

    const { west, east } = getFaceEdges(cell, side, neighbors);

    if (west) {
      drawEdge(ctx, b, c);
    }

    if (east) {
      drawEdge(ctx, a, d);
    }
  });

  if (cell.item && !(position.x === 0 && position.y === 0)) {
    const [a, b, c, d] = getFaceCorners(
      cell,
      position,
      'south',
      faceSizePx,
    ).map(coords => ({
      x: coords.x + viewport.x / 2,
      y: coords.y + viewport.y / 2,
    }));

    drawItem(ctx, cell.item, [a, b, c, d], assets);
  }
}

function drawItem(
  ctx: CanvasRenderingContext2D,
  itemType: TAsset,
  [a, b, c, d]: TFaceCorners,
  assets: TLoadedAssets,
): void {
  const img = assets[itemType];
  ctx.drawImage(
    img,
    0,
    0,
    img.width,
    img.height,
    c.x,
    c.y,
    d.x - c.x,
    b.y - c.y,
  );
}

export const MazeRender = (props: TMazeRenderProps) => {
  const { viewportCells, display, assets } = props;

  const [viewportSize, setViewportSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize, false);

    return () => {
      window.removeEventListener('resize', handleResize, false);
    };
  }, []);

  const renderWidth = viewportSize.width * 2;
  const renderHeight = viewportSize.height * 2;
  const faceSize = Math.max(renderWidth, renderHeight);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, renderWidth, renderHeight);

        display.forEach((row, y) => {
          const renderingOrder = getRenderOrderFromEdges(row);

          renderingOrder.forEach(x => {
            const coords = row[x];
            const cell = viewportCells[y][x];

            if (cell) {
              renderCell(
                ctx,
                cell,
                coords,
                faceSize,
                {
                  x: renderWidth,
                  y: renderHeight,
                },
                getNeighbors({ x, y }, viewportCells),
                assets,
              );
            }
          });
        });
      }
    }
  }, [viewportCells, display, viewportSize]);

  return (
    <canvas
      className="render"
      ref={canvasRef}
      width={renderWidth}
      height={renderHeight}
    />
  );
};
