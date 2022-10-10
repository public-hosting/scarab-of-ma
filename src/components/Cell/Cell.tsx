import { TCell } from 'lib/maze';

type TCellProps = {
  cell: TCell;
};

export const Cell = (props: TCellProps) => {
  return (
    <div>
      <div className="face face_floor" />
      <div className="face face_ceiling" />
      <div className="face face_north" />
      <div className="face face_south" />
      <div className="face face_east" />
      <div className="face face_west" />
    </div>
  )
};
