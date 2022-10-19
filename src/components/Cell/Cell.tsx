import { CSSProperties } from 'react';
import { TCell, TCoords, TWall } from 'lib/maze';
import { TOrientation, getNextSide } from 'lib/orientation';

type TCellProps = {
  cell: TCell;
  position: TCoords;
  neighbors: {
    [key in TOrientation]: TCell | null;
  };
};

export const Cell = (props: TCellProps) => {
  const {
    cell,
    cell: { walls },
    position: { x, y },
    neighbors,
  } = props;

  const isCameraCell = x === 0 && y === 0;
  const isEastCell = x > 0;
  const isWestCell = x < 0;

  // perf: don't render giant invisible cells
  if (y === 0 && Math.abs(x) > 1) {
    return null;
  }
  const shouldSkipSides = y === 0 &&  Math.abs(x) === 1;

  const style: CSSProperties = {
    transform: `translateX(${x * 100}vh) translateZ(${y * 100}vh)`,
    zIndex: 10 - Math.abs(x) - Math.abs(y),
  };

  function getFaceStyle(orientation: TOrientation): CSSProperties {
    const prevSide = getNextSide(orientation, 'ccw');
    const nextSide = getNextSide(orientation, 'cw');

    return {
      borderLeft:
        !walls[prevSide] && neighbors[prevSide]?.walls[orientation]
          ? 'none'
          : undefined,
      borderRight:
        !walls[nextSide] && neighbors[nextSide]?.walls[orientation]
          ? 'none'
          : undefined,
    };
  }

  function getFaceClasses(side: TOrientation): string {
    return `face face_${side} face_${walls[side]?.type}`;
  }

  return (
    <div className="cell" style={style}>
      {walls.north && (
        <div
          className={getFaceClasses('north')}
          style={getFaceStyle('north')}
        />
      )}
      {/* south is never visible */}
      {!shouldSkipSides && !isWestCell && walls.east && (
        <div className={getFaceClasses('east')} style={getFaceStyle('east')} />
      )}
      {!shouldSkipSides && !isEastCell && walls.west && (
        <div className={getFaceClasses('west')} style={getFaceStyle('west')} />
      )}
      {!shouldSkipSides && !isCameraCell && cell.item && (
        <div className={`item item_${cell.item}`} />
      )}
    </div>
  );
};
