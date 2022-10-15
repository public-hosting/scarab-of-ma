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

const FACE_TRANSFORM: {
  [key in TOrientation]: TCoords;
} = {
  north: { x: 0, y: -0.5 },
  south: { x: 0, y: 0.5 },
  east: { x: 0.5, y: 0 },
  west: { x: -0.5, y: 0 },
};

function translateFace(face: TOrientation, position: TCoords): string {
  const orientationDelta = FACE_TRANSFORM[face];
  const translateXVh = (orientationDelta.x + position.x) * 100;
  const translateZVh = (orientationDelta.y + position.y) * 100;

  return `translateX(${translateXVh}vh) translateZ(${translateZVh}vh)`;
}

const TRANSFORM_BY_FACE: {
  [key in TOrientation]: (position: TCoords) => string;
} = {
  north: pos => translateFace('north', pos),
  south: pos => translateFace('south', pos),
  east: pos => `${translateFace('east', pos)} rotateY(-90deg)`,
  west: pos => `${translateFace('west', pos)} rotateY(90deg)`,
};

export const Cell = (props: TCellProps) => {
  const { position, cell, neighbors } = props;

  if (!cell) {
    return null;
  }

  const { walls } = cell;
  const isCameraCell = position.x === 0 && position.y === 0;

  function getFaceStyle(orientation: TOrientation): CSSProperties {
    const prevSide = getNextSide(orientation, 'ccw');
    const nextSide = getNextSide(orientation, 'cw');

    return {
      transform: TRANSFORM_BY_FACE[orientation](position),
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

  function getFaceClasses(face: TWall): string {
    return ['face', `face_${face.type}`].join(' ');
  }

  return (
    <>
      {walls.north && (
        <div
          className={getFaceClasses(walls.north)}
          style={getFaceStyle('north')}
        />
      )}
      {/* south is never visible */}
      {walls.east && (
        <div
          className={getFaceClasses(walls.east)}
          style={getFaceStyle('east')}
        />
      )}
      {walls.west && (
        <div
          className={getFaceClasses(walls.west)}
          style={getFaceStyle('west')}
        />
      )}
    </>
  );
};
