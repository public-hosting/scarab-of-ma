import { CSSProperties } from 'react';
import { TCell, TCoords, TWall } from 'lib/maze';
import { TOrientation, getNextSide } from 'lib/orientation';

type TCellProps = {
  cell: TCell | null;
  position: TCoords;
  neighbors: {
    [key in TOrientation]: TCell | null;
  };
};

export const Cell = (props: TCellProps) => {
  const { position, cell, neighbors } = props;

  if (!cell) {
    return null;
  }

  const { walls } = cell;
  const isCameraCell = position.x === 0 && position.y === 0;

  const style: CSSProperties = {
    transform: `translateX(${position.x * 100}vh) translateZ(${
      position.y * 100
    }vh)`,
  };

  function getFaceStyle(orientation: TOrientation): CSSProperties {
    const prevSide = getNextSide(orientation, 'ccw');
    const nextSide = getNextSide(orientation, 'cw');

    return {
      borderLeft:
        !cell?.walls[prevSide] && neighbors[prevSide]?.walls[orientation]
          ? 'none'
          : undefined,
      borderRight:
        !cell?.walls[nextSide] && neighbors[nextSide]?.walls[orientation]
          ? 'none'
          : undefined,
      zIndex: isCameraCell ? 10 : undefined,
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
      {walls.east && (
        <div className={getFaceClasses('east')} style={getFaceStyle('east')} />
      )}
      {walls.west && (
        <div className={getFaceClasses('west')} style={getFaceStyle('west')} />
      )}
      {cell.item && <div className={`item item_${cell.item}`} />}
    </div>
  );
};
