export type TOrientation = 'west' | 'east' | 'north' | 'south';

export const OPPOSITE_SIDE: { [key in TOrientation]: TOrientation } = {
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east',
};

export const TURN_ORDER: TOrientation[] = ['north', 'east', 'south', 'west'];

export type TRotation = 'cw' | 'ccw';

export function getNextSide(currentSide: TOrientation, direction: TRotation): TOrientation {
  const delta = direction === 'cw' ? 1 : -1;

  let nextSideIndex = TURN_ORDER.indexOf(currentSide) + delta;
  if (nextSideIndex >= TURN_ORDER.length) {
    nextSideIndex = nextSideIndex % TURN_ORDER.length;
  } else if (nextSideIndex < 0) {
    nextSideIndex = TURN_ORDER.length + (nextSideIndex % TURN_ORDER.length);
  }

  return TURN_ORDER[nextSideIndex];
}
