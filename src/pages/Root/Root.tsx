import { Cell } from 'components/Cell/Cell';
import { createMaze } from 'lib/maze';

const maze = createMaze(4);

export const Root = () => {


  return (
    <>
      <Cell cell={maze.cells[0][0]} position={{ x: -1, y: -2 }} />
      <Cell cell={maze.cells[0][0]} position={{ x: 0, y: -2 }} />
      <Cell cell={maze.cells[0][0]} position={{ x: 1, y: -2 }} />
      <Cell cell={maze.cells[0][0]} position={{ x: -1, y: -1 }} />
      <Cell cell={maze.cells[0][0]} position={{ x: 0, y: -1 }} />
      <Cell cell={maze.cells[0][0]} position={{ x: 1, y: -1 }} />
      <Cell cell={maze.cells[0][0]} position={{ x: 0, y: 0 }} />
    </>
  );
};
