import { Cell } from 'components/Cell/Cell';
import { createMaze } from 'lib/maze';

const maze = createMaze(4);

export const Root = () => {


  return (
    <>
      <Cell cell={maze.cells[0][0]} />
    </>
  );
};
