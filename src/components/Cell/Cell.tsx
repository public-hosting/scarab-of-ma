import { CSSProperties } from 'react';
import { TCell, TCoords, TOrientation } from 'lib/maze';

type TCellProps = {
  cell: TCell | null;
  position: TCoords;
};

type TFaceType = TOrientation | 'floor' | 'ceiling';

const FACE_TRANSFORM: {
  [key in TFaceType]: TCoords;
} = {
  north: { x: 0, y: -0.5 },
  south: { x: 0, y: 0.5 },
  east: { x: 0.5, y: 0 },
  west: { x: -0.5, y: 0 },
  floor: { x: 0, y: 0 },
  ceiling: { x: 0, y: 0 },
};

function translateFace(face: TFaceType, position: TCoords): string {
  const orientationDelta = FACE_TRANSFORM[face];
  const translateXVh = (orientationDelta.x + position.x) * 100;
  const translateZVh = (orientationDelta.y + position.y) * 100;

  return `translateX(${translateXVh}vh) translateZ(${translateZVh}vh)`;
}

const TRANSFORM_BY_FACE: {
  [key in TFaceType]: (position: TCoords) => string;
} = {
  north: pos => translateFace('north', pos),
  south: pos => translateFace('south', pos),
  east: pos => `${translateFace('east', pos)} rotateY(90deg)`,
  west: pos => `${translateFace('west', pos)} rotateY(-90deg)`,
  floor: pos =>
    `${translateFace('floor', pos)} translateY(50vh) rotateX(90deg)`,
  ceiling: pos =>
    `${translateFace('ceiling', pos)} translateY(-50vh) rotateX(-90deg)`,
};

export const Cell = (props: TCellProps) => {
  const { position, cell } = props;

  if (!cell) {
    return null;
  }

  const isCamera = position.x === 0 && position.y === 0;

  function getFaceStyle(orientation: TFaceType): CSSProperties {
    return {
      transform: TRANSFORM_BY_FACE[orientation](position),
    };
  }

  return (
    <>
      <div className="face" style={getFaceStyle('floor')} />
      <div className="face" style={getFaceStyle('ceiling')} />
      {cell?.walls.north && (
        <div className="face" style={getFaceStyle('north')} />
      )}
      {!isCamera && cell?.walls.south && (
        <div className="face" style={getFaceStyle('south')} />
      )}
      {cell?.walls.east && (
        <div className="face" style={getFaceStyle('east')} />
      )}
      {cell?.walls.west && (
        <div className="face" style={getFaceStyle('west')} />
      )}
    </>
  );
};
